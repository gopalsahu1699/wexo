export interface Worker {
    id: string;
    user_id: string;
    name: string;
    phone: string | null;
    role: string | null;
    salary: number;
    skills: string[];
    rating: number;
    total_jobs_completed: number;
    status: 'active' | 'inactive';
    created_at: string;
}

export interface Job {
    id: string;
    user_id: string;
    customer_id: string | null;
    assigned_to: string | null;
    job_number: string;
    job_title: string;
    job_description: string | null;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
    scheduled_date: string | null;
    started_at: string | null;
    completed_at: string | null;
    work_photos_urls: string[];
    worker_notes: string | null;
    customer_feedback: string | null;
    customer_rating: number | null;
    location_lat: number | null;
    location_lng: number | null;
    service_address: string | null;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: string;
    user_id: string;
    name: string;
    sku: string | null;
    hsn_code: string | null;
    description: string | null;
    price: number;
    purchase_price: number;
    wholesale_price: number;
    mrp: number;
    tax_rate: number;
    unit: string;
    item_type: 'product' | 'service';
    image_url: string | null;
    stock_quantity: number;
    opening_stock_value: number;
    min_stock_level: number;
    reorder_point: number;
    is_low_stock_alert: boolean;
    barcode: string | null;
    batch_number: string | null;
    expiry_date: string | null;
    mfg_date: string | null;
    category: string | null;
    created_at: string;
}

export interface Customer {
    id: string;
    user_id: string;
    name: string;
    email: string | null;
    phone: string | null;
    billing_address: string | null;
    shipping_address: string | null;
    supply_place: string | null;
    gstin: string | null;
    billing_phone: string | null;
    shipping_phone: string | null;
    shipping_gstin: string | null;
    billing_gstin: string | null;
    type: 'customer' | 'supplier' | 'both';
    category: string | null;
    business_type: string | null;
    industry_type: string | null;
    opening_balance: number;
    current_balance: number;
    created_at: string;
}
