import { createClient } from "@/lib/supabase";
import { Worker } from "@/lib/types";
import { getStaffSession } from "./auth-role";

export async function getWorkers() {
    const supabase = createClient();
    
    // 1. Check for Admin first
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data, error } = await supabase
            .from('staff_members')
            .select('*')
            .eq('user_id', user.id)
            .order('name');

        if (error) {
            console.error('Error fetching workers as admin:', error);
            return [];
        }
        return data as any as Worker[];
    }

    // 2. Check for Staff session
    const staff = getStaffSession();
    if (staff && staff.ownerId) {
        const { data, error } = await supabase
            .from('staff_members')
            .select('*')
            .eq('user_id', staff.ownerId)
            .order('name');

        if (error) {
            console.error('Error fetching workers as staff:', error);
            return [];
        }
        return data as any as Worker[];
    }

    return [];
}

export async function getWorker(id: string) {
    const supabase = createClient();
    
    // Check for Admin
    const { data: { user } } = await supabase.auth.getUser();
    let query = supabase.from('staff_members').select('*').eq('id', id);
    
    if (user) {
        query = query.eq('user_id', user.id);
    } else {
        // Check for Staff
        const staff = getStaffSession();
        if (staff && staff.ownerId) {
            query = query.eq('user_id', staff.ownerId);
        } else {
            return null;
        }
    }

    const { data, error } = await query.single();

    if (error) {
        console.error('Error fetching worker:', error);
        return null;
    }
    return data as any as Worker;
}

export async function addWorker(worker: Partial<Worker>) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    let ownerId: string | null = null;
    
    if (user) {
        ownerId = user.id;
    } else {
        const staff = getStaffSession();
        if (staff && staff.role === 'manager') {
            ownerId = staff.ownerId;
        }
    }

    if (!ownerId) throw new Error('Not authorized to add staff');

    const { data, error } = await supabase
        .from('staff_members')
        .insert([{ ...worker, user_id: ownerId }])
        .select()
        .single();

    if (error) throw error;
    return data as any as Worker;
}

export async function updateWorker(id: string, worker: Partial<Worker>) {
    const supabase = createClient();
    
    // Check Admin
    const { data: { user } } = await supabase.auth.getUser();
    let ownerId: string | null = null;
    
    if (user) {
        ownerId = user.id;
    } else {
        const staff = getStaffSession();
        if (staff && staff.role === 'manager') {
            ownerId = staff.ownerId;
        }
    }

    if (!ownerId) throw new Error('Not authorized to update staff');

    const { data, error } = await supabase
        .from('staff_members')
        .update(worker)
        .eq('id', id)
        .eq('user_id', ownerId)
        .select()
        .single();

    if (error) throw error;
    return data as any as Worker;
}

export async function deleteWorker(id: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    let ownerId: string | null = null;
    
    if (user) {
        ownerId = user.id;
    } else {
        const staff = getStaffSession();
        if (staff && staff.role === 'manager') {
            ownerId = staff.ownerId;
        }
    }

    if (!ownerId) throw new Error('Not authorized to delete staff');

    const { error } = await supabase
        .from('staff_members')
        .delete()
        .eq('id', id)
        .eq('user_id', ownerId);

    if (error) throw error;
    return true;
}
