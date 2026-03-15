import { createClient } from "@/lib/supabase";
import { Job } from "@/lib/types";
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

export async function getJobs() {
    const supabase = createClient();
    const ownerId = await getOwnerId();
    if (!ownerId) return [];

    const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', ownerId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching jobs:', error);
        return [];
    }
    return data as any as Job[];
}

export async function getJob(id: string) {
    const supabase = createClient();
    const ownerId = await getOwnerId();
    if (!ownerId) return null;

    const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .eq('user_id', ownerId)
        .single();

    if (error) {
        console.error('Error fetching job:', error);
        return null;
    }
    return data as any as Job;
}

export async function createJob(job: Partial<Job>) {
    const supabase = createClient();
    const ownerId = await getOwnerId();
    if (!ownerId) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('jobs')
        .insert([{ ...job, user_id: ownerId }])
        .select()
        .single();

    if (error) throw error;
    return data as any as Job;
}

export async function updateJob(id: string, job: Partial<Job>) {
    const supabase = createClient();
    const ownerId = await getOwnerId();
    if (!ownerId) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('jobs')
        .update(job)
        .eq('id', id)
        .eq('user_id', ownerId)
        .select()
        .single();

    if (error) throw error;
    return data as any as Job;
}

export async function deleteJob(id: string) {
    const supabase = createClient();
    const ownerId = await getOwnerId();
    if (!ownerId) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id)
        .eq('user_id', ownerId);

    if (error) throw error;
    return true;
}
