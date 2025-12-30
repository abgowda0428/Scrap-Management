-- ============================================================================
-- AUTOCRAT ENGINEERS - SCRAP MANAGEMENT SYSTEM
-- Database Schema - Initial Migration
-- 
-- Description: Complete normalized database schema for scrap management
-- Version: 1.0.0
-- Author: Principal Engineer (SDE-3+)
-- Security: Row Level Security (RLS) enforced on all tables
-- 
-- ⚠️  CRITICAL: This schema follows zero-trust security model
-- ⚠️  All tables have RLS enabled by default
-- ⚠️  Service role should only be used in Edge Functions
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMS (Type Safety)
-- ============================================================================

CREATE TYPE user_role AS ENUM ('OPERATOR', 'SUPERVISOR', 'MANAGER', 'ADMIN');
CREATE TYPE job_status AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE end_piece_status AS ENUM ('AVAILABLE', 'RESERVED', 'USED', 'SCRAPED');
CREATE TYPE material_status AS ENUM ('ACTIVE', 'DEPLETED', 'DISCONTINUED');
CREATE TYPE machine_status AS ENUM ('ACTIVE', 'MAINTENANCE', 'INACTIVE');
CREATE TYPE scrap_type AS ENUM ('KERF_LOSS', 'END_CUT', 'WRONG_CUT', 'DAMAGED', 'SETUP_WASTE');
CREATE TYPE scrap_category AS ENUM ('OPERATOR_ERROR', 'MACHINE_ERROR', 'MATERIAL_DEFECT', 'SETUP', 'NORMAL');
CREATE TYPE severity AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE shift AS ENUM ('DAY', 'NIGHT', 'AFTERNOON');
CREATE TYPE material_type AS ENUM ('Sheet', 'Rod', 'Pipe', 'Tube', 'Bar', 'Round Rod', 'Flat Bar', 'Square Bar', 'T-Bar');
CREATE TYPE material_category AS ENUM ('STAINLESS_STEEL', 'ALUMINUM', 'BRASS', 'PVDF', 'PLASTIC', 'MILD_STEEL');
CREATE TYPE material_shape AS ENUM ('Round', 'Flat', 'Square', 'Sheet', 'T-Section', 'Pipe', 'Tube');
CREATE TYPE scrap_classification AS ENUM ('REUSABLE', 'NON_REUSABLE');
CREATE TYPE approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE cut_piece_status AS ENUM ('AVAILABLE', 'IN_PROCESS', 'COMPLETED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'RECEIVED', 'PARTIAL');

-- ============================================================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================================================

CREATE TABLE public.users (
    -- Primary Key
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- User Information
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    
    -- Role & Access
    role user_role NOT NULL DEFAULT 'OPERATOR',
    department VARCHAR(100) NOT NULL,
    shift shift NOT NULL DEFAULT 'DAY',
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    created_by UUID REFERENCES public.users(id),
    updated_by UUID REFERENCES public.users(id),
    
    -- Soft Delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES public.users(id)
);

-- Indexes for performance
CREATE INDEX idx_users_employee_id ON public.users(employee_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON public.users(role) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_department ON public.users(department) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_is_active ON public.users(is_active) WHERE deleted_at IS NULL;

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Application users with role-based access control';
COMMENT ON COLUMN public.users.employee_id IS 'Company employee ID for internal tracking';
COMMENT ON COLUMN public.users.role IS 'User role for RBAC (OPERATOR, SUPERVISOR, MANAGER, ADMIN)';

-- ============================================================================
-- RAW MATERIALS TABLE
-- ============================================================================

CREATE TABLE public.raw_materials (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Material Identification
    item_code VARCHAR(50) UNIQUE NOT NULL, -- Internal code (e.g., RM0001)
    material_identification TEXT NOT NULL, -- Format: Shape/Dimension + Size + Material Type + Grade
    material_shape material_shape NOT NULL,
    material_category material_category NOT NULL,
    material_type VARCHAR(100) NOT NULL, -- Stainless Steel, Aluminum, etc.
    material_grade VARCHAR(50) NOT NULL, -- SS304, SS316, 6061, etc.
    dimension_size VARCHAR(100) NOT NULL, -- e.g., "Dia 60mm", "50x25mm"
    
    -- Dimensions (nullable based on shape)
    standard_length DECIMAL(10,2), -- mm
    standard_width DECIMAL(10,2), -- mm
    standard_thickness DECIMAL(10,2), -- mm
    standard_diameter DECIMAL(10,2), -- mm
    
    -- Inventory
    unit_of_measure VARCHAR(10) NOT NULL DEFAULT 'kg',
    cost_per_kg DECIMAL(10,2) NOT NULL CHECK (cost_per_kg >= 0),
    current_stock_qty DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (current_stock_qty >= 0),
    min_usable_size DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Supplier Information
    supplier_name VARCHAR(255) NOT NULL,
    batch_no VARCHAR(100),
    received_date DATE,
    
    -- Status
    status material_status NOT NULL DEFAULT 'ACTIVE',
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id),
    updated_by UUID REFERENCES public.users(id),
    
    -- Soft Delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES public.users(id)
);

-- Indexes
CREATE INDEX idx_raw_materials_item_code ON public.raw_materials(item_code) WHERE deleted_at IS NULL;
CREATE INDEX idx_raw_materials_category ON public.raw_materials(material_category) WHERE deleted_at IS NULL;
CREATE INDEX idx_raw_materials_status ON public.raw_materials(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_raw_materials_stock ON public.raw_materials(current_stock_qty) WHERE deleted_at IS NULL;

COMMENT ON TABLE public.raw_materials IS 'Raw materials inventory with detailed specifications';

-- ============================================================================
-- MACHINES TABLE
-- ============================================================================

CREATE TABLE public.machines (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Machine Information
    machine_code VARCHAR(50) UNIQUE NOT NULL,
    machine_name VARCHAR(255) NOT NULL,
    machine_type VARCHAR(100) NOT NULL, -- Hydraulic Shear, Band Saw, CNC, etc.
    location VARCHAR(255) NOT NULL,
    
    -- Status
    status machine_status NOT NULL DEFAULT 'ACTIVE',
    
    -- Maintenance
    installation_date DATE,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id),
    updated_by UUID REFERENCES public.users(id),
    
    -- Soft Delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES public.users(id)
);

-- Indexes
CREATE INDEX idx_machines_code ON public.machines(machine_code) WHERE deleted_at IS NULL;
CREATE INDEX idx_machines_status ON public.machines(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_machines_type ON public.machines(machine_type) WHERE deleted_at IS NULL;

COMMENT ON TABLE public.machines IS 'Manufacturing machines and equipment';

-- ============================================================================
-- FINISHED GOODS TABLE
-- ============================================================================

CREATE TABLE public.finished_goods (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- FG Information
    fg_code VARCHAR(50) UNIQUE NOT NULL,
    fg_name VARCHAR(255) NOT NULL,
    fg_description TEXT,
    customer_name VARCHAR(255),
    
    -- Specifications
    drawing_number VARCHAR(100),
    revision VARCHAR(20),
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id),
    updated_by UUID REFERENCES public.users(id),
    
    -- Soft Delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES public.users(id)
);

-- Indexes
CREATE INDEX idx_finished_goods_code ON public.finished_goods(fg_code) WHERE deleted_at IS NULL;
CREATE INDEX idx_finished_goods_customer ON public.finished_goods(customer_name) WHERE deleted_at IS NULL;

COMMENT ON TABLE public.finished_goods IS 'Finished goods catalog with customer mapping';

-- ============================================================================
-- CUTTING JOBS TABLE
-- ============================================================================

CREATE TABLE public.cutting_jobs (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Job Information
    job_order_no VARCHAR(100) UNIQUE NOT NULL,
    scrap_tracking_id VARCHAR(100) UNIQUE NOT NULL,
    job_date DATE NOT NULL,
    shift shift NOT NULL,
    
    -- References
    operator_id UUID NOT NULL REFERENCES public.users(id),
    supervisor_id UUID NOT NULL REFERENCES public.users(id),
    machine_id UUID NOT NULL REFERENCES public.machines(id),
    material_id UUID NOT NULL REFERENCES public.raw_materials(id),
    
    -- Quantities (all in kg)
    planned_output_qty INTEGER NOT NULL CHECK (planned_output_qty > 0),
    actual_output_qty INTEGER NOT NULL DEFAULT 0,
    total_input_weight_kg DECIMAL(10,2) NOT NULL CHECK (total_input_weight_kg >= 0),
    total_output_weight_kg DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (total_output_weight_kg >= 0),
    total_reusable_weight_kg DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (total_reusable_weight_kg >= 0),
    total_end_piece_weight_kg DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (total_end_piece_weight_kg >= 0),
    total_scrap_weight_kg DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (total_scrap_weight_kg >= 0),
    
    -- Calculated Fields
    scrap_percentage DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (scrap_percentage >= 0 AND scrap_percentage <= 100),
    expected_scrap_percentage DECIMAL(5,2) CHECK (expected_scrap_percentage >= 0 AND expected_scrap_percentage <= 100),
    
    -- Status
    status job_status NOT NULL DEFAULT 'PLANNED',
    
    -- SAP Integration
    sap_updated BOOLEAN NOT NULL DEFAULT false,
    sap_update_date TIMESTAMPTZ,
    
    -- Notes
    notes TEXT,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.users(id),
    updated_by UUID REFERENCES public.users(id),
    
    -- Soft Delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES public.users(id),
    
    -- Constraints
    CONSTRAINT chk_total_weight_balance CHECK (
        total_output_weight_kg + total_reusable_weight_kg + 
        total_end_piece_weight_kg + total_scrap_weight_kg <= total_input_weight_kg * 1.01
    )
);

-- Indexes
CREATE INDEX idx_cutting_jobs_job_order ON public.cutting_jobs(job_order_no) WHERE deleted_at IS NULL;
CREATE INDEX idx_cutting_jobs_tracking_id ON public.cutting_jobs(scrap_tracking_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_cutting_jobs_operator ON public.cutting_jobs(operator_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_cutting_jobs_supervisor ON public.cutting_jobs(supervisor_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_cutting_jobs_machine ON public.cutting_jobs(machine_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_cutting_jobs_material ON public.cutting_jobs(material_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_cutting_jobs_status ON public.cutting_jobs(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_cutting_jobs_date ON public.cutting_jobs(job_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_cutting_jobs_sap ON public.cutting_jobs(sap_updated) WHERE deleted_at IS NULL;

COMMENT ON TABLE public.cutting_jobs IS 'Cutting operations with material tracking and scrap calculation';

-- ============================================================================
-- CUT PIECES TABLE
-- ============================================================================

CREATE TABLE public.cut_pieces (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    cutting_job_id UUID NOT NULL REFERENCES public.cutting_jobs(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES public.raw_materials(id),
    finished_good_id UUID REFERENCES public.finished_goods(id),
    operator_id UUID NOT NULL REFERENCES public.users(id),
    machine_id UUID NOT NULL REFERENCES public.machines(id),
    
    -- Cut Piece Information
    finished_good_code VARCHAR(50) NOT NULL,
    finished_good_name VARCHAR(255) NOT NULL,
    single_part_weight_kg DECIMAL(10,3) NOT NULL CHECK (single_part_weight_kg > 0),
    cut_pieces_count INTEGER NOT NULL CHECK (cut_pieces_count > 0),
    total_weight_kg DECIMAL(10,2) NOT NULL CHECK (total_weight_kg > 0),
    
    -- Next Operation
    next_operation VARCHAR(100) NOT NULL,
    
    -- Details
    cut_pieces_details TEXT,
    is_reusable BOOLEAN NOT NULL DEFAULT true,
    
    -- Status & Tracking
    status cut_piece_status NOT NULL DEFAULT 'AVAILABLE',
    used_in_job_id VARCHAR(100), -- Bin ID or next job ID
    used_date DATE,
    
    -- Operation Details
    operation_date DATE NOT NULL,
    operation_time TIME NOT NULL,
    
    -- Notes
    notes TEXT,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id),
    updated_by UUID REFERENCES public.users(id),
    
    -- Soft Delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES public.users(id),
    
    -- Constraints
    CONSTRAINT chk_weight_calculation CHECK (
        ABS(total_weight_kg - (single_part_weight_kg * cut_pieces_count)) < 0.1
    )
);

-- Indexes
CREATE INDEX idx_cut_pieces_job ON public.cut_pieces(cutting_job_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_cut_pieces_material ON public.cut_pieces(material_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_cut_pieces_fg ON public.cut_pieces(finished_good_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_cut_pieces_operator ON public.cut_pieces(operator_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_cut_pieces_status ON public.cut_pieces(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_cut_pieces_next_operation ON public.cut_pieces(next_operation) WHERE deleted_at IS NULL;
CREATE INDEX idx_cut_pieces_date ON public.cut_pieces(operation_date) WHERE deleted_at IS NULL;

COMMENT ON TABLE public.cut_pieces IS 'Cut pieces tracking for work order material flow';

-- ============================================================================
-- BIN MOVEMENTS TABLE
-- ============================================================================

CREATE TABLE public.bin_movements (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Bin Information
    bin_id VARCHAR(100) UNIQUE NOT NULL,
    job_order_no VARCHAR(100) NOT NULL,
    
    -- Material Information
    material_id UUID NOT NULL REFERENCES public.raw_materials(id),
    finished_good_id UUID REFERENCES public.finished_goods(id),
    
    -- Quantities
    pieces_count INTEGER NOT NULL CHECK (pieces_count > 0),
    total_weight_kg DECIMAL(10,2) NOT NULL CHECK (total_weight_kg > 0),
    
    -- Movement
    from_operation VARCHAR(100) NOT NULL,
    to_operation VARCHAR(100) NOT NULL,
    
    -- Tracking
    operator_id UUID NOT NULL REFERENCES public.users(id),
    movement_date DATE NOT NULL,
    movement_time TIME NOT NULL,
    
    -- Notes
    notes TEXT,
    
    -- Label printed
    label_printed BOOLEAN NOT NULL DEFAULT false,
    label_printed_at TIMESTAMPTZ,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id),
    updated_by UUID REFERENCES public.users(id),
    
    -- Soft Delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES public.users(id)
);

-- Indexes
CREATE INDEX idx_bin_movements_bin_id ON public.bin_movements(bin_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bin_movements_job_order ON public.bin_movements(job_order_no) WHERE deleted_at IS NULL;
CREATE INDEX idx_bin_movements_material ON public.bin_movements(material_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bin_movements_from_operation ON public.bin_movements(from_operation) WHERE deleted_at IS NULL;
CREATE INDEX idx_bin_movements_to_operation ON public.bin_movements(to_operation) WHERE deleted_at IS NULL;
CREATE INDEX idx_bin_movements_date ON public.bin_movements(movement_date) WHERE deleted_at IS NULL;

COMMENT ON TABLE public.bin_movements IS 'Bin-based material movements with traceability';

-- ============================================================================
-- SCRAP REASONS MASTER TABLE
-- ============================================================================

CREATE TABLE public.scrap_reasons (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Reason Information
    reason_code VARCHAR(50) UNIQUE NOT NULL,
    reason_name VARCHAR(255) NOT NULL,
    category scrap_category NOT NULL,
    description TEXT,
    
    -- Classification
    is_avoidable BOOLEAN NOT NULL DEFAULT true,
    severity severity NOT NULL DEFAULT 'MEDIUM',
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id),
    updated_by UUID REFERENCES public.users(id),
    
    -- Soft Delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES public.users(id)
);

-- Indexes
CREATE INDEX idx_scrap_reasons_code ON public.scrap_reasons(reason_code) WHERE deleted_at IS NULL;
CREATE INDEX idx_scrap_reasons_category ON public.scrap_reasons(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_scrap_reasons_active ON public.scrap_reasons(is_active) WHERE deleted_at IS NULL;

COMMENT ON TABLE public.scrap_reasons IS 'Master data for scrap reason codes';

-- ============================================================================
-- SCRAP ENTRIES TABLE
-- ============================================================================

CREATE TABLE public.scrap_entries (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    scrap_tracking_id VARCHAR(100) NOT NULL,
    cutting_job_id UUID NOT NULL REFERENCES public.cutting_jobs(id),
    material_id UUID NOT NULL REFERENCES public.raw_materials(id),
    machine_id UUID NOT NULL REFERENCES public.machines(id),
    operator_id UUID NOT NULL REFERENCES public.users(id),
    reason_id UUID NOT NULL REFERENCES public.scrap_reasons(id),
    
    -- Scrap Information
    material_category material_category NOT NULL,
    scrap_classification scrap_classification NOT NULL,
    scrap_date DATE NOT NULL,
    scrap_time TIME NOT NULL,
    scrap_weight_kg DECIMAL(10,2) NOT NULL CHECK (scrap_weight_kg > 0),
    scrap_quantity INTEGER NOT NULL CHECK (scrap_quantity > 0),
    dimension_details TEXT,
    scrap_type scrap_type NOT NULL,
    scrap_value_estimate DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (scrap_value_estimate >= 0),
    is_recyclable BOOLEAN NOT NULL DEFAULT true,
    
    -- Approval Workflow
    approval_status approval_status NOT NULL DEFAULT 'PENDING',
    approved_by_id UUID REFERENCES public.users(id),
    approval_date TIMESTAMPTZ,
    approval_notes TEXT,
    
    -- Reusable Scrap Tracking
    reusable_label VARCHAR(100),
    reusable_storage_location VARCHAR(255),
    potential_use VARCHAR(255),
    reused_in_job_id UUID REFERENCES public.cutting_jobs(id),
    reused_date DATE,
    
    -- Non-Reusable Disposal
    disposed_to_vendor BOOLEAN NOT NULL DEFAULT false,
    disposal_date DATE,
    sold_to_buyer VARCHAR(255),
    sale_value DECIMAL(10,2) CHECK (sale_value >= 0),
    sale_date DATE,
    
    -- Photos (JSON array of storage paths)
    photos JSONB DEFAULT '[]'::jsonb,
    
    -- Notes
    notes TEXT,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id),
    updated_by UUID REFERENCES public.users(id),
    
    -- Soft Delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES public.users(id)
);

-- Indexes
CREATE INDEX idx_scrap_entries_tracking_id ON public.scrap_entries(scrap_tracking_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_scrap_entries_job ON public.scrap_entries(cutting_job_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_scrap_entries_material ON public.scrap_entries(material_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_scrap_entries_operator ON public.scrap_entries(operator_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_scrap_entries_category ON public.scrap_entries(material_category) WHERE deleted_at IS NULL;
CREATE INDEX idx_scrap_entries_classification ON public.scrap_entries(scrap_classification) WHERE deleted_at IS NULL;
CREATE INDEX idx_scrap_entries_approval ON public.scrap_entries(approval_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_scrap_entries_date ON public.scrap_entries(scrap_date) WHERE deleted_at IS NULL;

COMMENT ON TABLE public.scrap_entries IS 'Scrap entries with approval workflow and disposal tracking';

-- ============================================================================
-- END PIECES TABLE
-- ============================================================================

CREATE TABLE public.end_pieces (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    end_piece_code VARCHAR(100) UNIQUE NOT NULL,
    scrap_tracking_id VARCHAR(100) NOT NULL,
    cutting_job_id UUID NOT NULL REFERENCES public.cutting_jobs(id),
    material_id UUID NOT NULL REFERENCES public.raw_materials(id),
    
    -- Dimensions
    length DECIMAL(10,2) NOT NULL CHECK (length > 0),
    width DECIMAL(10,2) CHECK (width > 0),
    thickness DECIMAL(10,2) NOT NULL CHECK (thickness > 0),
    diameter DECIMAL(10,2) CHECK (diameter > 0),
    weight_kg DECIMAL(10,2) NOT NULL CHECK (weight_kg > 0),
    
    -- Storage
    storage_location VARCHAR(255) NOT NULL,
    reusable_label VARCHAR(100),
    barcode VARCHAR(100),
    
    -- Status & Usage
    status end_piece_status NOT NULL DEFAULT 'AVAILABLE',
    used_in_job_id UUID REFERENCES public.cutting_jobs(id),
    used_date DATE,
    
    -- Notes
    notes TEXT,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id),
    updated_by UUID REFERENCES public.users(id),
    
    -- Soft Delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES public.users(id)
);

-- Indexes
CREATE INDEX idx_end_pieces_code ON public.end_pieces(end_piece_code) WHERE deleted_at IS NULL;
CREATE INDEX idx_end_pieces_tracking_id ON public.end_pieces(scrap_tracking_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_end_pieces_job ON public.end_pieces(cutting_job_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_end_pieces_material ON public.end_pieces(material_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_end_pieces_status ON public.end_pieces(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_end_pieces_storage ON public.end_pieces(storage_location) WHERE deleted_at IS NULL;

COMMENT ON TABLE public.end_pieces IS 'End piece inventory with reusability tracking';

-- ============================================================================
-- AUDIT LOG TABLE (Complete System Audit Trail)
-- ============================================================================

CREATE TABLE public.audit_logs (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Audit Information
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    
    -- Changes
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    
    -- User & Context
    user_id UUID REFERENCES public.users(id),
    user_role user_role,
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_table ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_record ON public.audit_logs(record_id);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_operation ON public.audit_logs(operation);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

COMMENT ON TABLE public.audit_logs IS 'Complete audit trail for all data changes';

-- ============================================================================
-- SYSTEM CONFIGURATION TABLE
-- ============================================================================

CREATE TABLE public.system_config (
    -- Primary Key
    key VARCHAR(100) PRIMARY KEY,
    
    -- Configuration
    value JSONB NOT NULL,
    description TEXT,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES public.users(id)
);

COMMENT ON TABLE public.system_config IS 'System-wide configuration settings';

-- ============================================================================
-- INITIAL CONFIGURATION DATA
-- ============================================================================

INSERT INTO public.system_config (key, value, description) VALUES
('scrap_thresholds', '{"low": 2, "medium": 5, "high": 10}'::jsonb, 'Scrap percentage thresholds for alerts'),
('max_file_upload_size_mb', '10'::jsonb, 'Maximum file upload size in MB'),
('allowed_photo_formats', '["jpg", "jpeg", "png"]'::jsonb, 'Allowed photo file formats'),
('bin_label_format', '{"prefix": "BIN", "date_format": "YYYYMMDD", "sequence_length": 3}'::jsonb, 'Bin label ID format'),
('sap_integration_enabled', 'true'::jsonb, 'Enable/disable SAP integration'),
('approval_required_threshold_kg', '50'::jsonb, 'Scrap weight requiring supervisor approval');

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Initial schema created successfully';
    RAISE NOTICE '✅ Tables: 15';
    RAISE NOTICE '✅ Enums: 17';
    RAISE NOTICE '⚠️  Next: Run 00002_add_rls_policies.sql';
END $$;
