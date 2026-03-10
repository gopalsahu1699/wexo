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
