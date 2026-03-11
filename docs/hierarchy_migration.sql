-- ═══════════════════════════════════════════════════════════════
-- WEXO HIERARCHY SYSTEM - Database Migration
-- Version 3.0 - Role-Based Task Management
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- 1. UPGRADE staff_members FOR HIERARCHY + PIN LOGIN
-- ─────────────────────────────────────────────────────────────

-- Role upgrade: admin | manager | team_member
ALTER TABLE public.staff_members DROP CONSTRAINT IF EXISTS staff_members_status_check;
ALTER TABLE public.staff_members 
  ADD COLUMN IF NOT EXISTS hierarchy_role TEXT DEFAULT 'team_member' 
  CHECK (hierarchy_role IN ('admin', 'manager', 'team_member'));

-- Manager reference (who is this person's boss?)
ALTER TABLE public.staff_members 
  ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES public.staff_members(id) ON DELETE SET NULL;

-- PIN-based login for workers/managers (Admin sets this)
ALTER TABLE public.staff_members 
  ADD COLUMN IF NOT EXISTS login_email TEXT;

ALTER TABLE public.staff_members 
  ADD COLUMN IF NOT EXISTS login_pin TEXT;

-- Unique constraint on login_email per owner
CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_login_email 
  ON public.staff_members(user_id, login_email) 
  WHERE login_email IS NOT NULL;

-- ─────────────────────────────────────────────────────────────
-- 2. TASK ASSIGNMENTS (Core work order system)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.task_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Ownership
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,  -- business owner
  assigned_by UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  
  -- Link to existing job (optional)
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  
  -- Task details
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT,  -- e.g., 'electrical', 'plumbing', 'ac_repair', 'painting', 'construction'
  
  -- Location
  service_address TEXT,
  location_lat NUMERIC,
  location_lng NUMERIC,
  customer_name TEXT,
  customer_phone TEXT,
  
  -- Status lifecycle
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',       -- just assigned, waiting for acceptance
    'accepted',      -- assignee accepted the task
    'rejected',      -- assignee rejected the task
    'in_progress',   -- work has started
    'completed',     -- assignee marked as done
    'verified',      -- assigner verified the completion
    'reassigned'     -- task was reassigned to someone else
  )),
  
  -- Rejection
  rejection_reason TEXT,
  
  -- Dates
  deadline DATE,
  scheduled_date DATE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  
  -- Completion details
  completion_notes TEXT,
  work_photos JSONB DEFAULT '[]',  -- array of photo URLs
  
  -- Estimated vs actual
  estimated_hours NUMERIC DEFAULT 0,
  actual_hours NUMERIC DEFAULT 0,
  estimated_cost NUMERIC DEFAULT 0,
  actual_cost NUMERIC DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 3. TASK COMMENTS (Communication on tasks)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.task_assignments(id) ON DELETE CASCADE,
  author_staff_id UUID REFERENCES public.staff_members(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 4. TASK STATUS LOG (Full audit trail)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.task_status_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.task_assignments(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES public.staff_members(id) ON DELETE SET NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 5. INDEXES FOR PERFORMANCE
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.task_assignments(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_by ON public.task_assignments(assigned_by, status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.task_assignments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_job_id ON public.task_assignments(job_id);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON public.task_assignments(deadline);
CREATE INDEX IF NOT EXISTS idx_tasks_created ON public.task_assignments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_task_comments_task ON public.task_comments(task_id, created_at);
CREATE INDEX IF NOT EXISTS idx_task_status_log_task ON public.task_status_log(task_id, created_at);

CREATE INDEX IF NOT EXISTS idx_staff_manager ON public.staff_members(manager_id);
CREATE INDEX IF NOT EXISTS idx_staff_hierarchy_role ON public.staff_members(user_id, hierarchy_role);
CREATE INDEX IF NOT EXISTS idx_staff_login ON public.staff_members(user_id, login_email);

-- ─────────────────────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_status_log ENABLE ROW LEVEL SECURITY;

-- Task assignments: owner sees all
DROP POLICY IF EXISTS "task_assignments_own" ON public.task_assignments;
CREATE POLICY "task_assignments_own" ON public.task_assignments 
  FOR ALL USING (auth.uid() = user_id);

-- Task comments: owner sees all
DROP POLICY IF EXISTS "task_comments_own" ON public.task_comments;
CREATE POLICY "task_comments_own" ON public.task_comments 
  FOR ALL USING (auth.uid() = user_id);

-- Task status log: owner sees all
DROP POLICY IF EXISTS "task_status_log_own" ON public.task_status_log;
CREATE POLICY "task_status_log_own" ON public.task_status_log 
  FOR ALL USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 7. AUTO-UPDATE timestamp trigger
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_task_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS task_updated_at ON public.task_assignments;
CREATE TRIGGER task_updated_at
  BEFORE UPDATE ON public.task_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_task_timestamp();

-- ═══════════════════════════════════════════════════════════════
-- DONE! Run this in your Supabase SQL Editor.
-- After running, update your WEXO app code.
-- ═══════════════════════════════════════════════════════════════
