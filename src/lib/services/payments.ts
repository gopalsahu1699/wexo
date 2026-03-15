import { createClient } from "@/lib/supabase";
import { getStaffSession } from "./auth-role";

export interface Payment {
    id: string;
    user_id: string;
    customer_id?: string;
    staff_id?: string;
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

// Helper to get the effective owner ID (admin auth OR staff session)
async function getOwnerId(): Promise<string | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) return user.id;

    const staff = getStaffSession();
    if (staff) return staff.ownerId;

    return null;
}

export async function getPayments(type?: 'payment_in' | 'payment_out') {
    const supabase = createClient();
    const ownerId = await getOwnerId();
    if (!ownerId) return [];

    let query = supabase
        .from('payments')
        .select('*')
        .eq('user_id', ownerId)
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
    const ownerId = await getOwnerId();
    if (!ownerId) throw new Error('Not authenticated');

    // Only admin and manager can add payments
    const staff = getStaffSession();
    if (staff && staff.role === 'team_member') {
        throw new Error('Team members cannot add payments');
    }

    const { data, error } = await supabase
        .from('payments')
        .insert([{ ...payment, user_id: ownerId }])
        .select()
        .single();

    if (error) throw error;
    return data as Payment;
}
