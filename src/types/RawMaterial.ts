export interface RawMaterial {
  id: string;
  materialCode: string;
  materialType: string;
  materialGrade: string;
  standardLength?: number | null;
  standardWidth?: number | null;
  standardThickness?: number | null;
  standardDiameter?: number | null;
  dimensionSize: string;
  currentStockQty: number;
  unitOfMeasure: string;
  costPerUnit: number;
  supplierName: string;
  batchNo?: string;
  status: string;
}
