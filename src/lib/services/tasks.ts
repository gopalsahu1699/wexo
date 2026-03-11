import { createClient } from "@/lib/supabase";
import { TaskAssignment, TaskComment, TaskStatusLog, TaskStatus, TaskPriority } from "@/lib/types";

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
}

export async function createTask(input: CreateTaskInput): Promise<TaskAssignment | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from("task_assignments")
        .insert({
            user_id: user.id,
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
            status: "pending",
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating task:", error);
        return null;
    }

    // Log the status change
    await logTaskStatus(user.id, data.id, input.assigned_by, null, "pending", "Task created");

    return data;
}

// ─────────────────────────────────────────────────────────────
// GET TASKS (with filters)
// ─────────────────────────────────────────────────────────────

export async function getTasksAssignedTo(staffId: string): Promise<TaskAssignment[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("task_assignments")
        .select(`
            *,
            assigned_by_worker:staff_members!task_assignments_assigned_by_fkey(id, name, phone, hierarchy_role),
            assigned_to_worker:staff_members!task_assignments_assigned_to_fkey(id, name, phone, hierarchy_role)
        `)
        .eq("assigned_to", staffId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching tasks assigned to:", error);
        return [];
    }
    return data || [];
}

export async function getTasksAssignedBy(staffId: string): Promise<TaskAssignment[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("task_assignments")
        .select(`
            *,
            assigned_by_worker:staff_members!task_assignments_assigned_by_fkey(id, name, phone, hierarchy_role),
            assigned_to_worker:staff_members!task_assignments_assigned_to_fkey(id, name, phone, hierarchy_role)
        `)
        .eq("assigned_by", staffId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching tasks assigned by:", error);
        return [];
    }
    return data || [];
}

export async function getAllTasks(): Promise<TaskAssignment[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("task_assignments")
        .select(`
            *,
            assigned_by_worker:staff_members!task_assignments_assigned_by_fkey(id, name, phone, hierarchy_role),
            assigned_to_worker:staff_members!task_assignments_assigned_to_fkey(id, name, phone, hierarchy_role)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching all tasks:", error);
        return [];
    }
    return data || [];
}

export async function getTaskById(taskId: string): Promise<TaskAssignment | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("task_assignments")
        .select(`
            *,
            assigned_by_worker:staff_members!task_assignments_assigned_by_fkey(id, name, phone, hierarchy_role),
            assigned_to_worker:staff_members!task_assignments_assigned_to_fkey(id, name, phone, hierarchy_role)
        `)
        .eq("id", taskId)
        .single();

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
    }
): Promise<boolean> {
    const supabase = createClient();

    // Get old status for logging
    const { data: task } = await supabase
        .from("task_assignments")
        .select("status, user_id")
        .eq("id", taskId)
        .single();

    if (!task) return false;

    const updateData: Record<string, unknown> = { status: newStatus };

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
}

export async function getTaskStats(staffId?: string, role?: 'assigned_to' | 'assigned_by'): Promise<TaskStats> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
        .from("task_assignments")
        .select("status, deadline");

    if (user) {
        query = query.eq("user_id", user.id);
    }

    if (staffId && role === 'assigned_to') {
        query = query.eq("assigned_to", staffId);
    } else if (staffId && role === 'assigned_by') {
        query = query.eq("assigned_by", staffId);
    }

    const { data, error } = await query;

    if (error || !data) {
        return { total: 0, pending: 0, accepted: 0, in_progress: 0, completed: 0, verified: 0, rejected: 0, overdue: 0 };
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
    };

    data.forEach((task) => {
        const s = task.status as string;
        if (s === 'pending') stats.pending++;
        else if (s === 'accepted') stats.accepted++;
        else if (s === 'in_progress') stats.in_progress++;
        else if (s === 'completed') stats.completed++;
        else if (s === 'verified') stats.verified++;
        else if (s === 'rejected') stats.rejected++;
        // Count overdue: not completed and past deadline
        if (task.deadline && task.deadline < today && !['completed', 'verified', 'rejected'].includes(s)) {
            stats.overdue++;
        }
    });

    return stats;
}
