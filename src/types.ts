export type UserRole = 'OPERATOR' | 'SUPERVISOR' | 'MANAGER' | 'ADMIN';
export type JobStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type MachineStatus = 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
export type MaterialStatus = 'ACTIVE' | 'DEPLETED' | 'DISCONTINUED';
export type EndPieceStatus = 'AVAILABLE' | 'RESERVED' | 'USED' | 'SCRAPED';
export type ScrapType = 'KERF_LOSS' | 'END_CUT' | 'WRONG_CUT' | 'DAMAGED' | 'SETUP_WASTE';
export type ScrapCategory = 'OPERATOR_ERROR' | 'MACHINE_ERROR' | 'MATERIAL_DEFECT' | 'SETUP' | 'NORMAL';

export interface User {
  id: string;
  employeeId: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  department: string;
  shift: string;
  isActive: boolean;
}

export interface RawMaterial {
  id: string;
  materialCode: string;
  materialType: string;
  materialGrade: string;
  standardLength?: number;
  standardWidth?: number;
  standardThickness?: number;
  standardDiameter?: number;
  unitOfMeasure: string;
  costPerUnit: number;
  supplierName: string;
  batchNo: string;
  receivedDate: string;
  currentStockQty: number;
  minUsableSize: number;
  status: MaterialStatus;
}

export interface Machine {
  id: string;
  machineCode: string;
  machineName: string;
  machineType: string;
  location: string;
  status: MachineStatus;
  installationDate: string;
  lastMaintenanceDate: string;
}

export interface CuttingJob {
  id: string;
  jobOrderNo: string;
  jobDate: string;
  shift: string;
  operatorId: string;
  supervisorId: string;
  machineId: string;
  materialId: string;
  plannedOutputQty: number;
  actualOutputQty?: number;
  totalInputWeight?: number;
  totalOutputWeight?: number;
  totalScrapWeight?: number;
  totalEndPieceWeight?: number;
  scrapPercentage?: number;
  status: JobStatus;
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface CuttingOperation {
  id: string;
  cuttingJobId: string;
  operationSequence: number;
  inputLength: number;
  inputWeight: number;
  outputPartsCount: number;
  outputPartsLength: number;
  outputTotalWeight: number;
  scrapWeight: number;
  endPieceWeight: number;
  operationTimeMinutes: number;
  operatorNotes?: string;
  timestamp: string;
}

export interface Scrap {
  id: string;
  cuttingJobId: string;
  cuttingOperationId?: string;
  materialId: string;
  scrapDate: string;
  scrapTime: string;
  operatorId: string;
  machineId: string;
  scrapWeight: number;
  scrapQuantity: number;
  unitOfMeasure: string;
  reasonCodeId: string;
  reasonDescription?: string;
  scrapType: ScrapType;
  scrapValueEstimate: number;
  isRecyclable: boolean;
  disposedToVendor: boolean;
}

export interface ScrapReasonMaster {
  id: string;
  reasonCode: string;
  reasonName: string;
  category: ScrapCategory;
  description: string;
  isAvoidable: boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  isActive: boolean;
}

export interface EndPiece {
  id: string;
  endPieceCode: string;
  materialId: string;
  cuttingJobId: string;
  length: number;
  width?: number;
  thickness: number;
  diameter?: number;
  weight: number;
  storageLocation: string;
  dateCreated: string;
  status: EndPieceStatus;
  usedInJobId?: string;
  usedDate?: string;
  barcode?: string;
  notes?: string;
}
