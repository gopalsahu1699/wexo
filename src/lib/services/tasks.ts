import { createClient } from "@/lib/supabase";
import { TaskAssignment, TaskComment, TaskStatusLog, TaskStatus, TaskPriority } from "@/lib/types";
import { getStaffSession } from "./auth-role";

// ─────────────────────────────────────────────────────────────
// CREATE TASK (Admin or Manager)
// ─────────────────────────────────────────────────────────────

interface CreateTaskInput {
    assigned_by: string;    // staff_member id of the person assigning
    assigned_to: string;    // staff_member id receiving the task
    title: string;
    description?: string;
    priority?: TaskPriority;
    category?: string;
    service_address?: string;
    customer_name?: string;
    customer_phone?: string;
    deadline?: string;
    scheduled_date?: string;
    estimated_hours?: number;
    estimated_cost?: number;
    job_id?: string;
    google_maps_url?: string;
}

export async function createTask(input: CreateTaskInput): Promise<TaskAssignment | null> {
    const supabase = createClient();
    
    // Determine the owner ID (either from auth user or staff session)
    let ownerId: string | null = null;
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
        ownerId = user.id;
    } else {
        const staff = getStaffSession();
        if (staff) {
            ownerId = staff.ownerId;
        }
    }

    if (!ownerId) return null;

    const { data, error } = await supabase
        .from("task_assignments")
        .insert({
            user_id: ownerId,
            assigned_by: input.assigned_by,
            assigned_to: input.assigned_to,
            title: input.title,
            description: input.description || null,
            priority: input.priority || "medium",
            category: input.category || null,
            service_address: input.service_address || null,
            customer_name: input.customer_name || null,
            customer_phone: input.customer_phone || null,
            deadline: input.deadline || null,
            scheduled_date: input.scheduled_date || null,
            estimated_hours: input.estimated_hours || 0,
            estimated_cost: input.estimated_cost || 0,
            job_id: input.job_id || null,
            google_maps_url: input.google_maps_url || null,
            status: "pending",
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating task:", error.message || error);
        return null;
    }

    // Log the status change
    await logTaskStatus(ownerId, data.id, input.assigned_by, null, "pending", "Task created");

    return data;
}

// ─────────────────────────────────────────────────────────────
// GET TASKS (with filters)
// ─────────────────────────────────────────────────────────────

export async function getTasksAssignedTo(staffId: string, ownerId?: string): Promise<TaskAssignment[]> {
    const supabase = createClient();

    let query = supabase
        .from("task_assignments")
        .select(`
            *,
            assigned_by_worker:staff_members!task_assignments_assigned_by_fkey(id, name),
            assigned_to_worker:staff_members!task_assignments_assigned_to_fkey(id, name)
        `)
        .eq("assigned_to", staffId);

    if (ownerId) {
        query = query.eq("user_id", ownerId);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching tasks assigned to:", error);
        return [];
    }
    return data || [];
}

export async function getTasksAssignedBy(staffId: string, ownerId?: string): Promise<TaskAssignment[]> {
    const supabase = createClient();

    let query = supabase
        .from("task_assignments")
        .select(`
            *,
            assigned_by_worker:staff_members!task_assignments_assigned_by_fkey(id, name),
            assigned_to_worker:staff_members!task_assignments_assigned_to_fkey(id, name)
        `)
        .eq("assigned_by", staffId);

    if (ownerId) {
        query = query.eq("user_id", ownerId);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching tasks assigned by:", error);
        return [];
    }
    return data || [];
}

/**
 * Fetch all tasks for a manager's team (everyone reporting to them)
 */
export async function getTeamTasksForManager(managerId: string, ownerId?: string): Promise<TaskAssignment[]> {
    const supabase = createClient();

    // 1. Get all staff members reporting to this manager
    const { data: teamMembers } = await supabase
        .from("staff_members")
        .select("id")
        .eq("manager_id", managerId);

    const teamIds = teamMembers?.map(m => m.id) || [];

    // If no team members, only look for tasks assigned by the manager
    let filter = `assigned_by.eq.${managerId}`;
    if (teamIds.length > 0) {
        filter += `,assigned_to.in.(${teamIds.join(',')})`;
    }
    
    // 2. Fetch tasks
    let query = supabase
        .from("task_assignments")
        .select(`
            *,
            assigned_by_worker:staff_members!task_assignments_assigned_by_fkey(id, name),
            assigned_to_worker:staff_members!task_assignments_assigned_to_fkey(id, name)
        `)
        .or(filter);

    if (ownerId) {
        query = query.eq("user_id", ownerId);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching team tasks:", error);
        return [];
    }
    return data || [];
}

export async function getAllTasks(): Promise<TaskAssignment[]> {
    const supabase = createClient();
    let ownerId: string | null = null;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        ownerId = user.id;
    } else {
        const staff = getStaffSession();
        if (staff) ownerId = staff.ownerId;
    }

    if (!ownerId) return [];

    const { data, error } = await supabase
        .from("task_assignments")
        .select(`
            *,
            assigned_by_worker:staff_members!task_assignments_assigned_by_fkey(id, name),
            assigned_to_worker:staff_members!task_assignments_assigned_to_fkey(id, name)
        `)
        .eq("user_id", ownerId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching all tasks:", error);
        return [];
    }
    return data || [];
}

export async function getTaskById(taskId: string, ownerId?: string): Promise<TaskAssignment | null> {
    const supabase = createClient();

    let query = supabase
        .from("task_assignments")
        .select(`
            *,
            assigned_by_worker:staff_members!task_assignments_assigned_by_fkey(id, name, phone, hierarchy_role),
            assigned_to_worker:staff_members!task_assignments_assigned_to_fkey(id, name, phone, hierarchy_role)
        `)
        .eq("id", taskId);

    if (ownerId) {
        query = query.eq("user_id", ownerId);
    }

    const { data, error } = await query.single();

    if (error) {
        console.error("Error fetching task:", error);
        return null;
    }
    return data;
}

// ─────────────────────────────────────────────────────────────
// UPDATE TASK STATUS (Accept, Reject, Complete, Verify)
// ─────────────────────────────────────────────────────────────

export async function updateTaskStatus(
    taskId: string,
    newStatus: TaskStatus,
    changedBy: string,
    extras?: {
        rejection_reason?: string;
        completion_notes?: string;
        work_photos?: string[];
        actual_hours?: number;
        actual_cost?: number;
        ownerId?: string; // Explicit ownerId for RLS
    }
): Promise<boolean> {
    const supabase = createClient();

    // Get old status, user_id, and estimated_cost for logic/logging
    let query = supabase
        .from("task_assignments")
        .select("status, user_id, estimated_cost, actual_cost")
        .eq("id", taskId);
    
    if (extras?.ownerId) {
        query = query.eq("user_id", extras.ownerId);
    }

    const { data: task } = await query.single();

    if (!task) return false;

    const updateData: Record<string, unknown> = { status: newStatus };

    // Default actual_cost to estimated_cost if verifying and not set (handle null or 0)
    if (newStatus === "verified" && extras?.actual_cost === undefined && (!task.actual_cost || Number(task.actual_cost) === 0)) {
        updateData.actual_cost = task.estimated_cost;
    }

    // Add timestamps based on status
    if (newStatus === "in_progress") updateData.started_at = new Date().toISOString();
    if (newStatus === "completed") updateData.completed_at = new Date().toISOString();
    if (newStatus === "verified") updateData.verified_at = new Date().toISOString();

    // Add extras
    if (extras?.rejection_reason) updateData.rejection_reason = extras.rejection_reason;
    if (extras?.completion_notes) updateData.completion_notes = extras.completion_notes;
    if (extras?.work_photos) updateData.work_photos = extras.work_photos;
    if (extras?.actual_hours !== undefined) updateData.actual_hours = extras.actual_hours;
    if (extras?.actual_cost !== undefined) updateData.actual_cost = extras.actual_cost;

    const { error } = await supabase
        .from("task_assignments")
        .update(updateData)
        .eq("id", taskId);

    if (error) {
        console.error("Error updating task status:", error);
        return false;
    }

    // Log status change
    await logTaskStatus(task.user_id, taskId, changedBy, task.status, newStatus);

    return true;
}

// ─────────────────────────────────────────────────────────────
// UPDATE TASK (Edit Task)
// ─────────────────────────────────────────────────────────────

export async function updateTask(taskId: string, input: Partial<CreateTaskInput>, ownerId?: string): Promise<boolean> {
    const supabase = createClient();
    
    // Convert undefined to null or just pass the defined properties
    const updateData: Record<string, unknown> = {};
    if (input.assigned_to !== undefined) updateData.assigned_to = input.assigned_to;
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description || null;
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.category !== undefined) updateData.category = input.category || null;
    if (input.service_address !== undefined) updateData.service_address = input.service_address || null;
    if (input.customer_name !== undefined) updateData.customer_name = input.customer_name || null;
    if (input.customer_phone !== undefined) updateData.customer_phone = input.customer_phone || null;
    if (input.deadline !== undefined) updateData.deadline = input.deadline || null;
    if (input.estimated_hours !== undefined) updateData.estimated_hours = input.estimated_hours || 0;
    if (input.estimated_cost !== undefined) updateData.estimated_cost = input.estimated_cost || 0;
    if (input.google_maps_url !== undefined) updateData.google_maps_url = input.google_maps_url || null;

    if (Object.keys(updateData).length === 0) return true;

    let query = supabase
        .from("task_assignments")
        .update(updateData)
        .eq("id", taskId);

    if (ownerId) {
        query = query.eq("user_id", ownerId);
    }

    const { error } = await query;

    if (error) {
        console.error("Error updating task:", error.message || error);
        return false;
    }

    return true;
}

// ─────────────────────────────────────────────────────────────
// DELETE TASK
// ─────────────────────────────────────────────────────────────

export async function deleteTask(taskId: string, ownerId?: string): Promise<boolean> {
    const supabase = createClient();
    let query = supabase.from("task_assignments").delete().eq("id", taskId);
    
    if (ownerId) {
        query = query.eq("user_id", ownerId);
    }

    const { error } = await query;
    if (error) {
        console.error("Error deleting task:", error);
        return false;
    }
    return true;
}


// ─────────────────────────────────────────────────────────────
// TASK COMMENTS
// ─────────────────────────────────────────────────────────────

export async function getTaskComments(taskId: string): Promise<TaskComment[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("task_comments")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error fetching comments:", error);
        return [];
    }
    return data || [];
}

export async function addTaskComment(
    taskId: string,
    authorStaffId: string | null,
    authorName: string,
    message: string,
    ownerId: string
): Promise<TaskComment | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("task_comments")
        .insert({
            user_id: ownerId,
            task_id: taskId,
            author_staff_id: authorStaffId,
            author_name: authorName,
            message,
        })
        .select()
        .single();

    if (error) {
        console.error("Error adding comment:", error);
        return null;
    }
    return data;
}

// ─────────────────────────────────────────────────────────────
// STATUS LOG (audit trail)
// ─────────────────────────────────────────────────────────────

async function logTaskStatus(
    userId: string,
    taskId: string,
    changedBy: string | null,
    oldStatus: string | null,
    newStatus: string,
    notes?: string
): Promise<void> {
    const supabase = createClient();

    await supabase.from("task_status_log").insert({
        user_id: userId,
        task_id: taskId,
        changed_by: changedBy,
        old_status: oldStatus,
        new_status: newStatus,
        notes: notes || null,
    });
}

export async function getTaskStatusLog(taskId: string): Promise<TaskStatusLog[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("task_status_log")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error fetching status log:", error);
        return [];
    }
    return data || [];
}

// ─────────────────────────────────────────────────────────────
// TASK STATS (for dashboards)
// ─────────────────────────────────────────────────────────────

export interface TaskStats {
    total: number;
    pending: number;
    accepted: number;
    in_progress: number;
    completed: number;
    verified: number;
    rejected: number;
    overdue: number;
    totalEarnings: number;
    paidEarnings: number;
}

export async function getTaskStats(staffId?: string, role?: 'assigned_to' | 'assigned_by', ownerId?: string): Promise<TaskStats> {
    const supabase = createClient();
    
    let currentOwnerId = ownerId;
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
        currentOwnerId = user.id;
    } else if (!currentOwnerId) {
        const staff = getStaffSession();
        if (staff) currentOwnerId = staff.ownerId;
    }

    if (!currentOwnerId) {
         return { total: 0, pending: 0, accepted: 0, in_progress: 0, completed: 0, verified: 0, rejected: 0, overdue: 0, totalEarnings: 0, paidEarnings: 0 };
    }

    let query = supabase
        .from("task_assignments")
        .select("status, deadline, actual_cost")
        .eq("user_id", currentOwnerId);

    if (staffId && role === 'assigned_to') {
        query = query.eq("assigned_to", staffId);
    } else if (staffId && role === 'assigned_by') {
        query = query.eq("assigned_by", staffId);
    }

    const { data, error } = await query;

    if (error || !data) {
        return { total: 0, pending: 0, accepted: 0, in_progress: 0, completed: 0, verified: 0, rejected: 0, overdue: 0, totalEarnings: 0, paidEarnings: 0 };
    }

    const today = new Date().toISOString().split('T')[0];
    const stats: TaskStats = {
        total: data.length,
        pending: 0,
        accepted: 0,
        in_progress: 0,
        completed: 0,
        verified: 0,
        rejected: 0,
        overdue: 0,
        totalEarnings: 0,
        paidEarnings: 0
    };

    data.forEach((task) => {
        const s = task.status as string;
        if (s === 'pending') stats.pending++;
        else if (s === 'accepted') stats.accepted++;
        else if (s === 'in_progress') stats.in_progress++;
        else if (s === 'completed') stats.completed++;
        else if (s === 'verified') {
            stats.verified++;
            stats.totalEarnings += Number(task.actual_cost || 0);
        }
        else if (s === 'rejected') stats.rejected++;
        
        // Count overdue: not completed and past deadline
        if (task.deadline && task.deadline < today && !['completed', 'verified', 'rejected'].includes(s)) {
            stats.overdue++;
        }
    });

    // 2. Fetch payments made to this staff to calculate "Paid Balance"
    if (staffId) {
        const { data: payments } = await supabase
            .from('payments')
            .select('amount')
            .eq('staff_id', staffId)
            .eq('type', 'payment_out');
        
        const totalPaid = payments?.reduce((acc, p) => acc + (Number(p.amount) || 0), 0) || 0;
        stats.paidEarnings = totalPaid;
    }

    return stats;
}
