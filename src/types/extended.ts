// Extended types for Cut Pieces Tracking and Enhanced Approval Management

import { MaterialCategory, ApprovalStatus, ScrapClassification, ScrapType } from './index';

/**
 * Cut Pieces Tracking Entry
 * Tracks cut pieces generated during operations with FG linkage and material serial tracking
 */
export interface CutPieceEntry {
  id: string;
  cutting_job_id: string;
  cutting_operation_id?: string;
  material_id: string;
  material_code: string;
  material_serial_no: string; // Serial number of material being used
  finished_good_code: string; // FG code being manufactured
  finished_good_name?: string;
  cut_pieces_weight_kg: number;
  cut_pieces_count: number;
  cut_pieces_details?: string; // Dimensions, notes
  operation_date: string;
  operation_time: string;
  operator_id: string;
  operator_name?: string;
  machine_id: string;
  machine_name?: string;
  storage_location?: string;
  is_reusable: boolean;
  used_in_job_id?: string;
  used_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Enhanced Cutting Operation with Cut Pieces Tracking
 */
export interface CuttingOperationEnhanced {
  id: string;
  cutting_job_id: string;
  operation_sequence: number;
  
  // Material input
  material_serial_no: string; // Material serial number
  input_length: number;
  input_weight: number;
  
  // Output - Finished Goods
  finished_good_code: string; // FG being produced
  finished_good_name?: string;
  output_parts_count: number;
  output_parts_length: number;
  output_total_weight: number;
  
  // Cut pieces tracking
  cut_pieces_weight_kg: number;
  cut_pieces_count: number;
  cut_pieces_details?: string;
  
  // Waste tracking
  scrap_weight: number;
  end_piece_weight: number;
  
  // Operation details
  operation_time_minutes: number;
  operator_notes?: string;
  timestamp: string;
  created_at: string;
}

/**
 * Approval Dashboard Filter Options
 */
export interface ApprovalFilters {
  status: ApprovalStatus | 'ALL';
  materialCategory: MaterialCategory | 'ALL';
  scrapClassification: ScrapClassification | 'ALL';
  dateFrom: string;
  dateTo: string;
  operatorId: string;
  searchTerm: string;
  minWeight?: number;
  maxWeight?: number;
}

/**
 * Approval Summary Stats
 */
export interface ApprovalStats {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  totalPendingValue: number; // ₹
  totalApprovedValue: number; // ₹
  avgProcessingTime: number; // in minutes
  reusableCount: number;
  nonReusableCount: number;
  byMaterialCategory: {
    category: MaterialCategory;
    count: number;
    weight: number;
    value: number;
  }[];
}

/**
 * Bulk Approval Action
 */
export interface BulkApprovalAction {
  scrapIds: string[];
  action: 'APPROVE' | 'REJECT';
  approver_id: string;
  approver_name: string;
  approval_notes?: string;
  approval_date: string;
}

/**
 * Material Serial Number Entry
 */
export interface MaterialSerialEntry {
  serial_no: string;
  material_id: string;
  material_code: string;
  material_identification: string;
  batch_no: string;
  received_date: string;
  initial_weight_kg: number;
  current_weight_kg: number;
  status: 'ACTIVE' | 'DEPLETED' | 'IN_USE';
  location: string;
  qr_code?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Finished Good Master
 */
export interface FinishedGood {
  id: string;
  fg_code: string; // FG001, FG002, etc.
  fg_name: string;
  fg_description?: string;
  customer_name?: string;
  part_number?: string;
  drawing_number?: string;
  material_required: string; // Material code needed
  standard_weight_kg?: number;
  standard_dimensions?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Cut Pieces Usage Log
 */
export interface CutPieceUsageLog {
  id: string;
  cut_piece_id: string;
  used_in_job_id: string;
  used_in_fg_code: string;
  used_weight_kg: number;
  used_date: string;
  used_by_operator_id: string;
  used_by_operator_name?: string;
  notes?: string;
  created_at: string;
}

/**
 * Extended Scrap Entry with FG and Material Serial
 */
export interface ScrapEntryEnhanced {
  id: string;
  scrap_tracking_id: string;
  cutting_job_id: string;
  cutting_operation_id?: string;
  
  // Material tracking
  material_id: string;
  material_code: string;
  material_identification: string;
  material_category: MaterialCategory;
  material_serial_no?: string; // Added for serial tracking
  
  // FG linkage
  finished_good_code?: string; // Which FG this was cut for
  finished_good_name?: string;
  
  // Scrap details
  scrap_classification: ScrapClassification;
  scrap_date: string;
  scrap_time: string;
  operator_id: string;
  operator_name?: string;
  machine_id: string;
  machine_name?: string;
  scrap_weight_kg: number;
  scrap_quantity: number;
  dimension_details?: string;
  reason_code_id: string;
  reason_code?: string;
  reason_name?: string;
  reason_description?: string;
  scrap_type: ScrapType;
  scrap_value_estimate: number;
  is_recyclable: boolean;
  
  // Approval workflow
  approval_status: ApprovalStatus;
  approved_by_id?: string;
  approved_by_name?: string;
  approval_date?: string;
  approval_notes?: string;
  
  // Reusable scrap tracking
  reusable_label?: string;
  reusable_storage_location?: string;
  potential_use?: string;
  reused_in_job_id?: string;
  reused_date?: string;
  
  // Disposal
  disposed_to_vendor: boolean;
  disposal_date?: string;
  sold_to_buyer?: string;
  sale_value?: number;
  sale_date?: string;
  
  photos?: string[];
  created_at: string;
}
