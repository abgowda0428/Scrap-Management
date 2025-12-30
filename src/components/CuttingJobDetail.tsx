import { useState } from 'react';
import { ArrowLeft, Plus, Save, AlertCircle } from 'lucide-react';
import { CuttingJob } from '../types';


interface Props {
  job: CuttingJob;
  onBack: () => void;
}

export function CuttingJobDetail({ job, onBack }: Props) {
  const [operationData, setOperationData] = useState({
    input_length: '',
    input_weight: '',
    output_parts_count: '',
    output_parts_length: '',
    output_total_weight: '',
  });

  const [showScrapModal, setShowScrapModal] = useState(false);
  const [showEndPieceModal, setShowEndPieceModal] = useState(false);

  const [scrapData, setScrapData] = useState({
    scrap_weight: '',
    scrap_quantity: '',
    reason_code_id: '',
    reason_description: '',
    is_recyclable: true,
  });

  const [endPieceData, setEndPieceData] = useState({
    length: '',
    width: '',
    weight: '',
    storage_location: '',
    notes: '',
  });

  const calculateDifference = () => {
    const input = parseFloat(operationData.input_length) || 0;
    const outputParts = parseInt(operationData.output_parts_count) || 0;
    const outputLength = parseFloat(operationData.output_parts_length) || 0;
    const expected = outputParts * outputLength;
    return input - expected;
  };

  const calculateEfficiency = () => {
    const inputWeight = parseFloat(operationData.input_weight) || 0;
    const outputWeight = parseFloat(operationData.output_total_weight) || 0;
    if (inputWeight === 0) return 0;
    return (outputWeight / inputWeight) * 100;
  };

  const difference = calculateDifference();
  const efficiency = calculateEfficiency();

  const handleLogOperation = () => {
    if (difference > 50) {
      setShowScrapModal(true);
    } else if (difference > 0) {
      setShowEndPieceModal(true);
    } else {
      alert('Operation logged successfully!');
      // Reset form
      setOperationData({
        input_length: '',
        input_weight: '',
        output_parts_count: '',
        output_parts_length: '',
        output_total_weight: '',
      });
    }
  };

  const handleSaveScrap = () => {
    alert(`Scrap logged: ${scrapData.scrap_weight} kg`);
    setShowScrapModal(false);
    setScrapData({
      scrap_weight: '',
      scrap_quantity: '',
      reason_code_id: '',
      reason_description: '',
      is_recyclable: true,
    });
  };

  const handleSaveEndPiece = () => {
    alert(`End piece saved: ${endPieceData.weight} kg, stored at ${endPieceData.storage_location}`);
    setShowEndPieceModal(false);
    setEndPieceData({
      length: '',
      width: '',
      weight: '',
      storage_location: '',
      notes: '',
    });
  };

  return (
    <div>
      <div className="mb-4 lg:mb-6 flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-gray-900 text-xl lg:text-2xl">{job.job_order_no}</h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">Cutting Operation Entry</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Job Summary */}
        <div className="lg:col-span-1 order-1 lg:order-none">
          <div className="bg-white rounded-lg shadow p-4 lg:p-6 lg:sticky lg:top-6">
            <h2 className="mb-4">Job Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Job Order No.</p>
                <p className="text-gray-900">{job.job_order_no}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Scrap Tracking ID</p>
                <p className="text-gray-900 text-xs">{job.scrap_tracking_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Material</p>
                <p className="text-gray-900">{job.material_code}</p>
                {job.material_identification && (
                  <p className="text-xs text-gray-500">{job.material_identification}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">Machine</p>
                <p className="text-gray-900">{job.machine_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Operator</p>
                <p className="text-gray-900">{job.operator_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Planned Output</p>
                <p className="text-gray-900">{job.planned_output_qty} pieces</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm ${
                  job.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {job.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {job.status === 'COMPLETED' && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm text-gray-600 mb-3">Performance</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Scrap %</span>
                    <span className={`text-sm ${job.scrap_percentage > 5 ? 'text-red-600' : 'text-green-600'}`}>
                      {job.scrap_percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Efficiency</span>
                    <span className="text-sm text-green-600">
                      {((job.total_output_weight_kg / job.total_input_weight_kg) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Operation Entry Form */}
        <div className="lg:col-span-2 order-2 lg:order-none space-y-4 lg:space-y-6">
          <div className="bg-white rounded-lg shadow p-4 lg:p-6">
            <h2 className="mb-4 text-lg lg:text-xl">Log Cutting Operation</h2>

            {job.status !== 'IN_PROGRESS' ? (
              <div className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Job is {job.status.toLowerCase()}. Cannot add operations.</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Input Length (mm) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={operationData.input_length}
                        onChange={(e) => setOperationData({ ...operationData, input_length: e.target.value })}
                        className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                        placeholder="3000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Input Weight (kg) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={operationData.input_weight}
                        onChange={(e) => setOperationData({ ...operationData, input_weight: e.target.value })}
                        className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                        placeholder="25.5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Output Parts Count *
                      </label>
                      <input
                        type="number"
                        value={operationData.output_parts_count}
                        onChange={(e) => setOperationData({ ...operationData, output_parts_count: e.target.value })}
                        className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                        placeholder="10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Output Part Length (mm) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={operationData.output_parts_length}
                        onChange={(e) => setOperationData({ ...operationData, output_parts_length: e.target.value })}
                        className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                        placeholder="250"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Output Total Weight (kg) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={operationData.output_total_weight}
                        onChange={(e) => setOperationData({ ...operationData, output_total_weight: e.target.value })}
                        className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                        placeholder="22.0"
                      />
                    </div>
                  </div>

                  {/* Calculations */}
                  {operationData.input_length && operationData.output_parts_count && operationData.output_parts_length && (
                    <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-700">Expected Material Used:</span>
                        <span className="text-sm text-gray-900">
                          {(parseInt(operationData.output_parts_count) * parseFloat(operationData.output_parts_length)).toFixed(1)} mm
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-700">Difference (Scrap/End Piece):</span>
                        <span className={`text-sm ${difference > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                          {difference.toFixed(1)} mm
                        </span>
                      </div>
                      {operationData.input_weight && operationData.output_total_weight && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-700">Material Efficiency:</span>
                          <span className="text-sm text-green-600">
                            {efficiency.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={handleLogOperation}
                    disabled={!operationData.input_length || !operationData.input_weight}
                    className="w-full bg-blue-600 text-white px-6 py-4 lg:py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base lg:text-sm"
                  >
                    <Plus className="w-5 h-5" />
                    Log Operation
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Scrap Modal */}
      {showScrapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="mb-4">Log Scrap Entry</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Scrap Weight (kg) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={scrapData.scrap_weight}
                  onChange={(e) => setScrapData({ ...scrapData, scrap_weight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Scrap Quantity (pieces) *</label>
                <input
                  type="number"
                  value={scrapData.scrap_quantity}
                  onChange={(e) => setScrapData({ ...scrapData, scrap_quantity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Scrap Reason *</label>
                <select
                  value={scrapData.reason_code_id}
                  onChange={(e) => setScrapData({ ...scrapData, reason_code_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Reason</option>
                  {mockScrapReasons.map(reason => (
                    <option key={reason.id} value={reason.id}>
                      {reason.reason_name} {reason.is_avoidable && '(Avoidable)'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Description</label>
                <textarea
                  value={scrapData.reason_description}
                  onChange={(e) => setScrapData({ ...scrapData, reason_description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={scrapData.is_recyclable}
                  onChange={(e) => setScrapData({ ...scrapData, is_recyclable: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm text-gray-700">Is Recyclable</label>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveScrap}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Scrap Entry
                </button>
                <button
                  onClick={() => setShowScrapModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* End Piece Modal */}
      {showEndPieceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="mb-4">Save End Piece</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Length (mm) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={endPieceData.length}
                  onChange={(e) => setEndPieceData({ ...endPieceData, length: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={difference.toFixed(0)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Weight (kg) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={endPieceData.weight}
                  onChange={(e) => setEndPieceData({ ...endPieceData, weight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Storage Location *</label>
                <select
                  value={endPieceData.storage_location}
                  onChange={(e) => setEndPieceData({ ...endPieceData, storage_location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Location</option>
                  <option value="RACK-A-12">RACK-A-12</option>
                  <option value="RACK-B-05">RACK-B-05</option>
                  <option value="RACK-C-08">RACK-C-08</option>
                  <option value="FLOOR-1">FLOOR-1</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Notes</label>
                <textarea
                  value={endPieceData.notes}
                  onChange={(e) => setEndPieceData({ ...endPieceData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEndPiece}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save to Inventory
                </button>
                <button
                  onClick={() => setShowEndPieceModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}