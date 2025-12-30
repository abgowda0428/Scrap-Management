-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- 
-- Description: Comprehensive RLS policies for zero-trust security model
-- Version: 1.0.0
-- Security Model: Defense in Depth with Role-Based Access Control
-- 
-- ⚠️  CRITICAL SECURITY PRINCIPLES:
-- 1. Deny by default (RLS enabled, no implicit access)
-- 2. Explicit grants only (each operation requires policy)
-- 3. Role-based policies (OPERATOR < SUPERVISOR < MANAGER < ADMIN)
-- 4. Data isolation (users see only their authorized data)
-- 5. Audit trail (all changes logged)
-- 
-- ⚠️  NEVER disable RLS in production
-- ⚠️  Service role bypasses RLS - use ONLY in Edge Functions
-- ============================================================================

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finished_goods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cutting_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cut_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bin_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrap_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrap_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.end_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS POLICIES
-- ============================================================================

-- Get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.users WHERE id = auth.uid() AND deleted_at IS NULL;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if user is active
CREATE OR REPLACE FUNCTION public.is_user_active()
RETURNS BOOLEAN AS $$
    SELECT is_active FROM public.users WHERE id = auth.uid() AND deleted_at IS NULL;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if user has role
CREATE OR REPLACE FUNCTION public.has_role(required_role user_role)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role = required_role 
        AND is_active = true 
        AND deleted_at IS NULL
    );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if user has minimum role level
CREATE OR REPLACE FUNCTION public.has_min_role(min_role user_role)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND is_active = true 
        AND deleted_at IS NULL
        AND CASE min_role
            WHEN 'OPERATOR' THEN role IN ('OPERATOR', 'SUPERVISOR', 'MANAGER', 'ADMIN')
            WHEN 'SUPERVISOR' THEN role IN ('SUPERVISOR', 'MANAGER', 'ADMIN')
            WHEN 'MANAGER' THEN role IN ('MANAGER', 'ADMIN')
            WHEN 'ADMIN' THEN role = 'ADMIN'
            ELSE false
        END
    );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "users_select_own"
ON public.users FOR SELECT
TO authenticated
USING (id = auth.uid() AND deleted_at IS NULL);

-- Users can view other users (basic info only - enforced in SELECT)
CREATE POLICY "users_select_all"
ON public.users FOR SELECT
TO authenticated
USING (is_active = true AND deleted_at IS NULL);

-- Only ADMIN can insert users
CREATE POLICY "users_insert_admin"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (public.has_role('ADMIN'));

-- Users can update their own profile (limited fields)
CREATE POLICY "users_update_own"
ON public.users FOR UPDATE
TO authenticated
USING (id = auth.uid() AND deleted_at IS NULL)
WITH CHECK (
    id = auth.uid() AND
    -- Cannot change role, employee_id, or is_active
    role = (SELECT role FROM public.users WHERE id = auth.uid()) AND
    employee_id = (SELECT employee_id FROM public.users WHERE id = auth.uid()) AND
    is_active = (SELECT is_active FROM public.users WHERE id = auth.uid())
);

-- ADMIN can update any user
CREATE POLICY "users_update_admin"
ON public.users FOR UPDATE
TO authenticated
USING (public.has_role('ADMIN') AND deleted_at IS NULL)
WITH CHECK (public.has_role('ADMIN'));

-- Only ADMIN can soft delete users
CREATE POLICY "users_delete_admin"
ON public.users FOR UPDATE
TO authenticated
USING (public.has_role('ADMIN'))
WITH CHECK (public.has_role('ADMIN') AND deleted_at IS NOT NULL);

-- ============================================================================
-- RAW MATERIALS TABLE POLICIES
-- ============================================================================

-- All authenticated users can view active materials
CREATE POLICY "raw_materials_select_all"
ON public.raw_materials FOR SELECT
TO authenticated
USING (deleted_at IS NULL AND public.is_user_active());

-- SUPERVISOR+ can create materials
CREATE POLICY "raw_materials_insert_supervisor"
ON public.raw_materials FOR INSERT
TO authenticated
WITH CHECK (public.has_min_role('SUPERVISOR'));

-- SUPERVISOR+ can update materials
CREATE POLICY "raw_materials_update_supervisor"
ON public.raw_materials FOR UPDATE
TO authenticated
USING (public.has_min_role('SUPERVISOR') AND deleted_at IS NULL)
WITH CHECK (public.has_min_role('SUPERVISOR'));

-- MANAGER+ can soft delete materials
CREATE POLICY "raw_materials_delete_manager"
ON public.raw_materials FOR UPDATE
TO authenticated
USING (public.has_min_role('MANAGER'))
WITH CHECK (public.has_min_role('MANAGER') AND deleted_at IS NOT NULL);

-- ============================================================================
-- MACHINES TABLE POLICIES
-- ============================================================================

-- All authenticated users can view machines
CREATE POLICY "machines_select_all"
ON public.machines FOR SELECT
TO authenticated
USING (deleted_at IS NULL AND public.is_user_active());

-- SUPERVISOR+ can manage machines
CREATE POLICY "machines_insert_supervisor"
ON public.machines FOR INSERT
TO authenticated
WITH CHECK (public.has_min_role('SUPERVISOR'));

CREATE POLICY "machines_update_supervisor"
ON public.machines FOR UPDATE
TO authenticated
USING (public.has_min_role('SUPERVISOR') AND deleted_at IS NULL)
WITH CHECK (public.has_min_role('SUPERVISOR'));

CREATE POLICY "machines_delete_manager"
ON public.machines FOR UPDATE
TO authenticated
USING (public.has_min_role('MANAGER'))
WITH CHECK (public.has_min_role('MANAGER') AND deleted_at IS NOT NULL);

-- ============================================================================
-- FINISHED GOODS TABLE POLICIES
-- ============================================================================

-- All users can view active finished goods
CREATE POLICY "finished_goods_select_all"
ON public.finished_goods FOR SELECT
TO authenticated
USING (deleted_at IS NULL AND public.is_user_active());

-- SUPERVISOR+ can manage finished goods
CREATE POLICY "finished_goods_insert_supervisor"
ON public.finished_goods FOR INSERT
TO authenticated
WITH CHECK (public.has_min_role('SUPERVISOR'));

CREATE POLICY "finished_goods_update_supervisor"
ON public.finished_goods FOR UPDATE
TO authenticated
USING (public.has_min_role('SUPERVISOR') AND deleted_at IS NULL)
WITH CHECK (public.has_min_role('SUPERVISOR'));

CREATE POLICY "finished_goods_delete_manager"
ON public.finished_goods FOR UPDATE
TO authenticated
USING (public.has_min_role('MANAGER'))
WITH CHECK (public.has_min_role('MANAGER') AND deleted_at IS NOT NULL);

-- ============================================================================
-- CUTTING JOBS TABLE POLICIES
-- ============================================================================

-- Operators can view their own jobs
CREATE POLICY "cutting_jobs_select_own"
ON public.cutting_jobs FOR SELECT
TO authenticated
USING (
    operator_id = auth.uid() AND 
    deleted_at IS NULL AND 
    public.is_user_active()
);

-- Supervisors can view jobs in their department
CREATE POLICY "cutting_jobs_select_supervisor"
ON public.cutting_jobs FOR SELECT
TO authenticated
USING (
    public.has_min_role('SUPERVISOR') AND 
    deleted_at IS NULL AND
    supervisor_id = auth.uid()
);

-- Managers can view all jobs
CREATE POLICY "cutting_jobs_select_manager"
ON public.cutting_jobs FOR SELECT
TO authenticated
USING (
    public.has_min_role('MANAGER') AND 
    deleted_at IS NULL
);

-- Operators can create their own jobs (with supervisor assigned)
CREATE POLICY "cutting_jobs_insert_operator"
ON public.cutting_jobs FOR INSERT
TO authenticated
WITH CHECK (
    public.has_min_role('OPERATOR') AND
    operator_id = auth.uid()
);

-- Operators can update their own jobs (if not completed)
CREATE POLICY "cutting_jobs_update_operator_own"
ON public.cutting_jobs FOR UPDATE
TO authenticated
USING (
    operator_id = auth.uid() AND 
    deleted_at IS NULL AND
    status != 'COMPLETED'
)
WITH CHECK (
    operator_id = auth.uid() AND
    status != 'COMPLETED'
);

-- Supervisors can update jobs they supervise
CREATE POLICY "cutting_jobs_update_supervisor"
ON public.cutting_jobs FOR UPDATE
TO authenticated
USING (
    public.has_min_role('SUPERVISOR') AND 
    supervisor_id = auth.uid() AND
    deleted_at IS NULL
)
WITH CHECK (
    public.has_min_role('SUPERVISOR') AND
    supervisor_id = auth.uid()
);

-- Managers can update any job
CREATE POLICY "cutting_jobs_update_manager"
ON public.cutting_jobs FOR UPDATE
TO authenticated
USING (
    public.has_min_role('MANAGER') AND 
    deleted_at IS NULL
)
WITH CHECK (public.has_min_role('MANAGER'));

-- Only Managers can soft delete jobs
CREATE POLICY "cutting_jobs_delete_manager"
ON public.cutting_jobs FOR UPDATE
TO authenticated
USING (public.has_min_role('MANAGER'))
WITH CHECK (public.has_min_role('MANAGER') AND deleted_at IS NOT NULL);

-- ============================================================================
-- CUT PIECES TABLE POLICIES
-- ============================================================================

-- Operators can view cut pieces from their jobs
CREATE POLICY "cut_pieces_select_own"
ON public.cut_pieces FOR SELECT
TO authenticated
USING (
    operator_id = auth.uid() AND 
    deleted_at IS NULL AND 
    public.is_user_active()
);

-- Supervisors+ can view all cut pieces
CREATE POLICY "cut_pieces_select_supervisor"
ON public.cut_pieces FOR SELECT
TO authenticated
USING (
    public.has_min_role('SUPERVISOR') AND 
    deleted_at IS NULL
);

-- Operators can create cut pieces for their jobs
CREATE POLICY "cut_pieces_insert_operator"
ON public.cut_pieces FOR INSERT
TO authenticated
WITH CHECK (
    public.has_min_role('OPERATOR') AND
    operator_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.cutting_jobs 
        WHERE id = cutting_job_id 
        AND operator_id = auth.uid()
        AND deleted_at IS NULL
    )
);

-- Operators can update their own cut pieces (if available)
CREATE POLICY "cut_pieces_update_operator"
ON public.cut_pieces FOR UPDATE
TO authenticated
USING (
    operator_id = auth.uid() AND 
    deleted_at IS NULL AND
    status = 'AVAILABLE'
)
WITH CHECK (
    operator_id = auth.uid() AND
    status IN ('AVAILABLE', 'IN_PROCESS')
);

-- Supervisors+ can update any cut piece
CREATE POLICY "cut_pieces_update_supervisor"
ON public.cut_pieces FOR UPDATE
TO authenticated
USING (
    public.has_min_role('SUPERVISOR') AND 
    deleted_at IS NULL
)
WITH CHECK (public.has_min_role('SUPERVISOR'));

-- ============================================================================
-- BIN MOVEMENTS TABLE POLICIES
-- ============================================================================

-- Operators can view bin movements they created
CREATE POLICY "bin_movements_select_own"
ON public.bin_movements FOR SELECT
TO authenticated
USING (
    operator_id = auth.uid() AND 
    deleted_at IS NULL AND 
    public.is_user_active()
);

-- Supervisors+ can view all bin movements
CREATE POLICY "bin_movements_select_supervisor"
ON public.bin_movements FOR SELECT
TO authenticated
USING (
    public.has_min_role('SUPERVISOR') AND 
    deleted_at IS NULL
);

-- Operators can create bin movements
CREATE POLICY "bin_movements_insert_operator"
ON public.bin_movements FOR INSERT
TO authenticated
WITH CHECK (
    public.has_min_role('OPERATOR') AND
    operator_id = auth.uid()
);

-- Only Supervisors+ can update bin movements
CREATE POLICY "bin_movements_update_supervisor"
ON public.bin_movements FOR UPDATE
TO authenticated
USING (
    public.has_min_role('SUPERVISOR') AND 
    deleted_at IS NULL
)
WITH CHECK (public.has_min_role('SUPERVISOR'));

-- ============================================================================
-- SCRAP REASONS TABLE POLICIES
-- ============================================================================

-- All users can view active scrap reasons
CREATE POLICY "scrap_reasons_select_all"
ON public.scrap_reasons FOR SELECT
TO authenticated
USING (is_active = true AND deleted_at IS NULL AND public.is_user_active());

-- Supervisors+ can manage scrap reasons
CREATE POLICY "scrap_reasons_insert_supervisor"
ON public.scrap_reasons FOR INSERT
TO authenticated
WITH CHECK (public.has_min_role('SUPERVISOR'));

CREATE POLICY "scrap_reasons_update_supervisor"
ON public.scrap_reasons FOR UPDATE
TO authenticated
USING (public.has_min_role('SUPERVISOR') AND deleted_at IS NULL)
WITH CHECK (public.has_min_role('SUPERVISOR'));

-- ============================================================================
-- SCRAP ENTRIES TABLE POLICIES
-- ============================================================================

-- Operators can view their own scrap entries
CREATE POLICY "scrap_entries_select_own"
ON public.scrap_entries FOR SELECT
TO authenticated
USING (
    operator_id = auth.uid() AND 
    deleted_at IS NULL AND 
    public.is_user_active()
);

-- Supervisors can view scrap entries they need to approve
CREATE POLICY "scrap_entries_select_supervisor"
ON public.scrap_entries FOR SELECT
TO authenticated
USING (
    public.has_min_role('SUPERVISOR') AND 
    deleted_at IS NULL AND
    (
        approval_status = 'PENDING' OR
        approved_by_id = auth.uid() OR
        public.has_min_role('MANAGER')
    )
);

-- Managers can view all scrap entries
CREATE POLICY "scrap_entries_select_manager"
ON public.scrap_entries FOR SELECT
TO authenticated
USING (
    public.has_min_role('MANAGER') AND 
    deleted_at IS NULL
);

-- Operators can create scrap entries
CREATE POLICY "scrap_entries_insert_operator"
ON public.scrap_entries FOR INSERT
TO authenticated
WITH CHECK (
    public.has_min_role('OPERATOR') AND
    operator_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.cutting_jobs 
        WHERE id = cutting_job_id 
        AND operator_id = auth.uid()
        AND deleted_at IS NULL
    )
);

-- Operators can update their own pending scrap entries
CREATE POLICY "scrap_entries_update_operator"
ON public.scrap_entries FOR UPDATE
TO authenticated
USING (
    operator_id = auth.uid() AND 
    deleted_at IS NULL AND
    approval_status = 'PENDING'
)
WITH CHECK (
    operator_id = auth.uid() AND
    approval_status = 'PENDING'
);

-- Supervisors can approve/reject scrap entries
CREATE POLICY "scrap_entries_update_supervisor_approve"
ON public.scrap_entries FOR UPDATE
TO authenticated
USING (
    public.has_min_role('SUPERVISOR') AND 
    deleted_at IS NULL AND
    approval_status = 'PENDING'
)
WITH CHECK (
    public.has_min_role('SUPERVISOR') AND
    approval_status IN ('APPROVED', 'REJECTED') AND
    approved_by_id = auth.uid()
);

-- Managers can update any scrap entry
CREATE POLICY "scrap_entries_update_manager"
ON public.scrap_entries FOR UPDATE
TO authenticated
USING (
    public.has_min_role('MANAGER') AND 
    deleted_at IS NULL
)
WITH CHECK (public.has_min_role('MANAGER'));

-- ============================================================================
-- END PIECES TABLE POLICIES
-- ============================================================================

-- All users can view available end pieces
CREATE POLICY "end_pieces_select_all"
ON public.end_pieces FOR SELECT
TO authenticated
USING (deleted_at IS NULL AND public.is_user_active());

-- Operators can create end pieces from their jobs
CREATE POLICY "end_pieces_insert_operator"
ON public.end_pieces FOR INSERT
TO authenticated
WITH CHECK (
    public.has_min_role('OPERATOR') AND
    EXISTS (
        SELECT 1 FROM public.cutting_jobs 
        WHERE id = cutting_job_id 
        AND operator_id = auth.uid()
        AND deleted_at IS NULL
    )
);

-- Operators can update end pieces (if available)
CREATE POLICY "end_pieces_update_operator"
ON public.end_pieces FOR UPDATE
TO authenticated
USING (
    public.has_min_role('OPERATOR') AND 
    deleted_at IS NULL AND
    status = 'AVAILABLE'
)
WITH CHECK (
    public.has_min_role('OPERATOR') AND
    status IN ('AVAILABLE', 'RESERVED', 'USED')
);

-- Supervisors+ can update any end piece
CREATE POLICY "end_pieces_update_supervisor"
ON public.end_pieces FOR UPDATE
TO authenticated
USING (
    public.has_min_role('SUPERVISOR') AND 
    deleted_at IS NULL
)
WITH CHECK (public.has_min_role('SUPERVISOR'));

-- ============================================================================
-- AUDIT LOGS TABLE POLICIES
-- ============================================================================

-- Users can view their own audit logs
CREATE POLICY "audit_logs_select_own"
ON public.audit_logs FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Managers can view all audit logs
CREATE POLICY "audit_logs_select_manager"
ON public.audit_logs FOR SELECT
TO authenticated
USING (public.has_min_role('MANAGER'));

-- Audit logs are insert-only (no updates/deletes)
CREATE POLICY "audit_logs_insert_system"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (true); -- Inserted by triggers

-- ============================================================================
-- SYSTEM CONFIG TABLE POLICIES
-- ============================================================================

-- All users can view system config
CREATE POLICY "system_config_select_all"
ON public.system_config FOR SELECT
TO authenticated
USING (public.is_user_active());

-- Only ADMIN can modify system config
CREATE POLICY "system_config_insert_admin"
ON public.system_config FOR INSERT
TO authenticated
WITH CHECK (public.has_role('ADMIN'));

CREATE POLICY "system_config_update_admin"
ON public.system_config FOR UPDATE
TO authenticated
USING (public.has_role('ADMIN'))
WITH CHECK (public.has_role('ADMIN'));

-- ============================================================================
-- STORAGE POLICIES (Supabase Storage Buckets)
-- ============================================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('scrap-photos', 'scrap-photos', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/jpg']),
    ('bin-labels', 'bin-labels', false, 5242880, ARRAY['application/pdf', 'image/png']),
    ('reports', 'reports', false, 52428800, ARRAY['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS for scrap-photos
CREATE POLICY "scrap_photos_select_authenticated"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'scrap-photos' AND
    (
        auth.uid()::text = (storage.foldername(name))[1] OR
        public.has_min_role('SUPERVISOR')
    )
);

CREATE POLICY "scrap_photos_insert_operator"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'scrap-photos' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    public.has_min_role('OPERATOR')
);

CREATE POLICY "scrap_photos_delete_own"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'scrap-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage RLS for bin-labels
CREATE POLICY "bin_labels_select_all"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'bin-labels' AND public.is_user_active());

CREATE POLICY "bin_labels_insert_operator"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'bin-labels' AND
    public.has_min_role('OPERATOR')
);

-- Storage RLS for reports
CREATE POLICY "reports_select_supervisor"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'reports' AND public.has_min_role('SUPERVISOR'));

CREATE POLICY "reports_insert_supervisor"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'reports' AND
    public.has_min_role('SUPERVISOR')
);

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ RLS policies created successfully';
    RAISE NOTICE '✅ All tables protected with RLS';
    RAISE NOTICE '✅ Role-based access control enforced';
    RAISE NOTICE '✅ Storage buckets protected';
    RAISE NOTICE '⚠️  Next: Run 00003_add_indexes.sql';
END $$;
