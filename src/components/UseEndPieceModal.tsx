import { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';

import { EndPiece } from '../types/index';

interface UseEndPieceModalProps {
  endPiece: EndPiece | null;
  onClose: () => void;
  onUse: (endPieceId: string, jobId: string, notes: string) => void;
}

export function UseEndPieceModal({ endPiece, onClose, onUse }: UseEndPieceModalProps) {
  const [selectedJobId, setSelectedJobId] = useState('');
  const [usageNotes, setUsageNotes] = useState('');

  if (!endPiece) return null;

  // Get active jobs that match the end piece material
  const compatibleJobs = mockCuttingJobs.filter(job => {
    return job.material_id === endPiece.material_id && 
           (job.status === 'IN_PROGRESS' || job.status === 'PLANNED');
  });

  const selectedJob = compatibleJobs.find(j => j.id === selectedJobId);
  const material = mockMaterials.find(m => m.id === endPiece.material_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId) {
      alert('Please select a job');
      return;
    }
    onUse(endPiece.id, selectedJobId, usageNotes);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl text-gray-900">Use End Piece in Job</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* End Piece Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm text-blue-900 mb-3">End Piece Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-600">Code</p>
                <p className="text-blue-900">{endPiece.end_piece_code}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Material</p>
                <p className="text-blue-900">{endPiece.material_code}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Dimensions</p>
                <p className="text-blue-900">
                  {endPiece.length}mm
                  {endPiece.width && ` × ${endPiece.width}mm`}
                  {endPiece.diameter && ` ø${endPiece.diameter}mm`}
                  {` × T${endPiece.thickness}mm`}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Weight</p>
                <p className="text-blue-900">{endPiece.weight_kg.toFixed(2)} kg</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Storage Location</p>
                <p className="text-blue-900">{endPiece.storage_location}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Estimated Value</p>
                <p className="text-blue-900">
                  ₹{material ? (endPiece.weight_kg * material.cost_per_kg).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </div>

          {/* Job Selection */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Select Job to Use This End Piece *
            </label>
            <select
              required
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a compatible job...</option>
              {compatibleJobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.job_order_no} - {job.material_code} ({job.status})
                </option>
              ))}
            </select>

            {compatibleJobs.length === 0 && (
              <p className="text-sm text-amber-600 mt-2">
                No compatible jobs found for material {endPiece.material_code}
              </p>
            )}

            {selectedJob && (
              <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-900 mb-2">Selected Job Details</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-600">Job Order</p>
                    <p className="text-green-900">{selectedJob.job_order_no}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Machine</p>
                    <p className="text-green-900">{selectedJob.machine_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Operator</p>
                    <p className="text-green-900">{selectedJob.operator_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Planned Output</p>
                    <p className="text-green-900">{selectedJob.planned_output_qty} pcs</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Usage Notes */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Usage Notes
            </label>
            <textarea
              value={usageNotes}
              onChange={(e) => setUsageNotes(e.target.value)}
              className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="How will this end piece be used? Any special notes..."
            />
          </div>

          {/* Impact Summary */}
          {selectedJob && material && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-sm text-purple-900 mb-2">💰 Cost Savings Impact</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-700">Material Saved:</span>
                  <span className="text-purple-900 font-medium">{endPiece.weight_kg.toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Value Saved:</span>
                  <span className="text-purple-900 font-medium">
                    ₹{(endPiece.weight_kg * material.cost_per_kg).toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-purple-700 mt-2">
                  This end piece will be deducted from inventory and marked as USED
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={!selectedJobId}
              className="flex-1 bg-blue-600 text-white px-6 py-3 lg:py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Use in Selected Job
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 lg:py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
