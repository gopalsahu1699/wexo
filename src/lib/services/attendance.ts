import { createClient } from "@/lib/supabase";
import { AttendanceRecord } from "@/lib/types";

export async function getAttendance(startDate: string, endDate: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('staff_attendance')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate);

    if (error) {
        console.error('Error fetching attendance:', error);
        return [];
    }
    return data as any as AttendanceRecord[];
}

export async function markAttendance(staffId: string, date: string, status: AttendanceRecord['status'], overtime_hours: number = 0) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    // Check if record exists
    const { data: existing } = await supabase
        .from('staff_attendance')
        .select('id')
        .eq('staff_id', staffId)
        .eq('date', date)
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
                user_id: user.id
            });
        if (error) throw error;
    }
}
