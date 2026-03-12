export interface Worker {
    id: string;
    user_id: string;
    name: string;
    phone: string | null;
    role: string | null;
    salary: number;
    half_day_salary: number;
    overtime_rate: number;
    pay_basis: 'monthly' | 'daily';
    aadhaar_number: string | null;
    pan_number: string | null;
    address: string | null;
    bank_name: string | null;
    bank_account_number: string | null;
    bank_ifsc_code: string | null;
    father_name: string | null;
    gender: string | null;
    dob: string | null;
    whatsapp_phone: string | null;
    photo_url: string | null;
    skills: string[];
    rating: number;
    total_jobs_completed: number;
    status: 'active' | 'inactive';
    created_at: string;

    // Hierarchy fields
    hierarchy_role: 'admin' | 'manager' | 'team_member';
    manager_id: string | null;
    login_email: string | null;
    login_pin: string | null;
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

export interface AttendanceRecord {
    id: string;
    staff_id: string;
    user_id: string;
    date: string;
    status: 'present' | 'absent' | 'half_day' | 'leave';
    check_in?: string;
    check_out?: string;
    overtime_hours: number;
    notes?: string;
}

// ═══════════════════════════════════════════════════════════
// HIERARCHY TYPES
// ═══════════════════════════════════════════════════════════

export type HierarchyRole = 'admin' | 'manager' | 'team_member';

export type TaskStatus = 
    'pending' | 'accepted' | 'rejected' | 
    'in_progress' | 'completed' | 'verified' | 'reassigned';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskAssignment {
    id: string;
    user_id: string;
    assigned_by: string;
    assigned_to: string;
    job_id: string | null;

    title: string;
    description: string | null;
    priority: TaskPriority;
    category: string | null;

    // Location & Customer
    service_address: string | null;
    location_lat: number | null;
    location_lng: number | null;
    google_maps_url: string | null;
    customer_name: string | null;
    customer_phone: string | null;

    // Status
    status: TaskStatus;
    rejection_reason: string | null;

    // Dates
    deadline: string | null;
    scheduled_date: string | null;
    started_at: string | null;
    completed_at: string | null;
    verified_at: string | null;

    // Completion
    completion_notes: string | null;
    work_photos: string[];
    
    // Estimates
    estimated_hours: number;
    actual_hours: number;
    estimated_cost: number;
    actual_cost: number;

    created_at: string;
    updated_at: string;

    // Joined data (populated in queries)
    assigned_by_name?: string;
    assigned_to_name?: string;
    assigned_by_worker?: Worker;
    assigned_to_worker?: Worker;
}

export interface TaskComment {
    id: string;
    user_id: string;
    task_id: string;
    author_staff_id: string | null;
    author_name: string;
    message: string;
    attachments: string[];
    created_at: string;
}

export interface TaskStatusLog {
    id: string;
    user_id: string;
    task_id: string;
    changed_by: string | null;
    old_status: string | null;
    new_status: string;
    notes: string | null;
    created_at: string;
}

// Session for PIN-based login (stored in localStorage)
export interface StaffSession {
    staffId: string;
    staffName: string;
    role: HierarchyRole;
    ownerId: string;  // the admin's auth user_id
    loginEmail: string;
}
