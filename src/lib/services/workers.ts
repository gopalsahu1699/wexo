import { createClient } from "@/lib/supabase";
import { Worker } from "@/lib/types";

export async function getWorkers() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('staff_members')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error fetching workers:', error);
        return [];
    }
    return data as any as Worker[];
}

export async function getWorker(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('staff_members')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching worker:', error);
        return null;
    }
    return data as any as Worker;
}

export async function addWorker(worker: Partial<Worker>) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('staff_members')
        .insert([{ ...worker, user_id: user.id }])
        .select()
        .single();

    if (error) throw error;
    return data as any as Worker;
}

export async function updateWorker(id: string, worker: Partial<Worker>) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('staff_members')
        .update(worker)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as any as Worker;
}

export async function deleteWorker(id: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
        .from('staff_members')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
}
