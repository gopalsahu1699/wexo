import { createClient } from "@/lib/supabase";
import { Customer } from "@/lib/types";
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

export async function getCustomers() {
    const supabase = createClient();
    const ownerId = await getOwnerId();
    if (!ownerId) return [];

    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', ownerId)
        .order('name');

    if (error) {
        console.error('Error fetching customers:', error);
        return [];
    }
    return data as any as Customer[];
}

export async function getCustomer(id: string) {
    const supabase = createClient();
    const ownerId = await getOwnerId();
    if (!ownerId) return null;

    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .eq('user_id', ownerId)
        .single();

    if (error) {
        console.error('Error fetching customer:', error);
        return null;
    }
    return data as any as Customer;
}

export async function addCustomer(customer: Partial<Customer>) {
    const supabase = createClient();
    const ownerId = await getOwnerId();
    if (!ownerId) throw new Error('Not authenticated');

    // Only admin and manager can add customers
    const staff = getStaffSession();
    if (staff && staff.role === 'team_member') {
        throw new Error('Team members cannot add customers');
    }

    const { data, error } = await supabase
        .from('customers')
        .insert([{ ...customer, user_id: ownerId }])
        .select()
        .single();

    if (error) throw error;
    return data as any as Customer;
}

export async function updateCustomer(id: string, customer: Partial<Customer>) {
    const supabase = createClient();
    const ownerId = await getOwnerId();
    if (!ownerId) throw new Error('Not authenticated');

    // Only admin and manager can update customers
    const staff = getStaffSession();
    if (staff && staff.role === 'team_member') {
        throw new Error('Team members cannot update customers');
    }

    const { data, error } = await supabase
        .from('customers')
        .update(customer)
        .eq('id', id)
        .eq('user_id', ownerId)
        .select()
        .single();

    if (error) throw error;
    return data as any as Customer;
}

export async function deleteCustomer(id: string) {
    const supabase = createClient();
    const ownerId = await getOwnerId();
    if (!ownerId) throw new Error('Not authenticated');

    // Only admin can delete customers
    const staff = getStaffSession();
    if (staff) {
        throw new Error('Only admin can delete customers');
    }

    const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('user_id', ownerId);

    if (error) throw error;
    return true;
}
