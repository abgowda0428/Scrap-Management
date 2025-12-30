// Data Models for Scrap Management System

export type UserRole = 'OPERATOR' | 'SUPERVISOR' | 'MANAGER' | 'ADMIN';
export type JobStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type EndPieceStatus = 'AVAILABLE' | 'RESERVED' | 'USED' | 'SCRAPED';
export type MaterialStatus = 'ACTIVE' | 'DEPLETED' | 'DISCONTINUED';
export type MachineStatus = 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
export type ScrapType = 'KERF_LOSS' | 'END_CUT' | 'WRONG_CUT' | 'DAMAGED' | 'SETUP_WASTE';
export type ScrapCategory = 'OPERATOR_ERROR' | 'MACHINE_ERROR' | 'MATERIAL_DEFECT' | 'SETUP' | 'NORMAL';
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH';
export type UnitOfMeasure = 'kg' | 'lbs' | 'piece' | 'meter';
export type Shift = 'DAY' | 'NIGHT' | 'AFTERNOON';
export type MaterialType = 'Sheet' | 'Rod' | 'Pipe' | 'Tube' | 'Bar' | 'Round Rod' | 'Flat Bar' | 'Square Bar' | 'T-Bar';
export type MaterialCategory = 'STAINLESS_STEEL' | 'ALUMINUM' | 'BRASS' | 'PVDF' | 'PLASTIC' | 'MILD_STEEL';
export type MaterialShape = 'Round' | 'Flat' | 'Square' | 'Sheet' | 'T-Section' | 'Pipe' | 'Tube';
export type ScrapClassification = 'REUSABLE' | 'NON_REUSABLE';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  employee_id: string;
  username: string;
  password_hash: string;
  full_name: string;
  email: string;
  role: UserRole;
  department: string;
  shift: Shift;
  is_active: boolean;
  created_at: string;
  last_login: string;
}

export interface RawMaterial {
  id: string;
  item_code: string; // Internal item code (e.g., RM0001)
  material_identification: string; // Format: Shape/Dimension + Size + Material Type + Grade
  material_shape: MaterialShape;
  material_category: MaterialCategory;
  material_type: string; // Stainless Steel, Aluminum, Brass, PVDF, Plastic
  material_grade: string; // SS304, SS316, 6061, etc.
  dimension_size: string; // e.g., "Dia 60mm", "50x25mm", "4mm thick"
  standard_length?: number;
  standard_width?: number;
  standard_thickness?: number;
  standard_diameter?: number;
  unit_of_measure: 'kg'; // All materials in kg
  cost_per_kg: number;
  supplier_name: string;
  batch_no: string;
  received_date: string;
  current_stock_qty: number; // in kg
  min_usable_size: number;
  status: MaterialStatus;
  created_at: string;
  updated_at: string;
}

export interface Machine {
  id: string;
  machine_code: string;
  machine_name: string;
  machine_type: string;
  location: string;
  status: MachineStatus;
  installation_date: string;
  last_maintenance_date: string;
  created_at: string;
  updated_at: string;
}

export interface CuttingJob {
  id: string;
  job_order_no: string; // Work order number
  scrap_tracking_id: string; // Unique scrap tracking ID per work order
  job_date: string;
  shift: Shift;
  operator_id: string;
  operator_name?: string;
  supervisor_id: string;
  supervisor_name?: string;
  machine_id: string;
  machine_name?: string;
  material_id: string;
  material_code?: string;
  material_identification?: string;
  planned_output_qty: number;
  actual_output_qty: number;
  total_input_weight_kg: number; // Raw material consumed in kg
  total_output_weight_kg: number; // Finished usable parts in kg
  total_reusable_weight_kg: number; // Reusable pieces in kg
  total_end_piece_weight_kg: number; // End pieces in kg
  total_scrap_weight_kg: number; // Scrap in kg
  scrap_percentage: number;
  expected_scrap_percentage?: number; // For variance analysis
  status: JobStatus;
  sap_updated: boolean; // SAP integration flag
  sap_update_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface CuttingOperation {
  id: string;
  cutting_job_id: string;
  operation_sequence: number;
  input_length: number;
  input_weight: number;
  output_parts_count: number;
  output_parts_length: number;
  output_total_weight: number;
  scrap_weight: number;
  end_piece_weight: number;
  operation_time_minutes: number;
  operator_notes?: string;
  timestamp: string;
  created_at: string;
}

export interface ScrapReasonMaster {
  id: string;
  reason_code: string;
  reason_name: string;
  category: ScrapCategory;
  description: string;
  is_avoidable: boolean;
  severity: Severity;
  is_active: boolean;
  created_at: string;
}

export interface Scrap {
  id: string;
  scrap_tracking_id: string; // Links to job's scrap tracking ID
  cutting_job_id: string;
  cutting_operation_id?: string;
  material_id: string;
  material_code?: string;
  material_identification?: string;
  material_category: MaterialCategory; // SS/Brass/Aluminum/Plastic/PVDF
  scrap_classification: ScrapClassification; // Reusable or Non-Reusable
  scrap_date: string;
  scrap_time: string;
  operator_id: string;
  operator_name?: string;
  machine_id: string;
  machine_name?: string;
  scrap_weight_kg: number;
  scrap_quantity: number;
  dimension_details?: string; // For reusable scrap tracking
  reason_code_id: string;
  reason_code?: string;
  reason_name?: string;
  reason_description?: string;
  scrap_type: ScrapType;
  scrap_value_estimate: number;
  is_recyclable: boolean;
  
  // Supervisor approval
  approval_status: ApprovalStatus;
  approved_by_id?: string;
  approved_by_name?: string;
  approval_date?: string;
  approval_notes?: string;
  
  // Reusable scrap tracking
  reusable_label?: string;
  reusable_storage_location?: string;
  potential_use?: string; // "Production", "Machine Fixture", "Future Use"
  reused_in_job_id?: string;
  reused_date?: string;
  
  // Non-reusable scrap disposal
  disposed_to_vendor: boolean;
  disposal_date?: string;
  sold_to_buyer?: string;
  sale_value?: number;
  sale_date?: string;
  
  photos?: string[];
  created_at: string;
}

export interface EndPiece {
  id: string;
  end_piece_code: string;
  scrap_tracking_id: string;
  material_id: string;
  material_code?: string;
  material_identification?: string;
  material_grade?: string;
  cutting_job_id: string;
  length: number;
  width?: number;
  thickness: number;
  diameter?: number;
  weight_kg: number;
  storage_location: string;
  date_created: string;
  status: EndPieceStatus;
  reusable_label?: string;
  used_in_job_id?: string;
  used_date?: string;
  barcode?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ScrapSale {
  id: string;
  sale_date: string;
  buyer_name: string;
  buyer_contact: string;
  buyer_company: string;
  scrap_ids: string[]; // Array of scrap IDs sold
  material_category: MaterialCategory;
  total_weight_kg: number;
  price_per_kg: number;
  total_sale_value: number;
  payment_status: 'PENDING' | 'RECEIVED' | 'PARTIAL';
  payment_date?: string;
  invoice_number?: string;
  notes?: string;
  created_by_id: string;
  created_by_name: string;
  created_at: string;
}

export interface DashboardStats {
  totalJobs: number;
  avgScrapPercentage: number;
  totalScrapWeight: number;
  totalScrapValue: number;
  materialUtilization: number;
  endPieceReuseRate: number;
  totalEndPieces: number;
  categoriesCount: number;
}

export interface ScrapByReason {
  reason: string;
  weight: number;
  value: number;
  count: number;
  percentage: number;
}

export interface ScrapByOperator {
  operatorName: string;
  jobs: number;
  scrapWeight: number;
  scrapPercentage: number;
  avoidableScrap: number;
}

export interface ScrapTrend {
  date: string;
  scrapWeight: number;
  scrapPercentage: number;
  jobs: number;
}