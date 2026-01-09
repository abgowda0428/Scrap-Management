import { RawMaterial } from '../types';
import { Package, TrendingUp, TrendingDown } from 'lucide-react';

interface RawMaterialListProps {
  materials: RawMaterial[];
}

export function RawMaterialList({ materials }: RawMaterialListProps) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Raw Material Inventory</h1>
        <p className="text-gray-600">Manage raw material stock and specifications</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Material Code
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Type & Grade
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Dimensions
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                {/* <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Cost/Unit
                </th> */}
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {materials.map((material) => {
                    console.log('DIM DEBUG:', {
                        dimensionSize: material.dimensionSize,
                        length: material.standardLength,
                        width: material.standardWidth,
                        dia: material.standardDiameter,
                      });

                // const dimensions = material.materialType === 'Sheet'
                //   ? `${material.standardLength}×${material.standardWidth}×${material.standardThickness}mm`
                //   : material.materialType === 'Rod'
                //   ? `L:${material.standardLength}mm • Ø${material.standardDiameter}mm`
                //   : `L:${material.standardLength}mm • Ø${material.standardDiameter}×${material.standardThickness}mm`;
                    const dimensions = material.dimensionSize
                      ? material.dimensionSize
                      : material.materialType === 'Sheet'
                      ? `${material.standardLength ?? '-'}×${material.standardWidth ?? '-'}×${material.standardThickness ?? '-'} mm`
                      : material.materialType === 'Rod'
                      ? `L:${material.standardLength ?? '-'} mm • Ø${material.standardDiameter ?? '-'} mm`
                      : `L:${material.standardLength ?? '-'} mm • Ø${material.standardDiameter ?? '-'}×${material.standardThickness ?? '-'} mm`;

                const stockStatus = material.currentStockQty < 100 ? 'low' : 
                                   material.currentStockQty < 300 ? 'medium' : 'high';

                return (
                  <tr key={material.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{material.materialCode}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{material.materialGrade}</div>
                      <div className="text-xs text-gray-500">{material.materialType}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{dimensions}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">{material.currentStockQty} {material.unitOfMeasure}</span>
                        {stockStatus === 'low' && <TrendingDown className="w-4 h-4 text-red-500" />}
                        {stockStatus === 'high' && <TrendingUp className="w-4 h-4 text-green-500" />}
                      </div>
                      {stockStatus === 'low' && (
                        <span className="text-xs text-red-600">Low stock</span>
                      )}
                    </td>
                    {/* <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">${material.costPerUnit.toFixed(2)}</span>
                    </td> */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{material.supplierName}</div>
                      <div className="text-xs text-gray-500">Batch: {material.batchNo}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
                        material.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        material.status === 'DEPLETED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {material.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
