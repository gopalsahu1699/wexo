import { createClient } from "@/lib/supabase";
import { Customer } from "@/lib/types";

export async function getCustomers() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

    if (error) {
        console.error('Error fetching customers:', error);
        return [];
    }
    return data as any as Customer[];
}

export async function getCustomer(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching customer:', error);
        return null;
    }
    return data as any as Customer;
}

export async function addCustomer(customer: Partial<Customer>) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('customers')
        .insert([{ ...customer, user_id: user.id }])
        .select()
        .single();

    if (error) throw error;
    return data as any as Customer;
}

export async function updateCustomer(id: string, customer: Partial<Customer>) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('customers')
        .update(customer)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as any as Customer;
}

export async function deleteCustomer(id: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
}
