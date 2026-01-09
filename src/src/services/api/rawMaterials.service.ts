import { supabase } from '../../config/supabase';

export async function searchRawMaterials({
  search,
  lastId,
}: {
  search?: string;
  lastId?: string;
}) {
  const { data, error } = await supabase.rpc('search_raw_materials', {
    p_search: search || null,
    p_category: null,
    p_shape: null,
    p_last_id: lastId || null,
    p_limit: 50,
  });

  if (error) {
    console.error('Supabase RPC error:', error);
    throw error;
  }

  // MAP DB → FRONTEND
  return (data ?? []).map((rm: any) => ({
    id: rm.id,
    materialCode: rm.item_code,
    materialIdentification: rm.material_identification,
    materialType: rm.material_type,
    materialGrade: rm.material_grade,
    standardLength: rm.standard_length,
    standardWidth: rm.standard_width,
    standardThickness: rm.standard_thickness,
    standardDiameter: rm.standard_diameter,
    currentStockQty: rm.current_stock_qty,
    dimensionSize: rm.dimension_size,
    unitOfMeasure: rm.unit_of_measure,
    costPerUnit: rm.cost_per_kg, 
    supplierName: rm.supplier_name,
    batchNo: rm.batch_no,
    status: rm.status,
  }));
}

