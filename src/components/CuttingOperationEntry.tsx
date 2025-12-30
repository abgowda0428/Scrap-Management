import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';


interface Operation {
  id: string;
  sequence: number;
  input_length: number;
  input_weight: number;
  output_parts_count: number;
  output_parts_length: number;
  output_total_weight: number;
  scrap_weight: number;
  end_piece_weight: number;
  operation_time_minutes: number;
  notes: string;
}

export function CuttingOperationEntry() {
  const { currentUser, setCurrentScreen } = useApp();
  
  const [selectedJobId, setSelectedJobId] = useState('');
  const [operations, setOperations] = useState<Operation[]>([]);
  const [currentOperation, setCurrentOperation] = useState({
    input_length: '',
    input_weight: '',
    output_parts_count: '',
    output_parts_length: '',
    output_total_weight: '',
    scrap_weight: '',
    end_piece_weight: '',
    operation_time_minutes: '',
    notes: '',
  });

  // Get in-progress jobs
  const inProgressJobs = mockCuttingJobs.filter(job => {
    if (currentUser?.role === 'OPERATOR') {
      return job.operator_id === currentUser.id && job.status === 'IN_PROGRESS';
    }
    return job.status === 'IN_PROGRESS';
  });

  const selectedJob = mockCuttingJobs.find(j => j.id === selectedJobId);
  const selectedMaterial = selectedJob ? mockMaterials.find(m => m.id === selectedJob.material_id) : null;

  // Calculate totals
  const totalInputWeight = operations.reduce((sum, op) => sum + op.input_weight, 0);
  const totalOutputWeight = operations.reduce((sum, op) => sum + op.output_total_weight, 0);
  const totalScrapWeight = operations.reduce((sum, op) => sum + op.scrap_weight, 0);
  const totalEndPieceWeight = operations.reduce((sum, op) => sum + op.end_piece_weight, 0);
  const totalOperationTime = operations.reduce((sum, op) => sum + op.operation_time_minutes, 0);

  const currentScrapPercentage = totalInputWeight > 0 
    ? (totalScrapWeight / totalInputWeight) * 100 
    : 0;

  const addOperation = () => {
    if (!currentOperation.input_weight || !currentOperation.output_parts_count) {
      alert('Please fill in at least Input Weight and Output Parts Count');
      return;
    }

    const newOperation: Operation = {
      id: `OP-${Date.now()}`,
      sequence: operations.length + 1,
      input_length: parseFloat(currentOperation.input_length) || 0,
      input_weight: parseFloat(currentOperation.input_weight),
      output_parts_count: parseInt(currentOperation.output_parts_count),
      output_parts_length: parseFloat(currentOperation.output_parts_length) || 0,
      output_total_weight: parseFloat(currentOperation.output_total_weight) || 0,
      scrap_weight: parseFloat(currentOperation.scrap_weight) || 0,
      end_piece_weight: parseFloat(currentOperation.end_piece_weight) || 0,
      operation_time_minutes: parseFloat(currentOperation.operation_time_minutes) || 0,
      notes: currentOperation.notes,
    };

    setOperations([...operations, newOperation]);
    
    // Reset form
    setCurrentOperation({
      input_length: '',
      input_weight: '',
      output_parts_count: '',
      output_parts_length: '',
      output_total_weight: '',
      scrap_weight: '',
      end_piece_weight: '',
      operation_time_minutes: '',
      notes: '',
    });
  };

  const removeOperation = (id: string) => {
    setOperations(operations.filter(op => op.id !== id).map((op, idx) => ({
      ...op,
      sequence: idx + 1
    })));
  };

  const saveOperations = () => {
    if (operations.length === 0) {
      alert('Please add at least one operation');
      return;
    }

    const operationData = {
      job_id: selectedJobId,
      job_order_no: selectedJob?.job_order_no,
      operations: operations,
      totals: {
        total_input_weight_kg: totalInputWeight,
        total_output_weight_kg: totalOutputWeight,
        total_scrap_weight_kg: totalScrapWeight,
        total_end_piece_weight_kg: totalEndPieceWeight,
        scrap_percentage: currentScrapPercentage,
        total_operation_time: totalOperationTime,
      },
      timestamp: new Date().toISOString(),
    };

    console.log('Cutting Operations Saved:', operationData);
    alert(
      `Operations saved successfully!\n\n` +
      `Total Operations: ${operations.length}\n` +
      `Total Input: ${totalInputWeight.toFixed(2)} kg\n` +
      `Total Output: ${totalOutputWeight.toFixed(2)} kg\n` +
      `Total Scrap: ${totalScrapWeight.toFixed(2)} kg (${currentScrapPercentage.toFixed(2)}%)\n` +
      `Total Time: ${totalOperationTime} minutes`
    );
    setCurrentScreen('my-jobs');
  };

  return (
    <div>
      <div className="mb-4 lg:mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setCurrentScreen('my-jobs')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-gray-900">Cutting Operation Entry</h1>
            <p className="text-gray-600 text-sm lg:text-base">Record operation-by-operation data during cutting</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Job Selection */}
          <div className="bg-white rounded-lg shadow p-4 lg:p-6">
            <label className="block text-sm text-gray-700 mb-2">
              Select Active Job *
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => {
                setSelectedJobId(e.target.value);
                setOperations([]);
              }}
              className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select job...</option>
              {inProgressJobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.job_order_no} - {job.material_code} ({job.machine_name})
                </option>
              ))}
            </select>

            {selectedJob && (
              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <h3 className="text-sm text-blue-900 mb-2">Job Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-600">Material</p>
                    <p className="text-blue-900">{selectedMaterial?.material_identification}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Planned Output</p>
                    <p className="text-blue-900">{selectedJob.planned_output_qty} pieces</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total Input</p>
                    <p className="text-blue-900">{selectedJob.total_input_weight_kg} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Cost/kg</p>
                    <p className="text-blue-900">₹{selectedMaterial?.cost_per_kg}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {selectedJob && (
            <>
              {/* Add Operation Form */}
              <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                <h3 className="text-gray-900 mb-4">Add New Operation #{operations.length + 1}</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Input Length (mm)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={currentOperation.input_length}
                        onChange={(e) => setCurrentOperation({ ...currentOperation, input_length: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 3000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Input Weight (kg) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0.01"
                        step="0.01"
                        value={currentOperation.input_weight}
                        onChange={(e) => setCurrentOperation({ ...currentOperation, input_weight: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Output Parts Count *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={currentOperation.output_parts_count}
                        onChange={(e) => setCurrentOperation({ ...currentOperation, output_parts_count: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Part Length (mm)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={currentOperation.output_parts_length}
                        onChange={(e) => setCurrentOperation({ ...currentOperation, output_parts_length: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Output Weight (kg)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={currentOperation.output_total_weight}
                        onChange={(e) => setCurrentOperation({ ...currentOperation, output_total_weight: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Scrap Weight (kg)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={currentOperation.scrap_weight}
                        onChange={(e) => setCurrentOperation({ ...currentOperation, scrap_weight: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        End Piece Weight (kg)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={currentOperation.end_piece_weight}
                        onChange={(e) => setCurrentOperation({ ...currentOperation, end_piece_weight: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Time (minutes)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={currentOperation.operation_time_minutes}
                        onChange={(e) => setCurrentOperation({ ...currentOperation, operation_time_minutes: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Operation Notes
                    </label>
                    <input
                      type="text"
                      value={currentOperation.notes}
                      onChange={(e) => setCurrentOperation({ ...currentOperation, notes: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Any notes for this operation..."
                    />
                  </div>

                  <button
                    type="button"
                    onClick={addOperation}
                    className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Operation
                  </button>
                </div>
              </div>

              {/* Operations List */}
              {operations.length > 0 && (
                <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-900">Recorded Operations ({operations.length})</h3>
                    <button
                      onClick={saveOperations}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {operations.map((op, index) => (
                      <div key={op.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-gray-900">Operation #{op.sequence}</h4>
                          <button
                            onClick={() => removeOperation(op.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">Input</p>
                            <p className="text-gray-900">{op.input_weight} kg</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Output</p>
                            <p className="text-gray-900">{op.output_parts_count} pcs</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Scrap</p>
                            <p className="text-red-600">{op.scrap_weight} kg</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Time</p>
                            <p className="text-gray-900">{op.operation_time_minutes} min</p>
                          </div>
                        </div>

                        {op.notes && (
                          <p className="text-xs text-gray-600 mt-2 italic">{op.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4 lg:p-6 sticky top-4">
            <h3 className="text-gray-900 mb-4">Running Totals</h3>
            
            {operations.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Operations Logged</p>
                  <p className="text-2xl text-blue-600">{operations.length}</p>
                </div>

                <div className="border-t pt-3">
                  <p className="text-xs text-gray-600 mb-2">Weight Summary (kg)</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Input:</span>
                      <span className="text-gray-900">{totalInputWeight.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Output:</span>
                      <span className="text-green-600">{totalOutputWeight.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Scrap:</span>
                      <span className="text-red-600">{totalScrapWeight.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Pieces:</span>
                      <span className="text-blue-600">{totalEndPieceWeight.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <p className="text-xs text-gray-600 mb-1">Current Scrap %</p>
                  <p className={`text-2xl ${currentScrapPercentage <= 5 ? 'text-green-600' : 'text-red-600'}`}>
                    {currentScrapPercentage.toFixed(2)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    Target: {'<'} 5% {currentScrapPercentage <= 5 ? '✓' : '✗'}
                  </p>
                </div>

                <div className="border-t pt-3">
                  <p className="text-xs text-gray-600 mb-1">Total Time</p>
                  <p className="text-xl text-gray-900">{totalOperationTime} min</p>
                  <p className="text-xs text-gray-500">
                    {(totalOperationTime / 60).toFixed(1)} hours
                  </p>
                </div>

                {selectedMaterial && totalScrapWeight > 0 && (
                  <div className="border-t pt-3">
                    <p className="text-xs text-gray-600 mb-1">Scrap Value</p>
                    <p className="text-xl text-red-600">
                      ₹{(totalScrapWeight * selectedMaterial.cost_per_kg).toFixed(2)}
                    </p>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                  <p className="text-xs text-blue-800">
                    <strong>Tip:</strong> Record each cutting operation as you complete it for accurate tracking.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Start adding operations to see running totals</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
