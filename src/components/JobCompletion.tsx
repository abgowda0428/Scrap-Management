import { useState } from 'react';
import { ArrowLeft, Save, CheckCircle, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';


interface JobCompletionProps {
  jobId?: string;
  onBack?: () => void;
}

export function JobCompletion({ jobId, onBack }: JobCompletionProps) {
  const { currentUser, setCurrentScreen } = useApp();
  
  // Get in-progress jobs for the operator
  const inProgressJobs = mockCuttingJobs.filter(job => {
    if (currentUser?.role === 'OPERATOR') {
      return job.operator_id === currentUser.id && job.status === 'IN_PROGRESS';
    }
    return job.status === 'IN_PROGRESS';
  });

  const [selectedJobId, setSelectedJobId] = useState(jobId || '');
  const [completionData, setCompletionData] = useState({
    actual_output_qty: '',
    total_output_weight_kg: '',
    total_reusable_weight_kg: '',
    total_end_piece_weight_kg: '',
    total_scrap_weight_kg: '',
    completion_notes: '',
  });

  const selectedJob = mockCuttingJobs.find(j => j.id === selectedJobId);
  const selectedMaterial = selectedJob ? mockMaterials.find(m => m.id === selectedJob.material_id) : null;

  // Calculations
  const totalInputWeight = selectedJob?.total_input_weight_kg || 0;
  const actualOutputWeight = parseFloat(completionData.total_output_weight_kg) || 0;
  const reusableWeight = parseFloat(completionData.total_reusable_weight_kg) || 0;
  const endPieceWeight = parseFloat(completionData.total_end_piece_weight_kg) || 0;
  const scrapWeight = parseFloat(completionData.total_scrap_weight_kg) || 0;

  const totalAccountedWeight = actualOutputWeight + reusableWeight + endPieceWeight + scrapWeight;
  const weightVariance = totalInputWeight - totalAccountedWeight;
  const variancePercentage = totalInputWeight > 0 ? (Math.abs(weightVariance) / totalInputWeight) * 100 : 0;

  const scrapPercentage = totalInputWeight > 0 ? (scrapWeight / totalInputWeight) * 100 : 0;
  const materialUtilization = totalInputWeight > 0 ? ((actualOutputWeight + reusableWeight) / totalInputWeight) * 100 : 0;

  const actualOutput = parseInt(completionData.actual_output_qty) || 0;
  const plannedOutput = selectedJob?.planned_output_qty || 0;
  const outputVariance = actualOutput - plannedOutput;

  const estimatedScrapValue = selectedMaterial && scrapWeight
    ? scrapWeight * selectedMaterial.cost_per_kg
    : 0;

  const isWeightBalanced = Math.abs(weightVariance) < 0.1; // Allow 100g tolerance
  const isScrapAcceptable = scrapPercentage <= 5; // Target: <5%

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isWeightBalanced) {
      const confirmProceed = confirm(
        `Weight variance detected: ${weightVariance.toFixed(3)} kg (${variancePercentage.toFixed(1)}%)\n\n` +
        `Total Input: ${totalInputWeight} kg\n` +
        `Total Accounted: ${totalAccountedWeight.toFixed(3)} kg\n\n` +
        `Do you want to proceed anyway?`
      );
      if (!confirmProceed) return;
    }

    const completedJobData = {
      ...selectedJob,
      actual_output_qty: actualOutput,
      total_output_weight_kg: actualOutputWeight,
      total_reusable_weight_kg: reusableWeight,
      total_end_piece_weight_kg: endPieceWeight,
      total_scrap_weight_kg: scrapWeight,
      scrap_percentage: scrapPercentage,
      status: 'COMPLETED' as const,
      completed_at: new Date().toISOString(),
      notes: completionData.completion_notes,
    };

    console.log('Job Completed:', completedJobData);
    alert(
      `Job ${selectedJob?.job_order_no} completed successfully!\n\n` +
      `Output: ${actualOutput} pieces (${actualOutputWeight} kg)\n` +
      `Scrap: ${scrapWeight} kg (${scrapPercentage.toFixed(2)}%)\n` +
      `Material Utilization: ${materialUtilization.toFixed(1)}%\n` +
      `Scrap Value: ₹${estimatedScrapValue.toFixed(2)}`
    );
    
    if (onBack) {
      onBack();
    } else {
      setCurrentScreen('my-jobs');
    }
  };

  return (
    <div>
      <div className="mb-4 lg:mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => onBack ? onBack() : setCurrentScreen('my-jobs')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-gray-900">Complete Cutting Job</h1>
            <p className="text-gray-600 text-sm lg:text-base">Record final measurements and close job</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-4 lg:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Job Selection */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Select Job to Complete *
                </label>
                <select
                  required
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  disabled={!!jobId}
                  className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select job...</option>
                  {inProgressJobs.map(job => (
                    <option key={job.id} value={job.id}>
                      {job.job_order_no} - {job.material_code} ({job.machine_name})
                    </option>
                  ))}
                </select>
                {inProgressJobs.length === 0 && (
                  <p className="text-sm text-amber-600 mt-1">No in-progress jobs found</p>
                )}
              </div>

              {selectedJob && (
                <>
                  {/* Job Info Card */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm text-blue-900 mb-3">Job Information</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-600">Job Order</p>
                        <p className="text-blue-900">{selectedJob.job_order_no}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Material</p>
                        <p className="text-blue-900">{selectedJob.material_code}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Planned Output</p>
                        <p className="text-blue-900">{selectedJob.planned_output_qty} pieces</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Input Weight</p>
                        <p className="text-blue-900">{selectedJob.total_input_weight_kg} kg</p>
                      </div>
                    </div>
                  </div>

                  {/* Actual Output */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Actual Output Quantity (pieces) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={completionData.actual_output_qty}
                      onChange={(e) => setCompletionData({ ...completionData, actual_output_qty: e.target.value })}
                      className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Number of finished pieces"
                    />
                    {actualOutput > 0 && plannedOutput > 0 && (
                      <p className={`text-sm mt-1 ${outputVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {outputVariance > 0 ? '+' : ''}{outputVariance} pieces vs planned
                        ({outputVariance >= 0 ? '↑' : '↓'} {Math.abs((outputVariance / plannedOutput) * 100).toFixed(1)}%)
                      </p>
                    )}
                  </div>

                  {/* Weight Measurements */}
                  <div className="border-2 border-blue-200 rounded-lg p-4">
                    <h3 className="text-gray-900 mb-3">Weight Distribution (kg)</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Total input: <strong>{totalInputWeight} kg</strong> - Account for all weight
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          Output Weight (Finished Parts) *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={completionData.total_output_weight_kg}
                          onChange={(e) => setCompletionData({ ...completionData, total_output_weight_kg: e.target.value })}
                          className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          Reusable Weight *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={completionData.total_reusable_weight_kg}
                          onChange={(e) => setCompletionData({ ...completionData, total_reusable_weight_kg: e.target.value })}
                          className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                        <p className="text-xs text-gray-500 mt-1">Scrap that can be reused in production</p>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          End Piece Weight *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={completionData.total_end_piece_weight_kg}
                          onChange={(e) => setCompletionData({ ...completionData, total_end_piece_weight_kg: e.target.value })}
                          className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                        <p className="text-xs text-gray-500 mt-1">Usable end pieces stored for future use</p>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          Scrap Weight (Waste) *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={completionData.total_scrap_weight_kg}
                          onChange={(e) => setCompletionData({ ...completionData, total_scrap_weight_kg: e.target.value })}
                          className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                        <p className="text-xs text-gray-500 mt-1">Non-reusable waste material</p>
                      </div>
                    </div>

                    {/* Weight Balance Check */}
                    {totalAccountedWeight > 0 && (
                      <div className={`mt-4 p-3 rounded-lg ${
                        isWeightBalanced ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          {isWeightBalanced ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          )}
                          <p className={`text-sm font-medium ${
                            isWeightBalanced ? 'text-green-900' : 'text-red-900'
                          }`}>
                            Weight Balance Check
                          </p>
                        </div>
                        <div className="text-sm space-y-1">
                          <p className="text-gray-700">
                            Total Accounted: <strong>{totalAccountedWeight.toFixed(3)} kg</strong>
                          </p>
                          <p className={isWeightBalanced ? 'text-green-700' : 'text-red-700'}>
                            Variance: <strong>{weightVariance.toFixed(3)} kg</strong>
                            {!isWeightBalanced && ` (${variancePercentage.toFixed(2)}%)`}
                          </p>
                          {!isWeightBalanced && (
                            <p className="text-red-700 text-xs mt-1">
                              ⚠️ Weight doesn't balance! Please verify measurements.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Completion Notes */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Completion Notes
                    </label>
                    <textarea
                      value={completionData.completion_notes}
                      onChange={(e) => setCompletionData({ ...completionData, completion_notes: e.target.value })}
                      className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Any observations, issues, or comments about this job..."
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      type="submit"
                      disabled={!isWeightBalanced && variancePercentage > 1}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 lg:py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Complete Job
                    </button>
                    <button
                      type="button"
                      onClick={() => onBack ? onBack() : setCurrentScreen('my-jobs')}
                      className="px-6 py-3 lg:py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4 lg:p-6 sticky top-4">
            <h3 className="text-gray-900 mb-4">Completion Summary</h3>
            
            {selectedJob && totalAccountedWeight > 0 ? (
              <div className="space-y-4">
                {/* Performance Metrics */}
                <div>
                  <p className="text-xs text-gray-600 mb-2">Scrap Percentage</p>
                  <p className={`text-2xl ${isScrapAcceptable ? 'text-green-600' : 'text-red-600'}`}>
                    {scrapPercentage.toFixed(2)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    Target: {'<'} 5% {isScrapAcceptable ? '✓' : '✗'}
                  </p>
                </div>

                <div className="border-t pt-3">
                  <p className="text-xs text-gray-600 mb-2">Material Utilization</p>
                  <p className="text-2xl text-blue-600">
                    {materialUtilization.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    Output + Reusable / Input
                  </p>
                </div>

                <div className="border-t pt-3">
                  <p className="text-xs text-gray-600 mb-2">Estimated Scrap Cost</p>
                  <p className="text-xl text-red-600">
                    ₹{estimatedScrapValue.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {scrapWeight} kg × ₹{selectedMaterial?.cost_per_kg}/kg
                  </p>
                </div>

                {/* Weight Breakdown */}
                <div className="border-t pt-3">
                  <p className="text-xs text-gray-600 mb-2">Weight Breakdown</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Output:</span>
                      <span className="text-gray-900">{actualOutputWeight.toFixed(2)} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reusable:</span>
                      <span className="text-green-600">{reusableWeight.toFixed(2)} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Piece:</span>
                      <span className="text-blue-600">{endPieceWeight.toFixed(2)} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Scrap:</span>
                      <span className="text-red-600">{scrapWeight.toFixed(2)} kg</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-medium">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-gray-900">{totalAccountedWeight.toFixed(2)} kg</span>
                    </div>
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-800">Weight Balance:</span>
                      <span className={isWeightBalanced ? 'text-green-600' : 'text-red-600'}>
                        {isWeightBalanced ? '✓ OK' : '✗ Variance'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-800">Scrap Target:</span>
                      <span className={isScrapAcceptable ? 'text-green-600' : 'text-red-600'}>
                        {isScrapAcceptable ? '✓ Met' : '✗ Exceeded'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Select a job and enter measurements to see summary</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
