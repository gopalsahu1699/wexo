-- ============================================================
-- WEXO – Database Schema Extension (v1.0)
-- Enhances shared_supabase_schema.sql with workforce-specific tables
-- ============================================================

-- 1. ADD SKILLS TO STAFF MEMBERS
ALTER TABLE public.staff_members ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
ALTER TABLE public.staff_members ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 5.00;
ALTER TABLE public.staff_members ADD COLUMN IF NOT EXISTS total_jobs_completed INTEGER DEFAULT 0;
ALTER TABLE public.staff_members ADD COLUMN IF NOT EXISTS current_location_lat DECIMAL(9,6);
ALTER TABLE public.staff_members ADD COLUMN IF NOT EXISTS current_location_lng DECIMAL(9,6);


-- 2. JOBS TABLE
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.staff_members(id) ON DELETE SET NULL,
  job_number TEXT NOT NULL,
  job_title TEXT NOT NULL,
  job_description TEXT,
  priority TEXT DEFAULT 'medium', -- 'low' | 'medium' | 'high' | 'urgent'
  status TEXT DEFAULT 'pending', -- 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
  scheduled_date TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  work_photos_urls JSONB DEFAULT '[]',
  worker_notes TEXT,
  customer_feedback TEXT,
  customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
  location_lat DECIMAL(9,6),
  location_lng DECIMAL(9,6),
  service_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. JOB TASKS (Sub-tasks for a job)
CREATE TABLE IF NOT EXISTS public.job_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MATERIALS USED IN JOB (Links Inventory to Jobs)
CREATE TABLE IF NOT EXISTS public.job_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products ON DELETE SET NULL,
  quantity DECIMAL(15,2) NOT NULL,
  unit_price DECIMAL(15,2),
  total_price DECIMAL(15,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL, -- The owner/admin
  target_user_id TEXT, -- Can be staff_id or user_id (stored as text for flexibility)
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'info' | 'job_assigned' | 'payment_received' | 'low_stock' | 'urgent'
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SALARY PAYMENTS (Payroll History)
CREATE TABLE IF NOT EXISTS public.salary_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    period_start DATE,
    period_end DATE,
    payment_mode TEXT DEFAULT 'cash', -- 'cash' | 'bank' | 'upi'
    reference_id TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- RLS POLICIES FOR WEXO TABLES
-- ═══════════════════════════════════════════════════════════════
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'jobs', 'notifications', 'salary_payments'
  ])
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "%s_own" ON public.%I', t, t);
    EXECUTE format(
      'CREATE POLICY "%s_own" ON public.%I FOR ALL USING (auth.uid() = user_id)',
      t, t
    );
  END LOOP;
END $$;

-- Job Tasks and Materials follow Job access
ALTER TABLE public.job_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_by_job_owner" ON public.job_tasks FOR ALL 
USING (EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = job_tasks.job_id AND jobs.user_id = auth.uid()));

ALTER TABLE public.job_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "materials_by_job_owner" ON public.job_materials FOR ALL 
USING (EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = job_materials.job_id AND jobs.user_id = auth.uid()));


-- ═══════════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- ═══════════════════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public)
VALUES ('work-photos', 'work-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for work photos
DROP POLICY IF EXISTS "Anyone can view work photos" ON storage.objects;
CREATE POLICY "Anyone can view work photos" ON storage.objects FOR SELECT USING (bucket_id = 'work-photos');

DROP POLICY IF EXISTS "Auth users can upload work photos" ON storage.objects;
CREATE POLICY "Auth users can upload work photos" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'work-photos');

-- ═══════════════════════════════════════════════════════════════
-- AUTOMATION TRIGGERS
-- ═══════════════════════════════════════════════════════════════

-- Update staff totals on job completion
CREATE OR REPLACE FUNCTION public.update_staff_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.staff_members
    SET total_jobs_completed = total_jobs_completed + 1
    WHERE id = NEW.assigned_to;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_job_completed
  AFTER UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_staff_stats();
