// import { User, RawMaterial, Machine, ScrapReasonMaster, CuttingJob, CuttingOperation, Scrap, EndPiece } from './types';

// export const mockUsers: User[] = [
//   {
//     id: 'U001',
//     employeeId: 'EMP001',
//     username: 'jdoe',
//     fullName: 'John Doe',
//     email: 'john.doe@company.com',
//     role: 'OPERATOR',
//     department: 'Cutting',
//     shift: 'DAY',
//     isActive: true
//   },
//   {
//     id: 'U002',
//     employeeId: 'EMP002',
//     username: 'jsmith',
//     fullName: 'Jane Smith',
//     email: 'jane.smith@company.com',
//     role: 'SUPERVISOR',
//     department: 'Cutting',
//     shift: 'DAY',
//     isActive: true
//   },
//   {
//     id: 'U003',
//     employeeId: 'EMP003',
//     username: 'bjohnson',
//     fullName: 'Bob Johnson',
//     email: 'bob.johnson@company.com',
//     role: 'MANAGER',
//     department: 'Production',
//     shift: 'DAY',
//     isActive: true
//   }
// ];

// export const mockRawMaterials: RawMaterial[] = [
//   {
//     id: 'MAT001',
//     materialCode: 'SS304-SHEET-4MM',
//     materialType: 'Sheet',
//     materialGrade: 'SS304',
//     standardLength: 3000,
//     standardWidth: 1500,
//     standardThickness: 4,
//     unitOfMeasure: 'kg',
//     costPerUnit: 8.5,
//     supplierName: 'Steel Corp Ltd',
//     batchNo: 'BATCH-2025-A12',
//     receivedDate: '2025-01-05',
//     currentStockQty: 500,
//     minUsableSize: 300,
//     status: 'ACTIVE'
//   },
//   {
//     id: 'MAT002',
//     materialCode: 'MS-ROD-25MM',
//     materialType: 'Rod',
//     materialGrade: 'Mild Steel',
//     standardLength: 6000,
//     standardDiameter: 25,
//     unitOfMeasure: 'kg',
//     costPerUnit: 4.2,
//     supplierName: 'Metal Suppliers Inc',
//     batchNo: 'BATCH-2025-B05',
//     receivedDate: '2025-01-10',
//     currentStockQty: 800,
//     minUsableSize: 500,
//     status: 'ACTIVE'
//   },
//   {
//     id: 'MAT003',
//     materialCode: 'AL6061-PIPE-50MM',
//     materialType: 'Pipe',
//     materialGrade: 'Aluminum 6061',
//     standardLength: 4000,
//     standardDiameter: 50,
//     standardThickness: 3,
//     unitOfMeasure: 'kg',
//     costPerUnit: 10.0,
//     supplierName: 'Aluminum Works',
//     batchNo: 'BATCH-2025-C18',
//     receivedDate: '2025-01-15',
//     currentStockQty: 350,
//     minUsableSize: 400,
//     status: 'ACTIVE'
//   }
// ];

// export const mockMachines: Machine[] = [
//   {
//     id: 'MACH001',
//     machineCode: 'CUT-MACH-01',
//     machineName: 'Hydraulic Shear #1',
//     machineType: 'Shear',
//     location: 'Shop Floor A',
//     status: 'ACTIVE',
//     installationDate: '2020-05-15',
//     lastMaintenanceDate: '2024-11-15'
//   },
//   {
//     id: 'MACH002',
//     machineCode: 'CUT-MACH-02',
//     machineName: 'Band Saw #2',
//     machineType: 'Saw',
//     location: 'Shop Floor A',
//     status: 'ACTIVE',
//     installationDate: '2019-03-20',
//     lastMaintenanceDate: '2024-10-20'
//   },
//   {
//     id: 'MACH003',
//     machineCode: 'CUT-MACH-03',
//     machineName: 'Laser Cutter #1',
//     machineType: 'Laser',
//     location: 'Shop Floor B',
//     status: 'ACTIVE',
//     installationDate: '2022-08-10',
//     lastMaintenanceDate: '2024-09-05'
//   }
// ];

// export const mockScrapReasons: ScrapReasonMaster[] = [
//   {
//     id: 'SR001',
//     reasonCode: 'SETUP_SCRAP',
//     reasonName: 'Setup Scrap',
//     category: 'SETUP',
//     description: 'Normal setup waste - unavoidable',
//     isAvoidable: false,
//     severity: 'LOW',
//     isActive: true
//   },
//   {
//     id: 'SR002',
//     reasonCode: 'KERF_LOSS',
//     reasonName: 'Kerf Loss',
//     category: 'NORMAL',
//     description: 'Material lost in cutting blade/saw - unavoidable',
//     isAvoidable: false,
//     severity: 'LOW',
//     isActive: true
//   },
//   {
//     id: 'SR003',
//     reasonCode: 'WRONG_CUT',
//     reasonName: 'Wrong Cut Dimensions',
//     category: 'OPERATOR_ERROR',
//     description: 'Operator cut wrong dimensions',
//     isAvoidable: true,
//     severity: 'HIGH',
//     isActive: true
//   },
//   {
//     id: 'SR004',
//     reasonCode: 'MACHINE_ERROR',
//     reasonName: 'Machine Malfunction',
//     category: 'MACHINE_ERROR',
//     description: 'Machine malfunction during cutting',
//     isAvoidable: true,
//     severity: 'MEDIUM',
//     isActive: true
//   },
//   {
//     id: 'SR005',
//     reasonCode: 'MATERIAL_DEFECT',
//     reasonName: 'Material Defect',
//     category: 'MATERIAL_DEFECT',
//     description: 'Raw material had defect',
//     isAvoidable: false,
//     severity: 'MEDIUM',
//     isActive: true
//   },
//   {
//     id: 'SR006',
//     reasonCode: 'MEASUREMENT_ERROR',
//     reasonName: 'Measurement Error',
//     category: 'OPERATOR_ERROR',
//     description: 'Operator measured incorrectly',
//     isAvoidable: true,
//     severity: 'HIGH',
//     isActive: true
//   },
//   {
//     id: 'SR007',
//     reasonCode: 'END_TOO_SMALL',
//     reasonName: 'End Piece Too Small',
//     category: 'NORMAL',
//     description: 'Remaining piece too small to use',
//     isAvoidable: false,
//     severity: 'LOW',
//     isActive: true
//   }
// ];

// export const mockCuttingJobs: CuttingJob[] = [
//   {
//     id: 'JOB-2025-001',
//     jobOrderNo: 'WO-2025-001',
//     jobDate: '2025-12-10',
//     shift: 'DAY',
//     operatorId: 'U001',
//     supervisorId: 'U002',
//     machineId: 'MACH001',
//     materialId: 'MAT001',
//     plannedOutputQty: 50,
//     actualOutputQty: 48,
//     totalInputWeight: 125.5,
//     totalOutputWeight: 118.2,
//     totalScrapWeight: 5.3,
//     totalEndPieceWeight: 2.0,
//     scrapPercentage: 4.22,
//     status: 'COMPLETED',
//     notes: 'Regular production run',
//     createdAt: '2025-12-10T08:00:00Z',
//     completedAt: '2025-12-10T14:30:00Z'
//   },
//   {
//     id: 'JOB-2025-002',
//     jobOrderNo: 'WO-2025-002',
//     jobDate: '2025-12-10',
//     shift: 'DAY',
//     operatorId: 'U001',
//     supervisorId: 'U002',
//     machineId: 'MACH002',
//     materialId: 'MAT002',
//     plannedOutputQty: 30,
//     actualOutputQty: 28,
//     totalInputWeight: 85.0,
//     totalOutputWeight: 78.5,
//     totalScrapWeight: 4.5,
//     totalEndPieceWeight: 2.0,
//     scrapPercentage: 5.29,
//     status: 'COMPLETED',
//     createdAt: '2025-12-10T09:00:00Z',
//     completedAt: '2025-12-10T15:00:00Z'
//   },
//   {
//     id: 'JOB-2025-003',
//     jobOrderNo: 'WO-2025-003',
//     jobDate: '2025-12-10',
//     shift: 'DAY',
//     operatorId: 'U001',
//     supervisorId: 'U002',
//     machineId: 'MACH001',
//     materialId: 'MAT001',
//     plannedOutputQty: 40,
//     actualOutputQty: 15,
//     totalInputWeight: 45.0,
//     totalOutputWeight: 40.5,
//     totalScrapWeight: 3.0,
//     totalEndPieceWeight: 1.5,
//     scrapPercentage: 6.67,
//     status: 'IN_PROGRESS',
//     createdAt: '2025-12-10T10:00:00Z'
//   }
// ];

// export const mockCuttingOperations: CuttingOperation[] = [
//   {
//     id: 'OP-001',
//     cuttingJobId: 'JOB-2025-001',
//     operationSequence: 1,
//     inputLength: 3000,
//     inputWeight: 62.5,
//     outputPartsCount: 24,
//     outputPartsLength: 120,
//     outputTotalWeight: 59.0,
//     scrapWeight: 2.5,
//     endPieceWeight: 1.0,
//     operationTimeMinutes: 45,
//     timestamp: '2025-12-10T08:30:00Z'
//   },
//   {
//     id: 'OP-002',
//     cuttingJobId: 'JOB-2025-001',
//     operationSequence: 2,
//     inputLength: 3000,
//     inputWeight: 63.0,
//     outputPartsCount: 24,
//     outputPartsLength: 120,
//     outputTotalWeight: 59.2,
//     scrapWeight: 2.8,
//     endPieceWeight: 1.0,
//     operationTimeMinutes: 42,
//     timestamp: '2025-12-10T09:30:00Z'
//   }
// ];

// export const mockScrap: Scrap[] = [
//   {
//     id: 'SCRAP-001',
//     cuttingJobId: 'JOB-2025-001',
//     cuttingOperationId: 'OP-001',
//     materialId: 'MAT001',
//     scrapDate: '2025-12-10',
//     scrapTime: '08:45:00',
//     operatorId: 'U001',
//     machineId: 'MACH001',
//     scrapWeight: 2.5,
//     scrapQuantity: 3,
//     unitOfMeasure: 'kg',
//     reasonCodeId: 'SR002',
//     scrapType: 'KERF_LOSS',
//     scrapValueEstimate: 21.25,
//     isRecyclable: true,
//     disposedToVendor: false
//   },
//   {
//     id: 'SCRAP-002',
//     cuttingJobId: 'JOB-2025-002',
//     materialId: 'MAT002',
//     scrapDate: '2025-12-10',
//     scrapTime: '11:20:00',
//     operatorId: 'U001',
//     machineId: 'MACH002',
//     scrapWeight: 3.0,
//     scrapQuantity: 2,
//     unitOfMeasure: 'kg',
//     reasonCodeId: 'SR003',
//     reasonDescription: 'Measured from wrong end',
//     scrapType: 'WRONG_CUT',
//     scrapValueEstimate: 12.6,
//     isRecyclable: true,
//     disposedToVendor: false
//   }
// ];

// export const mockEndPieces: EndPiece[] = [
//   {
//     id: 'EP-001',
//     endPieceCode: 'EP-2025-001',
//     materialId: 'MAT001',
//     cuttingJobId: 'JOB-2025-001',
//     length: 320,
//     width: 1500,
//     thickness: 4,
//     weight: 2.0,
//     storageLocation: 'RACK-A-12',
//     dateCreated: '2025-12-10',
//     status: 'AVAILABLE'
//   },
//   {
//     id: 'EP-002',
//     endPieceCode: 'EP-2025-002',
//     materialId: 'MAT002',
//     cuttingJobId: 'JOB-2025-002',
//     length: 550,
//     diameter: 25,
//     thickness: 25,
//     weight: 1.8,
//     storageLocation: 'RACK-B-05',
//     dateCreated: '2025-12-10',
//     status: 'AVAILABLE'
//   }
// ];
