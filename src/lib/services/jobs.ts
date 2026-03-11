import { createClient } from "@/lib/supabase";
import { Job } from "@/lib/types";

export async function getJobs() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching jobs:', error);
        return [];
    }
    return data as any as Job[];
}

export async function getJob(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching job:', error);
        return null;
    }
    return data as any as Job;
}

export async function createJob(job: Partial<Job>) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('jobs')
        .insert([{ ...job, user_id: user.id }])
        .select()
        .single();

    if (error) throw error;
    return data as any as Job;
}

export async function updateJob(id: string, job: Partial<Job>) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('jobs')
        .update(job)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as any as Job;
}

export async function deleteJob(id: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
}
