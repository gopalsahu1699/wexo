import { createClient } from "@/lib/supabase";
import { Product } from "@/lib/types";

export async function getInventory() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

    if (error) {
        console.error('Error fetching inventory:', error);
        return [];
    }
    return data as any as Product[];
}

export async function addProduct(product: Partial<Product>) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('products')
        .insert([{ ...product, user_id: user.id }])
        .select()
        .single();

    if (error) throw error;
    return data as any as Product;
}
