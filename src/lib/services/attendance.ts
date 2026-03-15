import { createClient } from "@/lib/supabase";
import { AttendanceRecord } from "@/lib/types";
import { getStaffSession } from "./auth-role";

// Helper to get the effective owner ID (admin auth OR staff session)
async function getOwnerId(): Promise<string | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) return user.id;

    const staff = getStaffSession();
    if (staff) return staff.ownerId;

    return null;
}

export async function getAttendance(startDate: string, endDate: string, staffId?: string) {
    const supabase = createClient();
    const ownerId = await getOwnerId();
    if (!ownerId) return [];

    let query = supabase
        .from('staff_attendance')
        .select('*')
        .eq('user_id', ownerId)
        .gte('date', startDate)
        .lte('date', endDate);

    // If a specific staffId is passed, filter by it (for viewing own attendance)
    if (staffId) {
        query = query.eq('staff_id', staffId);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) {
        console.error('Error fetching attendance:', error);
        return [];
    }
    return data as any as AttendanceRecord[];
}

export async function getMyAttendance(startDate: string, endDate: string) {
    const staff = getStaffSession();
    if (!staff) return [];
    return getAttendance(startDate, endDate, staff.staffId);
}

export async function markAttendance(staffId: string, date: string, status: AttendanceRecord['status'], overtime_hours: number = 0) {
    const supabase = createClient();
    const ownerId = await getOwnerId();
    if (!ownerId) throw new Error('Not authenticated');

    // Only admin and manager can mark attendance
    const staff = getStaffSession();
    if (staff && staff.role === 'team_member') {
        throw new Error('Team members cannot mark attendance');
    }

    // Check if record exists
    const { data: existing } = await supabase
        .from('staff_attendance')
        .select('id')
        .eq('staff_id', staffId)
        .eq('date', date)
        .eq('user_id', ownerId)
        .single();

    if (existing) {
        const { error } = await supabase
            .from('staff_attendance')
            .update({ status, overtime_hours })
            .eq('id', existing.id);
        if (error) throw error;
    } else {
        const { error } = await supabase
            .from('staff_attendance')
            .insert({
                staff_id: staffId,
                date,
                status,
                overtime_hours,
                user_id: ownerId
            });
        if (error) throw error;
    }
}
