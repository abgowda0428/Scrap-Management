import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Screen } from '../MainApp';
import { ArrowLeft, Plus, Check } from 'lucide-react';
import { ScrapEntryModal } from '../modals/ScrapEntryModal';
import { EndPieceEntryModal } from '../modals/EndPieceEntryModal';

interface CuttingOperationEntryProps {
  jobId: string;
  onNavigate: (screen: Screen) => void;
}

export function CuttingOperationEntry({ jobId, onNavigate }: CuttingOperationEntryProps) {
  const { cuttingJobs, users, machines, materials, addCuttingOperation, cuttingOperations, updateCuttingJob } = useApp();
  
  const job = cuttingJobs.find(j => j.id === jobId);
  const operator = users.find(u => u.id === job?.operatorId);
  const machine = machines.find(m => m.id === job?.machineId);
  const material = materials.find(m => m.id === job?.materialId);
  const jobOperations = cuttingOperations.filter(op => op.cuttingJobId === jobId);

  const [showScrapModal, setShowScrapModal] = useState(false);
  const [showEndPieceModal, setShowEndPieceModal] = useState(false);
  const [currentOperationId, setCurrentOperationId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    inputLength: '',
    inputWeight: '',
    outputPartsCount: '',
    outputPartsLength: '',
    outputTotalWeight: '',
    operationTimeMinutes: ''
  });

  if (!job) {
    return <div>Job not found</div>;
  }

  const handleLogOperation = () => {
    const operation = {
      id: `op-${Date.now()}`,
      cuttingJobId: jobId,
      operationSequence: jobOperations.length + 1,
      inputLength: parseFloat(formData.inputLength),
      inputWeight: parseFloat(formData.inputWeight),
      outputPartsCount: parseInt(formData.outputPartsCount),
      outputPartsLength: parseFloat(formData.outputPartsLength),
      outputTotalWeight: parseFloat(formData.outputTotalWeight),
      scrapWeight: 0,
      endPieceWeight: 0,
      operationTimeMinutes: formData.operationTimeMinutes ? parseInt(formData.operationTimeMinutes) : undefined,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    addCuttingOperation(operation);
    setCurrentOperationId(operation.id);

    // Calculate if there's potential scrap/end piece
    const expectedUsed = operation.outputPartsCount * operation.outputPartsLength;
    const difference = operation.inputLength - expectedUsed;

    if (difference > 0) {
      setShowScrapModal(true);
    }

    // Reset form
    setFormData({
      inputLength: '',
      inputWeight: '',
      outputPartsCount: '',
      outputPartsLength: '',
      outputTotalWeight: '',
      operationTimeMinutes: ''
    });
  };

  const handleCompleteJob = () => {
    if (job) {
      const updatedJob = {
        ...job,
        status: 'COMPLETED' as const,
        completedAt: new Date().toISOString()
      };
      updateCuttingJob(updatedJob);
      onNavigate('jobs');
    }
  };

  // Calculations
  const expectedMaterialUsed = formData.outputPartsCount && formData.outputPartsLength
    ? parseInt(formData.outputPartsCount) * parseFloat(formData.outputPartsLength)
    : 0;

  const difference = formData.inputLength 
    ? parseFloat(formData.inputLength) - expectedMaterialUsed
    : 0;

  const materialEfficiency = formData.inputWeight && formData.outputTotalWeight
    ? (parseFloat(formData.outputTotalWeight) / parseFloat(formData.inputWeight)) * 100
    : 0;

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => onNavigate('jobs')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </button>
        <h2>Cutting Operation Entry</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h3 className="mb-4">Job Summary</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Job Order No.</p>
                <p className="text-gray-900">{job.jobOrderNo}</p>
              </div>
              <div>
                <p className="text-gray-600">Material</p>
                <p className="text-gray-900">{material?.materialCode}</p>
                <p className="text-xs text-gray-500">{material?.materialGrade}</p>
              </div>
              <div>
                <p className="text-gray-600">Machine</p>
                <p className="text-gray-900">{machine?.machineCode}</p>
              </div>
              <div>
                <p className="text-gray-600">Operator</p>
                <p className="text-gray-900">{operator?.fullName}</p>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-gray-600">Progress</p>
                <p className="text-gray-900">
                  {job.actualOutputQty} / {job.plannedOutputQty} pieces
                </p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(job.actualOutputQty / job.plannedOutputQty) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <p className="text-gray-600">Current Scrap %</p>
                <p className={`${job.scrapPercentage > 5 ? 'text-red-600' : 'text-green-600'}`}>
                  {job.scrapPercentage.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-gray-600">Operations Logged</p>
                <p className="text-gray-900">{jobOperations.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Operation Entry Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="mb-4">Log New Operation</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Input Length (mm) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.inputLength}
                    onChange={(e) => setFormData({ ...formData, inputLength: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 3000"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Input Weight (kg) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.inputWeight}
                    onChange={(e) => setFormData({ ...formData, inputWeight: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 125"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Output Parts Count *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.outputPartsCount}
                    onChange={(e) => setFormData({ ...formData, outputPartsCount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 24"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Output Part Length (mm) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.outputPartsLength}
                    onChange={(e) => setFormData({ ...formData, outputPartsLength: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 120"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Output Total Weight (kg) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.outputTotalWeight}
                    onChange={(e) => setFormData({ ...formData, outputTotalWeight: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 117.5"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Operation Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.operationTimeMinutes}
                    onChange={(e) => setFormData({ ...formData, operationTimeMinutes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 45"
                  />
                </div>
              </div>

              {/* Calculated Fields */}
              {expectedMaterialUsed > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900 mb-2">Calculated Values:</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-blue-700">Expected Used</p>
                      <p className="text-blue-900">{expectedMaterialUsed.toFixed(1)} mm</p>
                    </div>
                    <div>
                      <p className="text-blue-700">Difference</p>
                      <p className="text-blue-900">{difference.toFixed(1)} mm</p>
                    </div>
                    <div>
                      <p className="text-blue-700">Material Efficiency</p>
                      <p className={materialEfficiency > 95 ? 'text-green-600' : 'text-orange-600'}>
                        {materialEfficiency.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleLogOperation}
                disabled={!formData.inputLength || !formData.inputWeight || !formData.outputPartsCount || !formData.outputPartsLength || !formData.outputTotalWeight}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Log Operation
              </button>
            </div>
          </div>

          {/* Operations History */}
          {jobOperations.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="mb-4">Operations History ({jobOperations.length})</h3>
              <div className="space-y-3">
                {jobOperations.map(op => (
                  <div key={op.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-gray-900">Operation #{op.operationSequence}</h4>
                      <span className="text-xs text-gray-500">
                        {new Date(op.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Input</p>
                        <p className="text-gray-900">{op.inputWeight} kg</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Output</p>
                        <p className="text-gray-900">{op.outputPartsCount} parts</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Scrap</p>
                        <p className="text-gray-900">{op.scrapWeight} kg</p>
                      </div>
                      <div>
                        <p className="text-gray-600">End Piece</p>
                        <p className="text-gray-900">{op.endPieceWeight} kg</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complete Job */}
          <button
            onClick={handleCompleteJob}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Complete Job
          </button>
        </div>
      </div>

      {/* Modals */}
      {showScrapModal && (
        <ScrapEntryModal
          jobId={jobId}
          operationId={currentOperationId}
          onClose={() => setShowScrapModal(false)}
          onSaved={() => {
            setShowScrapModal(false);
            setShowEndPieceModal(true);
          }}
        />
      )}

      {showEndPieceModal && (
        <EndPieceEntryModal
          jobId={jobId}
          materialId={job.materialId}
          onClose={() => setShowEndPieceModal(false)}
        />
      )}
    </div>
  );
}
