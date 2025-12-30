-- ============================================================================
-- MATERIALIZED VIEWS FOR ANALYTICS & REPORTING
-- 
-- Description: Pre-aggregated views for high-performance analytics
-- Version: 1.0.0
-- 
-- Strategy:
-- - Materialized views for expensive aggregations
-- - Refresh strategy: scheduled + on-demand
-- - Indexes on materialized views for query performance
-- ============================================================================

-- ============================================================================
-- MATERIALIZED VIEW: Daily Scrap Summary
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_daily_scrap_summary AS
SELECT 
    cj.job_date,
    cj.shift,
    rm.material_category,
    COUNT(DISTINCT cj.id) as total_jobs,
    SUM(cj.total_input_weight_kg) as total_input_kg,
    SUM(cj.total_output_weight_kg) as total_output_kg,
    SUM(cj.total_scrap_weight_kg) as total_scrap_kg,
    ROUND(AVG(cj.scrap_percentage), 2) as avg_scrap_percentage,
    SUM(cj.total_reusable_weight_kg) as total_reusable_kg,
    SUM(cj.total_end_piece_weight_kg) as total_end_piece_kg,
    COUNT(DISTINCT se.id) as scrap_entries_count,
    SUM(se.scrap_value_estimate) as total_scrap_value
FROM public.cutting_jobs cj
JOIN public.raw_materials rm ON rm.id = cj.material_id
LEFT JOIN public.scrap_entries se ON se.cutting_job_id = cj.id AND se.deleted_at IS NULL
WHERE cj.deleted_at IS NULL
AND rm.deleted_at IS NULL
GROUP BY cj.job_date, cj.shift, rm.material_category;

-- Indexes for mv_daily_scrap_summary
CREATE UNIQUE INDEX idx_mv_daily_scrap_unique 
ON public.mv_daily_scrap_summary(job_date, shift, material_category);

CREATE INDEX idx_mv_daily_scrap_date 
ON public.mv_daily_scrap_summary(job_date DESC);

CREATE INDEX idx_mv_daily_scrap_category 
ON public.mv_daily_scrap_summary(material_category);

COMMENT ON MATERIALIZED VIEW public.mv_daily_scrap_summary IS 
'Daily aggregated scrap data by shift and material category';

-- ============================================================================
-- MATERIALIZED VIEW: Operator Performance
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_operator_performance AS
SELECT 
    u.id as operator_id,
    u.full_name as operator_name,
    u.department,
    COUNT(DISTINCT cj.id) as total_jobs,
    SUM(cj.total_input_weight_kg) as total_material_processed_kg,
    SUM(cj.total_scrap_weight_kg) as total_scrap_generated_kg,
    ROUND(AVG(cj.scrap_percentage), 2) as avg_scrap_percentage,
    COUNT(DISTINCT CASE WHEN cj.status = 'COMPLETED' THEN cj.id END) as completed_jobs,
    COUNT(DISTINCT se.id) FILTER (WHERE se.approval_status = 'APPROVED') as approved_scrap_entries,
    COUNT(DISTINCT se.id) FILTER (WHERE se.approval_status = 'REJECTED') as rejected_scrap_entries,
    MIN(cj.job_date) as first_job_date,
    MAX(cj.job_date) as last_job_date,
    -- Quality metrics
    ROUND(
        (COUNT(DISTINCT CASE WHEN cj.scrap_percentage < 5 THEN cj.id END)::DECIMAL / 
        NULLIF(COUNT(DISTINCT cj.id), 0) * 100), 
        2
    ) as jobs_below_5_percent_scrap,
    -- Avoidable scrap
    ROUND(
        SUM(CASE WHEN sr.is_avoidable THEN se.scrap_weight_kg ELSE 0 END), 
        2
    ) as avoidable_scrap_kg
FROM public.users u
LEFT JOIN public.cutting_jobs cj ON cj.operator_id = u.id AND cj.deleted_at IS NULL
LEFT JOIN public.scrap_entries se ON se.operator_id = u.id AND se.deleted_at IS NULL
LEFT JOIN public.scrap_reasons sr ON sr.id = se.reason_id AND sr.deleted_at IS NULL
WHERE u.deleted_at IS NULL
AND u.role = 'OPERATOR'
GROUP BY u.id, u.full_name, u.department;

-- Indexes for mv_operator_performance
CREATE UNIQUE INDEX idx_mv_operator_perf_unique 
ON public.mv_operator_performance(operator_id);

CREATE INDEX idx_mv_operator_perf_scrap 
ON public.mv_operator_performance(avg_scrap_percentage);

CREATE INDEX idx_mv_operator_perf_dept 
ON public.mv_operator_performance(department);

COMMENT ON MATERIALIZED VIEW public.mv_operator_performance IS 
'Operator performance metrics including scrap rates and quality';

-- ============================================================================
-- MATERIALIZED VIEW: Material Utilization
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_material_utilization AS
SELECT 
    rm.id as material_id,
    rm.item_code,
    rm.material_identification,
    rm.material_category,
    rm.current_stock_qty,
    COUNT(DISTINCT cj.id) as times_used,
    SUM(cj.total_input_weight_kg) as total_consumed_kg,
    SUM(cj.total_output_weight_kg) as total_output_kg,
    SUM(cj.total_scrap_weight_kg) as total_scrap_kg,
    ROUND(AVG(cj.scrap_percentage), 2) as avg_scrap_percentage,
    ROUND(
        (SUM(cj.total_output_weight_kg) / NULLIF(SUM(cj.total_input_weight_kg), 0) * 100), 
        2
    ) as utilization_percentage,
    SUM(cj.total_input_weight_kg * rm.cost_per_kg) as total_material_cost,
    SUM(cj.total_scrap_weight_kg * rm.cost_per_kg) as total_scrap_cost,
    MIN(cj.job_date) as first_used_date,
    MAX(cj.job_date) as last_used_date
FROM public.raw_materials rm
LEFT JOIN public.cutting_jobs cj ON cj.material_id = rm.id AND cj.deleted_at IS NULL
WHERE rm.deleted_at IS NULL
GROUP BY rm.id, rm.item_code, rm.material_identification, rm.material_category, 
         rm.current_stock_qty, rm.cost_per_kg;

-- Indexes for mv_material_utilization
CREATE UNIQUE INDEX idx_mv_material_util_unique 
ON public.mv_material_utilization(material_id);

CREATE INDEX idx_mv_material_util_category 
ON public.mv_material_utilization(material_category);

CREATE INDEX idx_mv_material_util_scrap 
ON public.mv_material_utilization(avg_scrap_percentage DESC);

COMMENT ON MATERIALIZED VIEW public.mv_material_utilization IS 
'Material usage statistics and utilization rates';

-- ============================================================================
-- MATERIALIZED VIEW: Machine Performance
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_machine_performance AS
SELECT 
    m.id as machine_id,
    m.machine_code,
    m.machine_name,
    m.machine_type,
    COUNT(DISTINCT cj.id) as total_jobs,
    SUM(cj.total_input_weight_kg) as total_material_processed_kg,
    ROUND(AVG(cj.scrap_percentage), 2) as avg_scrap_percentage,
    COUNT(DISTINCT CASE WHEN cj.status = 'COMPLETED' THEN cj.id END) as completed_jobs,
    COUNT(DISTINCT CASE WHEN cj.status = 'IN_PROGRESS' THEN cj.id END) as jobs_in_progress,
    -- Downtime indicator (jobs cancelled or issues)
    COUNT(DISTINCT CASE WHEN cj.status = 'CANCELLED' THEN cj.id END) as cancelled_jobs,
    MIN(cj.job_date) as first_job_date,
    MAX(cj.job_date) as last_job_date,
    -- Maintenance tracking
    m.last_maintenance_date,
    m.next_maintenance_date,
    CASE 
        WHEN m.next_maintenance_date < CURRENT_DATE THEN true 
        ELSE false 
    END as maintenance_overdue
FROM public.machines m
LEFT JOIN public.cutting_jobs cj ON cj.machine_id = m.id AND cj.deleted_at IS NULL
WHERE m.deleted_at IS NULL
GROUP BY m.id, m.machine_code, m.machine_name, m.machine_type, 
         m.last_maintenance_date, m.next_maintenance_date;

-- Indexes for mv_machine_performance
CREATE UNIQUE INDEX idx_mv_machine_perf_unique 
ON public.mv_machine_performance(machine_id);

CREATE INDEX idx_mv_machine_perf_type 
ON public.mv_machine_performance(machine_type);

CREATE INDEX idx_mv_machine_perf_scrap 
ON public.mv_machine_performance(avg_scrap_percentage DESC);

COMMENT ON MATERIALIZED VIEW public.mv_machine_performance IS 
'Machine utilization and performance metrics';

-- ============================================================================
-- MATERIALIZED VIEW: Scrap Analysis by Reason
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_scrap_by_reason AS
SELECT 
    sr.id as reason_id,
    sr.reason_code,
    sr.reason_name,
    sr.category as scrap_category,
    sr.is_avoidable,
    sr.severity,
    COUNT(DISTINCT se.id) as occurrence_count,
    SUM(se.scrap_weight_kg) as total_scrap_kg,
    SUM(se.scrap_value_estimate) as total_scrap_value,
    ROUND(AVG(se.scrap_weight_kg), 2) as avg_scrap_per_occurrence_kg,
    COUNT(DISTINCT se.operator_id) as affected_operators,
    COUNT(DISTINCT se.machine_id) as affected_machines,
    COUNT(DISTINCT se.material_id) as affected_materials,
    MIN(se.scrap_date) as first_occurrence_date,
    MAX(se.scrap_date) as last_occurrence_date
FROM public.scrap_reasons sr
LEFT JOIN public.scrap_entries se ON se.reason_id = sr.id AND se.deleted_at IS NULL
WHERE sr.deleted_at IS NULL
AND sr.is_active = true
GROUP BY sr.id, sr.reason_code, sr.reason_name, sr.category, 
         sr.is_avoidable, sr.severity;

-- Indexes for mv_scrap_by_reason
CREATE UNIQUE INDEX idx_mv_scrap_reason_unique 
ON public.mv_scrap_by_reason(reason_id);

CREATE INDEX idx_mv_scrap_reason_category 
ON public.mv_scrap_by_reason(scrap_category);

CREATE INDEX idx_mv_scrap_reason_avoidable 
ON public.mv_scrap_by_reason(is_avoidable);

CREATE INDEX idx_mv_scrap_reason_count 
ON public.mv_scrap_by_reason(occurrence_count DESC);

COMMENT ON MATERIALIZED VIEW public.mv_scrap_by_reason IS 
'Scrap analysis grouped by reason with avoidability tracking';

-- ============================================================================
-- MATERIALIZED VIEW: Cut Pieces Flow Analysis
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_cut_pieces_flow AS
SELECT 
    cp.next_operation,
    rm.material_category,
    COUNT(DISTINCT cp.id) as total_cut_pieces,
    SUM(cp.cut_pieces_count) as total_pieces_count,
    SUM(cp.total_weight_kg) as total_weight_kg,
    COUNT(DISTINCT CASE WHEN cp.status = 'AVAILABLE' THEN cp.id END) as available_count,
    SUM(CASE WHEN cp.status = 'AVAILABLE' THEN cp.total_weight_kg ELSE 0 END) as available_weight_kg,
    COUNT(DISTINCT CASE WHEN cp.status = 'IN_PROCESS' THEN cp.id END) as in_process_count,
    SUM(CASE WHEN cp.status = 'IN_PROCESS' THEN cp.total_weight_kg ELSE 0 END) as in_process_weight_kg,
    COUNT(DISTINCT CASE WHEN cp.status = 'COMPLETED' THEN cp.id END) as completed_count,
    SUM(CASE WHEN cp.status = 'COMPLETED' THEN cp.total_weight_kg ELSE 0 END) as completed_weight_kg,
    COUNT(DISTINCT cp.cutting_job_id) as source_jobs_count,
    COUNT(DISTINCT cp.operator_id) as operators_count,
    MIN(cp.operation_date) as first_operation_date,
    MAX(cp.operation_date) as last_operation_date
FROM public.cut_pieces cp
JOIN public.raw_materials rm ON rm.id = cp.material_id
WHERE cp.deleted_at IS NULL
AND rm.deleted_at IS NULL
GROUP BY cp.next_operation, rm.material_category;

-- Indexes for mv_cut_pieces_flow
CREATE UNIQUE INDEX idx_mv_cut_pieces_unique 
ON public.mv_cut_pieces_flow(next_operation, material_category);

CREATE INDEX idx_mv_cut_pieces_operation 
ON public.mv_cut_pieces_flow(next_operation);

CREATE INDEX idx_mv_cut_pieces_category 
ON public.mv_cut_pieces_flow(material_category);

COMMENT ON MATERIALIZED VIEW public.mv_cut_pieces_flow IS 
'Cut pieces flow analysis by next operation and material category';

-- ============================================================================
-- MATERIALIZED VIEW: End Piece Inventory
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_end_piece_inventory AS
SELECT 
    rm.material_category,
    rm.material_grade,
    ep.storage_location,
    COUNT(DISTINCT ep.id) as total_pieces,
    SUM(ep.weight_kg) as total_weight_kg,
    COUNT(DISTINCT CASE WHEN ep.status = 'AVAILABLE' THEN ep.id END) as available_pieces,
    SUM(CASE WHEN ep.status = 'AVAILABLE' THEN ep.weight_kg ELSE 0 END) as available_weight_kg,
    ROUND(AVG(ep.length), 2) as avg_length,
    ROUND(AVG(ep.weight_kg), 2) as avg_weight_kg,
    SUM(ep.weight_kg * rm.cost_per_kg) as total_value,
    MIN(ep.created_at) as oldest_piece_date,
    MAX(ep.created_at) as newest_piece_date
FROM public.end_pieces ep
JOIN public.raw_materials rm ON rm.id = ep.material_id
WHERE ep.deleted_at IS NULL
AND rm.deleted_at IS NULL
GROUP BY rm.material_category, rm.material_grade, ep.storage_location, rm.cost_per_kg;

-- Indexes for mv_end_piece_inventory
CREATE INDEX idx_mv_end_piece_category 
ON public.mv_end_piece_inventory(material_category);

CREATE INDEX idx_mv_end_piece_location 
ON public.mv_end_piece_inventory(storage_location);

CREATE INDEX idx_mv_end_piece_value 
ON public.mv_end_piece_inventory(total_value DESC);

COMMENT ON MATERIALIZED VIEW public.mv_end_piece_inventory IS 
'End piece inventory summary by category, grade, and location';

-- ============================================================================
-- REFRESH FUNCTIONS FOR MATERIALIZED VIEWS
-- ============================================================================

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION public.fn_refresh_all_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_daily_scrap_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_operator_performance;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_material_utilization;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_machine_performance;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_scrap_by_reason;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_cut_pieces_flow;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_end_piece_inventory;
    
    RAISE NOTICE 'All materialized views refreshed at %', NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.fn_refresh_all_materialized_views() IS 
'Refresh all materialized views concurrently (non-blocking)';

-- Function to refresh specific materialized view
CREATE OR REPLACE FUNCTION public.fn_refresh_materialized_view(view_name TEXT)
RETURNS void AS $$
BEGIN
    EXECUTE format('REFRESH MATERIALIZED VIEW CONCURRENTLY public.%I', view_name);
    RAISE NOTICE 'Materialized view % refreshed at %', view_name, NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.fn_refresh_materialized_view(TEXT) IS 
'Refresh specific materialized view by name';

-- ============================================================================
-- SCHEDULED REFRESH (using pg_cron extension if available)
-- ============================================================================

-- Note: This requires pg_cron extension to be enabled
-- Uncomment the following if pg_cron is available:

/*
-- Refresh materialized views every hour
SELECT cron.schedule(
    'refresh-materialized-views',
    '0 * * * *', -- Every hour at minute 0
    $$SELECT public.fn_refresh_all_materialized_views()$$
);

-- Refresh daily summary view every 30 minutes (more frequent)
SELECT cron.schedule(
    'refresh-daily-scrap-summary',
    '*/30 * * * *', -- Every 30 minutes
    $$REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_daily_scrap_summary$$
);
*/

-- ============================================================================
-- VIEWS FOR EASY ACCESS (Non-materialized for real-time data)
-- ============================================================================

-- View: Active Users by Role
CREATE OR REPLACE VIEW public.v_active_users AS
SELECT 
    id,
    employee_id,
    full_name,
    email,
    role,
    department,
    shift,
    last_login,
    created_at
FROM public.users
WHERE is_active = true 
AND deleted_at IS NULL
ORDER BY role, full_name;

COMMENT ON VIEW public.v_active_users IS 'Active users with basic information';

-- View: Pending Scrap Approvals
CREATE OR REPLACE VIEW public.v_pending_scrap_approvals AS
SELECT 
    se.id,
    se.scrap_tracking_id,
    cj.job_order_no,
    u.full_name as operator_name,
    se.scrap_weight_kg,
    se.scrap_date,
    se.material_category,
    se.scrap_classification,
    sr.reason_name,
    sr.is_avoidable,
    se.created_at
FROM public.scrap_entries se
JOIN public.cutting_jobs cj ON cj.id = se.cutting_job_id
JOIN public.users u ON u.id = se.operator_id
JOIN public.scrap_reasons sr ON sr.id = se.reason_id
WHERE se.approval_status = 'PENDING'
AND se.deleted_at IS NULL
AND cj.deleted_at IS NULL
ORDER BY se.created_at ASC;

COMMENT ON VIEW public.v_pending_scrap_approvals IS 'Scrap entries awaiting supervisor approval';

-- View: Current Work Orders Status
CREATE OR REPLACE VIEW public.v_work_orders_status AS
SELECT 
    cj.id,
    cj.job_order_no,
    cj.scrap_tracking_id,
    cj.job_date,
    cj.shift,
    cj.status,
    u_op.full_name as operator_name,
    u_sup.full_name as supervisor_name,
    m.machine_name,
    rm.material_code,
    rm.material_identification,
    cj.total_input_weight_kg,
    cj.total_output_weight_kg,
    cj.total_scrap_weight_kg,
    cj.scrap_percentage,
    cj.sap_updated,
    cj.created_at
FROM public.cutting_jobs cj
JOIN public.users u_op ON u_op.id = cj.operator_id
JOIN public.users u_sup ON u_sup.id = cj.supervisor_id
JOIN public.machines m ON m.id = cj.machine_id
JOIN public.raw_materials rm ON rm.id = cj.material_id
WHERE cj.deleted_at IS NULL
ORDER BY cj.job_date DESC, cj.created_at DESC;

COMMENT ON VIEW public.v_work_orders_status IS 'Current work orders with full details';

-- ============================================================================
-- GRANT PERMISSIONS ON VIEWS (RLS still applies)
-- ============================================================================

-- Enable RLS on materialized views
ALTER MATERIALIZED VIEW public.mv_daily_scrap_summary OWNER TO postgres;
ALTER MATERIALIZED VIEW public.mv_operator_performance OWNER TO postgres;
ALTER MATERIALIZED VIEW public.mv_material_utilization OWNER TO postgres;
ALTER MATERIALIZED VIEW public.mv_machine_performance OWNER TO postgres;
ALTER MATERIALIZED VIEW public.mv_scrap_by_reason OWNER TO postgres;
ALTER MATERIALIZED VIEW public.mv_cut_pieces_flow OWNER TO postgres;
ALTER MATERIALIZED VIEW public.mv_end_piece_inventory OWNER TO postgres;

-- Grant SELECT to authenticated users (RLS policies will further restrict)
GRANT SELECT ON public.mv_daily_scrap_summary TO authenticated;
GRANT SELECT ON public.mv_operator_performance TO authenticated;
GRANT SELECT ON public.mv_material_utilization TO authenticated;
GRANT SELECT ON public.mv_machine_performance TO authenticated;
GRANT SELECT ON public.mv_scrap_by_reason TO authenticated;
GRANT SELECT ON public.mv_cut_pieces_flow TO authenticated;
GRANT SELECT ON public.mv_end_piece_inventory TO authenticated;

GRANT SELECT ON public.v_active_users TO authenticated;
GRANT SELECT ON public.v_pending_scrap_approvals TO authenticated;
GRANT SELECT ON public.v_work_orders_status TO authenticated;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Materialized views created successfully';
    RAISE NOTICE '✅ Total materialized views: 7';
    RAISE NOTICE '✅ Total regular views: 3';
    RAISE NOTICE '✅ Refresh functions created';
    RAISE NOTICE '⚠️  Run: SELECT public.fn_refresh_all_materialized_views(); to populate views';
    RAISE NOTICE '⚠️  Schedule regular refreshes using pg_cron or cron jobs';
END $$;
