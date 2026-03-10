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
