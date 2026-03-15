import { createClient } from "@/lib/supabase";
import { Product } from "@/lib/types";
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

export async function getInventory() {
    const supabase = createClient();
    const ownerId = await getOwnerId();
    if (!ownerId) return [];

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', ownerId)
        .order('name');

    if (error) {
        console.error('Error fetching inventory:', error);
        return [];
    }
    return data as any as Product[];
}

export async function getProduct(id: string) {
    const supabase = createClient();
    const ownerId = await getOwnerId();
    if (!ownerId) return null;

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('user_id', ownerId)
        .single();

    if (error) {
        console.error('Error fetching product:', error);
        return null;
    }
    return data as any as Product;
}

export async function addProduct(product: Partial<Product>) {
    const supabase = createClient();
    const ownerId = await getOwnerId();
    if (!ownerId) throw new Error('Not authenticated');

    // Only admin and manager can add products
    const staff = getStaffSession();
    if (staff && staff.role === 'team_member') {
        throw new Error('Team members cannot add products');
    }

    const { data, error } = await supabase
        .from('products')
        .insert([{ ...product, user_id: ownerId }])
        .select()
        .single();

    if (error) throw error;
    return data as any as Product;
}

export async function updateProduct(id: string, product: Partial<Product>) {
    const supabase = createClient();
    const ownerId = await getOwnerId();
    if (!ownerId) throw new Error('Not authenticated');

    // Only admin and manager can update products
    const staff = getStaffSession();
    if (staff && staff.role === 'team_member') {
        throw new Error('Team members cannot update products');
    }

    const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .eq('user_id', ownerId)
        .select()
        .single();

    if (error) throw error;
    return data as any as Product;
}

export async function deleteProduct(id: string) {
    const supabase = createClient();
    const ownerId = await getOwnerId();
    if (!ownerId) throw new Error('Not authenticated');

    // Only admin can delete products
    const staff = getStaffSession();
    if (staff) {
        throw new Error('Only admin can delete products');
    }

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', ownerId);

    if (error) throw error;
    return true;
}
