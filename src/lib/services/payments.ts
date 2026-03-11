import { createClient } from "@/lib/supabase";

export interface Payment {
    id: string;
    user_id: string;
    customer_id?: string;
    invoice_id?: string;
    payment_number: string;
    payment_date: string;
    amount: number;
    type: 'payment_in' | 'payment_out';
    payment_mode: 'cash' | 'bank' | 'upi' | 'cheque';
    reference_number?: string;
    notes?: string;
    created_at: string;
}

export async function getPayments(type?: 'payment_in' | 'payment_out') {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    let query = supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('payment_date', { ascending: false });

    if (type) {
        query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching payments:', error);
        return [];
    }
    return data as Payment[];
}

export async function addPayment(payment: Partial<Payment>) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('payments')
        .insert([{ ...payment, user_id: user.id }])
        .select()
        .single();

    if (error) throw error;
    return data as Payment;
}
