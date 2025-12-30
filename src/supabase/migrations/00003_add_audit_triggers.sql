-- ============================================================================
-- AUDIT TRIGGERS & AUTOMATIC TIMESTAMP UPDATES
-- 
-- Description: Comprehensive audit trail and automatic field updates
-- Version: 1.0.0
-- 
-- Features:
-- 1. Automatic updated_at timestamp
-- 2. Audit log generation for all changes
-- 3. Soft delete prevention of hard deletes
-- 4. Business logic triggers
-- ============================================================================

-- ============================================================================
-- TRIGGER FUNCTION: Update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.trigger_set_updated_at() IS 'Automatically update updated_at and updated_by fields';

-- ============================================================================
-- TRIGGER FUNCTION: Create audit log entry
-- ============================================================================

CREATE OR REPLACE FUNCTION public.trigger_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    old_values JSONB;
    new_values JSONB;
    changed_fields TEXT[];
    user_role_val user_role;
BEGIN
    -- Get user role
    SELECT role INTO user_role_val FROM public.users WHERE id = auth.uid();

    -- Build old and new values
    IF TG_OP = 'DELETE' THEN
        old_values = to_jsonb(OLD);
        new_values = NULL;
    ELSIF TG_OP = 'UPDATE' THEN
        old_values = to_jsonb(OLD);
        new_values = to_jsonb(NEW);
        
        -- Find changed fields
        SELECT array_agg(key)
        INTO changed_fields
        FROM jsonb_each(old_values)
        WHERE value IS DISTINCT FROM new_values->key;
    ELSIF TG_OP = 'INSERT' THEN
        old_values = NULL;
        new_values = to_jsonb(NEW);
    END IF;

    -- Insert audit log
    INSERT INTO public.audit_logs (
        table_name,
        record_id,
        operation,
        old_values,
        new_values,
        changed_fields,
        user_id,
        user_role,
        ip_address,
        user_agent
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        old_values,
        new_values,
        changed_fields,
        auth.uid(),
        user_role_val,
        inet_client_addr(),
        current_setting('request.headers', true)::json->>'user-agent'
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.trigger_audit_log() IS 'Create audit log entry for all data changes';

-- ============================================================================
-- TRIGGER FUNCTION: Prevent hard deletes (enforce soft delete)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.trigger_prevent_hard_delete()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Hard deletes are not allowed. Use soft delete by setting deleted_at.';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.trigger_prevent_hard_delete() IS 'Prevent hard deletes, enforce soft delete pattern';

-- ============================================================================
-- TRIGGER FUNCTION: Calculate scrap percentage
-- ============================================================================

CREATE OR REPLACE FUNCTION public.trigger_calculate_scrap_percentage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.total_input_weight_kg > 0 THEN
        NEW.scrap_percentage = ROUND(
            (NEW.total_scrap_weight_kg / NEW.total_input_weight_kg * 100)::NUMERIC, 
            2
        );
    ELSE
        NEW.scrap_percentage = 0;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.trigger_calculate_scrap_percentage() IS 'Automatically calculate scrap percentage';

-- ============================================================================
-- TRIGGER FUNCTION: Validate weight balance in cutting jobs
-- ============================================================================

CREATE OR REPLACE FUNCTION public.trigger_validate_weight_balance()
RETURNS TRIGGER AS $$
DECLARE
    total_output DECIMAL(10,2);
    tolerance DECIMAL(10,2) := 0.01; -- 1% tolerance
BEGIN
    total_output := NEW.total_output_weight_kg + 
                    NEW.total_reusable_weight_kg + 
                    NEW.total_end_piece_weight_kg + 
                    NEW.total_scrap_weight_kg;
    
    IF total_output > (NEW.total_input_weight_kg * (1 + tolerance)) THEN
        RAISE EXCEPTION 'Total output weight (%.2f kg) exceeds input weight (%.2f kg) by more than tolerance', 
            total_output, NEW.total_input_weight_kg;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.trigger_validate_weight_balance() IS 'Validate material weight balance';

-- ============================================================================
-- TRIGGER FUNCTION: Auto-generate tracking IDs
-- ============================================================================

CREATE OR REPLACE FUNCTION public.trigger_generate_scrap_tracking_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.scrap_tracking_id IS NULL OR NEW.scrap_tracking_id = '' THEN
        NEW.scrap_tracking_id := 'SCRAP-' || 
                                 TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' ||
                                 LPAD(NEXTVAL('scrap_tracking_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for tracking IDs
CREATE SEQUENCE IF NOT EXISTS scrap_tracking_seq START 1;

COMMENT ON FUNCTION public.trigger_generate_scrap_tracking_id() IS 'Auto-generate scrap tracking ID';

-- ============================================================================
-- TRIGGER FUNCTION: Update material stock on job creation
-- ============================================================================

CREATE OR REPLACE FUNCTION public.trigger_update_material_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Decrease stock when job is created
    IF TG_OP = 'INSERT' THEN
        UPDATE public.raw_materials
        SET current_stock_qty = current_stock_qty - NEW.total_input_weight_kg,
            updated_at = NOW(),
            updated_by = auth.uid()
        WHERE id = NEW.material_id;
        
        -- Check if stock went negative
        IF (SELECT current_stock_qty FROM public.raw_materials WHERE id = NEW.material_id) < 0 THEN
            RAISE EXCEPTION 'Insufficient stock for material ID: %', NEW.material_id;
        END IF;
    END IF;
    
    -- Restore stock if job is cancelled
    IF TG_OP = 'UPDATE' AND OLD.status != 'CANCELLED' AND NEW.status = 'CANCELLED' THEN
        UPDATE public.raw_materials
        SET current_stock_qty = current_stock_qty + NEW.total_input_weight_kg,
            updated_at = NOW(),
            updated_by = auth.uid()
        WHERE id = NEW.material_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.trigger_update_material_stock() IS 'Update material stock on job creation/cancellation';

-- ============================================================================
-- TRIGGER FUNCTION: Validate scrap approval workflow
-- ============================================================================

CREATE OR REPLACE FUNCTION public.trigger_validate_scrap_approval()
RETURNS TRIGGER AS $$
DECLARE
    user_role_val user_role;
BEGIN
    -- Get user role
    SELECT role INTO user_role_val FROM public.users WHERE id = auth.uid();
    
    -- Only SUPERVISOR+ can approve/reject
    IF NEW.approval_status IN ('APPROVED', 'REJECTED') THEN
        IF user_role_val NOT IN ('SUPERVISOR', 'MANAGER', 'ADMIN') THEN
            RAISE EXCEPTION 'Only supervisors and above can approve/reject scrap entries';
        END IF;
        
        -- Set approval metadata
        NEW.approved_by_id = auth.uid();
        NEW.approval_date = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.trigger_validate_scrap_approval() IS 'Validate scrap approval workflow';

-- ============================================================================
-- ATTACH TRIGGERS TO TABLES
-- ============================================================================

-- Updated_at triggers for all tables
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN ('audit_logs', 'system_config')
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I;
            CREATE TRIGGER trg_%I_updated_at
                BEFORE UPDATE ON public.%I
                FOR EACH ROW
                EXECUTE FUNCTION public.trigger_set_updated_at();
        ', t, t, t, t);
    END LOOP;
END $$;

-- Audit log triggers for critical tables
DO $$
DECLARE
    t TEXT;
    critical_tables TEXT[] := ARRAY[
        'users', 
        'cutting_jobs', 
        'cut_pieces', 
        'scrap_entries', 
        'bin_movements',
        'raw_materials',
        'end_pieces'
    ];
BEGIN
    FOREACH t IN ARRAY critical_tables
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS trg_%I_audit ON public.%I;
            CREATE TRIGGER trg_%I_audit
                AFTER INSERT OR UPDATE OR DELETE ON public.%I
                FOR EACH ROW
                EXECUTE FUNCTION public.trigger_audit_log();
        ', t, t, t, t);
    END LOOP;
END $$;

-- Prevent hard delete triggers
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN ('audit_logs', 'system_config')
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS trg_%I_prevent_delete ON public.%I;
            CREATE TRIGGER trg_%I_prevent_delete
                BEFORE DELETE ON public.%I
                FOR EACH ROW
                EXECUTE FUNCTION public.trigger_prevent_hard_delete();
        ', t, t, t, t);
    END LOOP;
END $$;

-- Cutting jobs specific triggers
DROP TRIGGER IF EXISTS trg_cutting_jobs_scrap_percentage ON public.cutting_jobs;
CREATE TRIGGER trg_cutting_jobs_scrap_percentage
    BEFORE INSERT OR UPDATE ON public.cutting_jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_calculate_scrap_percentage();

DROP TRIGGER IF EXISTS trg_cutting_jobs_weight_balance ON public.cutting_jobs;
CREATE TRIGGER trg_cutting_jobs_weight_balance
    BEFORE INSERT OR UPDATE ON public.cutting_jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_validate_weight_balance();

DROP TRIGGER IF EXISTS trg_cutting_jobs_tracking_id ON public.cutting_jobs;
CREATE TRIGGER trg_cutting_jobs_tracking_id
    BEFORE INSERT ON public.cutting_jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_generate_scrap_tracking_id();

DROP TRIGGER IF EXISTS trg_cutting_jobs_stock ON public.cutting_jobs;
CREATE TRIGGER trg_cutting_jobs_stock
    AFTER INSERT OR UPDATE ON public.cutting_jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_material_stock();

-- Scrap entries approval trigger
DROP TRIGGER IF EXISTS trg_scrap_entries_approval ON public.scrap_entries;
CREATE TRIGGER trg_scrap_entries_approval
    BEFORE UPDATE ON public.scrap_entries
    FOR EACH ROW
    WHEN (OLD.approval_status IS DISTINCT FROM NEW.approval_status)
    EXECUTE FUNCTION public.trigger_validate_scrap_approval();

-- ============================================================================
-- HELPER FUNCTIONS FOR BUSINESS LOGIC
-- ============================================================================

-- Function to get job statistics
CREATE OR REPLACE FUNCTION public.fn_get_job_stats(job_id UUID)
RETURNS TABLE (
    total_input DECIMAL,
    total_output DECIMAL,
    total_scrap DECIMAL,
    scrap_percentage DECIMAL,
    cut_pieces_count INTEGER,
    scrap_entries_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cj.total_input_weight_kg,
        cj.total_output_weight_kg,
        cj.total_scrap_weight_kg,
        cj.scrap_percentage,
        COUNT(DISTINCT cp.id)::INTEGER as cut_pieces_count,
        COUNT(DISTINCT se.id)::INTEGER as scrap_entries_count
    FROM public.cutting_jobs cj
    LEFT JOIN public.cut_pieces cp ON cp.cutting_job_id = cj.id AND cp.deleted_at IS NULL
    LEFT JOIN public.scrap_entries se ON se.cutting_job_id = cj.id AND se.deleted_at IS NULL
    WHERE cj.id = job_id AND cj.deleted_at IS NULL
    GROUP BY cj.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check material availability
CREATE OR REPLACE FUNCTION public.fn_check_material_availability(
    material_id_param UUID,
    required_qty DECIMAL
) RETURNS BOOLEAN AS $$
DECLARE
    available_qty DECIMAL;
BEGIN
    SELECT current_stock_qty INTO available_qty
    FROM public.raw_materials
    WHERE id = material_id_param 
    AND status = 'ACTIVE'
    AND deleted_at IS NULL;
    
    RETURN available_qty >= required_qty;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pending approvals for supervisor
CREATE OR REPLACE FUNCTION public.fn_get_pending_approvals(supervisor_id_param UUID)
RETURNS TABLE (
    scrap_entry_id UUID,
    job_order_no VARCHAR,
    operator_name VARCHAR,
    scrap_weight_kg DECIMAL,
    scrap_date DATE,
    material_category material_category
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        se.id,
        cj.job_order_no,
        u.full_name,
        se.scrap_weight_kg,
        se.scrap_date,
        se.material_category
    FROM public.scrap_entries se
    JOIN public.cutting_jobs cj ON cj.id = se.cutting_job_id
    JOIN public.users u ON u.id = se.operator_id
    WHERE cj.supervisor_id = supervisor_id_param
    AND se.approval_status = 'PENDING'
    AND se.deleted_at IS NULL
    AND cj.deleted_at IS NULL
    ORDER BY se.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PERFORMANCE INDEXES (Additional)
-- ============================================================================

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_cutting_jobs_operator_date 
ON public.cutting_jobs(operator_id, job_date) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_cutting_jobs_supervisor_status 
ON public.cutting_jobs(supervisor_id, status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_scrap_entries_approval_date 
ON public.scrap_entries(approval_status, scrap_date) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_cut_pieces_status_operation 
ON public.cut_pieces(status, next_operation) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_bin_movements_date_operation 
ON public.bin_movements(movement_date, to_operation) WHERE deleted_at IS NULL;

-- Partial indexes for active records
CREATE INDEX IF NOT EXISTS idx_users_active_role 
ON public.users(role) WHERE is_active = true AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_materials_active_category 
ON public.raw_materials(material_category) WHERE status = 'ACTIVE' AND deleted_at IS NULL;

-- GIN indexes for JSONB fields
CREATE INDEX IF NOT EXISTS idx_scrap_entries_photos ON public.scrap_entries USING GIN (photos);
CREATE INDEX IF NOT EXISTS idx_system_config_value ON public.system_config USING GIN (value);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_raw_materials_search 
ON public.raw_materials USING GIN (to_tsvector('english', material_identification));

CREATE INDEX IF NOT EXISTS idx_finished_goods_search 
ON public.finished_goods USING GIN (to_tsvector('english', fg_name || ' ' || COALESCE(customer_name, '')));

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Audit triggers created successfully';
    RAISE NOTICE '✅ Automatic updated_at triggers attached';
    RAISE NOTICE '✅ Hard delete prevention enabled';
    RAISE NOTICE '✅ Business logic triggers attached';
    RAISE NOTICE '✅ Additional performance indexes created';
    RAISE NOTICE '⚠️  Next: Run 00004_add_materialized_views.sql';
END $$;
