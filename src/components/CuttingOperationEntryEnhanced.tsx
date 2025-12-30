/**
 * Enhanced Cutting Operation Entry Component
 * 
 * Extended to include:
 * - Cut pieces weight tracking
 * - Finished Good (FG) code linkage
 * - Material serial number tracking
 * - Complete operation tracking with all weight balances
 * 
 * @author SDE-3 Architecture
 */

import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Save, Package, QrCode, Ruler, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';


interface OperationEnhanced {
  id: string;
  sequence: number;
  // Material tracking
  material_serial_no: string;
  // Input
  input_length: number;
  input_weight: number;
  // Output - FG tracking
  finished_good_code: string;
  output_parts_count: number;
  output_parts_length: number;
  output_total_weight: number;
  // Cut pieces tracking
  cut_pieces_weight_kg: number;
  cut_pieces_count: number;
  cut_pieces_details: string;
  // Waste
  scrap_weight: number;
  end_piece_weight: number;
  // Time
  operation_time_minutes: number;
  notes: string;
}

// Mock FG data
const mockFGs = [
  { fg_code: 'FG-001', fg_name: 'Hydraulic Cylinder Body' },
  { fg_code: 'FG-002', fg_name: 'Motor Housing' },
  { fg_code: 'FG-003', fg_name: 'Bearing Housing' },
  { fg_code: 'FG-004', fg_name: 'Valve Body' },
  { fg_code: 'FG-005', fg_name: 'Pump Casing' },
];

export function CuttingOperationEntryEnhanced() {
  const { currentUser, setCurrentScreen } = useApp();
  
  const [selectedJobId, setSelectedJobId] = useState('');
  const [operations, setOperations] = useState<OperationEnhanced[]>([]);
  const [currentOperation, setCurrentOperation] = useState({
    material_serial_no: '',
    input_length: '',
    input_weight: '',
    finished_good_code: '',
    output_parts_count: '',
    output_parts_length: '',
    output_total_weight: '',
    cut_pieces_weight_kg: '',
    cut_pieces_count: '',
    cut_pieces_details: '',
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
  const totalCutPiecesWeight = operations.reduce((sum, op) => sum + op.cut_pieces_weight_kg, 0);
  const totalScrapWeight = operations.reduce((sum, op) => sum + op.scrap_weight, 0);
  const totalEndPieceWeight = operations.reduce((sum, op) => sum + op.end_piece_weight, 0);
  const totalOperationTime = operations.reduce((sum, op) => sum + op.operation_time_minutes, 0);

  // Weight balance validation
  const totalAccountedWeight = totalOutputWeight + totalCutPiecesWeight + totalScrapWeight + totalEndPieceWeight;
  const weightDifference = totalInputWeight - totalAccountedWeight;
  const isBalanced = Math.abs(weightDifference) < 0.1; // Allow 100g tolerance

  const currentScrapPercentage = totalInputWeight > 0 
    ? (totalScrapWeight / totalInputWeight) * 100 
    : 0;

  const addOperation = () => {
    if (!currentOperation.input_weight || !currentOperation.output_parts_count) {
      alert('Please fill in at least Input Weight and Output Parts Count');
      return;
    }

    if (!currentOperation.material_serial_no) {
      alert('Please enter Material Serial Number');
      return;
    }

    if (!currentOperation.finished_good_code) {
      alert('Please select Finished Good Code');
      return;
    }

    // Validate weight balance for this operation
    const opInputWeight = parseFloat(currentOperation.input_weight);
    const opOutputWeight = parseFloat(currentOperation.output_total_weight) || 0;
    const opCutPiecesWeight = parseFloat(currentOperation.cut_pieces_weight_kg) || 0;
    const opScrapWeight = parseFloat(currentOperation.scrap_weight) || 0;
    const opEndPieceWeight = parseFloat(currentOperation.end_piece_weight) || 0;
    
    const opTotalAccounted = opOutputWeight + opCutPiecesWeight + opScrapWeight + opEndPieceWeight;
    const opDifference = opInputWeight - opTotalAccounted;

    if (Math.abs(opDifference) > 0.1) {
      const confirm = window.confirm(
        `Weight mismatch detected!\n\n` +
        `Input: ${opInputWeight.toFixed(2)} kg\n` +
        `Accounted: ${opTotalAccounted.toFixed(2)} kg\n` +
        `Difference: ${opDifference.toFixed(2)} kg\n\n` +
        `Do you want to proceed anyway?`
      );
      if (!confirm) return;
    }

    const newOperation: OperationEnhanced = {
      id: `OP-${Date.now()}`,
      sequence: operations.length + 1,
      material_serial_no: currentOperation.material_serial_no,
      input_length: parseFloat(currentOperation.input_length) || 0,
      input_weight: opInputWeight,
      finished_good_code: currentOperation.finished_good_code,
      output_parts_count: parseInt(currentOperation.output_parts_count),
      output_parts_length: parseFloat(currentOperation.output_parts_length) || 0,
      output_total_weight: opOutputWeight,
      cut_pieces_weight_kg: opCutPiecesWeight,
      cut_pieces_count: parseInt(currentOperation.cut_pieces_count) || 0,
      cut_pieces_details: currentOperation.cut_pieces_details,
      scrap_weight: opScrapWeight,
      end_piece_weight: opEndPieceWeight,
      operation_time_minutes: parseFloat(currentOperation.operation_time_minutes) || 0,
      notes: currentOperation.notes,
    };

    setOperations([...operations, newOperation]);
    
    // Reset form but keep material serial and FG code for next operation
    const keepSerialNo = currentOperation.material_serial_no;
    const keepFGCode = currentOperation.finished_good_code;
    
    setCurrentOperation({
      material_serial_no: keepSerialNo,
      input_length: '',
      input_weight: '',
      finished_good_code: keepFGCode,
      output_parts_count: '',
      output_parts_length: '',
      output_total_weight: '',
      cut_pieces_weight_kg: '',
      cut_pieces_count: '',
      cut_pieces_details: '',
      scrap_weight: '',
      end_piece_weight: '',
      operation_time_minutes: '',
      notes: '',
    });

    alert('✓ Operation added successfully!');
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

    if (!isBalanced) {
      const confirm = window.confirm(
        `⚠️ Weight Balance Warning!\n\n` +
        `Total Input: ${totalInputWeight.toFixed(2)} kg\n` +
        `Total Accounted: ${totalAccountedWeight.toFixed(2)} kg\n` +
        `Difference: ${weightDifference.toFixed(2)} kg\n\n` +
        `Do you want to save anyway?`
      );
      if (!confirm) return;
    }

    const operationData = {
      job_id: selectedJobId,
      job_order_no: selectedJob?.job_order_no,
      operations: operations,
      totals: {
        total_input_weight_kg: totalInputWeight,
        total_output_weight_kg: totalOutputWeight,
        total_cut_pieces_weight_kg: totalCutPiecesWeight,
        total_scrap_weight_kg: totalScrapWeight,
        total_end_piece_weight_kg: totalEndPieceWeight,
        scrap_percentage: currentScrapPercentage,
        total_operation_time: totalOperationTime,
        weight_balanced: isBalanced,
        weight_difference: weightDifference,
      },
      timestamp: new Date().toISOString(),
    };

    console.log('Enhanced Cutting Operations Saved:', operationData);
    alert(
      `✓ Operations saved successfully!\n\n` +
      `Total Operations: ${operations.length}\n` +
      `Total Input: ${totalInputWeight.toFixed(2)} kg\n` +
      `Total Output: ${totalOutputWeight.toFixed(2)} kg\n` +
      `Total Cut Pieces: ${totalCutPiecesWeight.toFixed(2)} kg\n` +
      `Total Scrap: ${totalScrapWeight.toFixed(2)} kg (${currentScrapPercentage.toFixed(2)}%)\n` +
      `Total Time: ${totalOperationTime} minutes\n` +
      `Weight Balance: ${isBalanced ? '✓ Balanced' : '⚠️ Unbalanced'}`
    );
    setCurrentScreen('my-jobs');
  };

  return (
    <div className="pb-20 lg:pb-6">
      <div className="mb-4 lg:mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setCurrentScreen('my-jobs')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-gray-900">Enhanced Cutting Operation Entry</h1>
            <p className="text-gray-600 text-sm lg:text-base">Record operations with FG linkage & cut pieces tracking</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Job Selection */}
          <div className="bg-white rounded-lg shadow p-4 lg:p-6">
            <label className="block text-sm text-gray-700 mb-2">
              Select Active Job <span className="text-red-500">*</span>
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

          {/* Operation Entry Form */}
          {selectedJobId && (
            <div className="bg-white rounded-lg shadow p-4 lg:p-6">
              <h2 className="text-gray-900 mb-4">Add Operation</h2>
              
              <div className="space-y-4">
                {/* Material Serial Number & FG Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4" />
                        Material Serial No <span className="text-red-500">*</span>
                      </div>
                    </label>
                    <input
                      type="text"
                      value={currentOperation.material_serial_no}
                      onChange={(e) => setCurrentOperation({ ...currentOperation, material_serial_no: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="SN-SS304-1234"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Finished Good Code <span className="text-red-500">*</span>
                      </div>
                    </label>
                    <select
                      value={currentOperation.finished_good_code}
                      onChange={(e) => setCurrentOperation({ ...currentOperation, finished_good_code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select FG...</option>
                      {mockFGs.map(fg => (
                        <option key={fg.fg_code} value={fg.fg_code}>
                          {fg.fg_code} - {fg.fg_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Input Section */}
                <div className="border-t pt-4">
                  <h3 className="text-sm text-gray-900 mb-3">Input Material</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Length (mm)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={currentOperation.input_length}
                        onChange={(e) => setCurrentOperation({ ...currentOperation, input_length: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="3000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Weight (kg) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={currentOperation.input_weight}
                        onChange={(e) => setCurrentOperation({ ...currentOperation, input_weight: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="25.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Time (min)</label>
                      <input
                        type="number"
                        step="1"
                        value={currentOperation.operation_time_minutes}
                        onChange={(e) => setCurrentOperation({ ...currentOperation, operation_time_minutes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="30"
                      />
                    </div>
                  </div>
                </div>

                {/* Output Section */}
                <div className="border-t pt-4">
                  <h3 className="text-sm text-gray-900 mb-3">Output - Good Parts</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Parts Count <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={currentOperation.output_parts_count}
                        onChange={(e) => setCurrentOperation({ ...currentOperation, output_parts_count: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Part Length (mm)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={currentOperation.output_parts_length}
                        onChange={(e) => setCurrentOperation({ ...currentOperation, output_parts_length: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="45"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Total Weight (kg)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={currentOperation.output_total_weight}
                        onChange={(e) => setCurrentOperation({ ...currentOperation, output_total_weight: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="20.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Cut Pieces Section - NEW */}
                <div className="border-t pt-4 bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-sm text-gray-900 mb-3 flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-purple-600" />
                    Cut Pieces (For FG: {currentOperation.finished_good_code || 'Not Selected'})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Weight (kg)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={currentOperation.cut_pieces_weight_kg}
                        onChange={(e) => setCurrentOperation({ ...currentOperation, cut_pieces_weight_kg: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="2.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Pieces Count</label>
                      <input
                        type="number"
                        value={currentOperation.cut_pieces_count}
                        onChange={(e) => setCurrentOperation({ ...currentOperation, cut_pieces_count: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Details</label>
                      <input
                        type="text"
                        value={currentOperation.cut_pieces_details}
                        onChange={(e) => setCurrentOperation({ ...currentOperation, cut_pieces_details: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="L:450mm"
                      />
                    </div>
                  </div>
                </div>

                {/* Waste Section */}
                <div className="border-t pt-4">
                  <h3 className="text-sm text-gray-900 mb-3">Waste Material</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Scrap Weight (kg)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={currentOperation.scrap_weight}
                        onChange={(e) => setCurrentOperation({ ...currentOperation, scrap_weight: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">End Piece Weight (kg)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={currentOperation.end_piece_weight}
                        onChange={(e) => setCurrentOperation({ ...currentOperation, end_piece_weight: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="1.0"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Operation Notes</label>
                  <textarea
                    value={currentOperation.notes}
                    onChange={(e) => setCurrentOperation({ ...currentOperation, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Any additional notes..."
                  />
                </div>

                {/* Add Button */}
                <button
                  onClick={addOperation}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Operation to List
                </button>
              </div>
            </div>
          )}

          {/* Operations List */}
          {operations.length > 0 && (
            <div className="bg-white rounded-lg shadow p-4 lg:p-6">
              <h2 className="text-gray-900 mb-4">Operations List ({operations.length})</h2>
              
              <div className="space-y-3">
                {operations.map((op) => (
                  <div key={op.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            Op #{op.sequence}
                          </span>
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                            {op.finished_good_code}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                            {op.material_serial_no}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeOperation(op.id)}
                        className="p-1 hover:bg-red-50 rounded text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Input</p>
                        <p className="text-gray-900">{op.input_weight} kg</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Output</p>
                        <p className="text-gray-900">{op.output_parts_count} pcs</p>
                        <p className="text-xs text-gray-600">{op.output_total_weight} kg</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Cut Pieces</p>
                        <p className="text-purple-700">{op.cut_pieces_weight_kg} kg</p>
                        <p className="text-xs text-purple-600">{op.cut_pieces_count} pcs</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Waste</p>
                        <p className="text-red-600">{(op.scrap_weight + op.end_piece_weight).toFixed(2)} kg</p>
                      </div>
                    </div>

                    {op.cut_pieces_details && (
                      <p className="text-xs text-gray-600 mt-2 p-2 bg-purple-50 rounded">
                        Cut pieces: {op.cut_pieces_details}
                      </p>
                    )}

                    {op.notes && (
                      <p className="text-xs text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                        {op.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Summary Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4 lg:p-6 lg:sticky lg:top-4">
            <h2 className="text-gray-900 mb-4">Summary</h2>
            
            <div className="space-y-4">
              {/* Weight Balance */}
              <div className={`p-3 rounded-lg ${isBalanced ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {isBalanced ? (
                    <AlertCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <p className={`text-sm font-medium ${isBalanced ? 'text-green-900' : 'text-red-900'}`}>
                    Weight Balance
                  </p>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Input:</span>
                    <span className="text-gray-900">{totalInputWeight.toFixed(2)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Accounted:</span>
                    <span className="text-gray-900">{totalAccountedWeight.toFixed(2)} kg</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="text-gray-600">Difference:</span>
                    <span className={`font-medium ${isBalanced ? 'text-green-700' : 'text-red-700'}`}>
                      {weightDifference.toFixed(2)} kg
                    </span>
                  </div>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-700 mb-1">Good Output</p>
                  <p className="text-xl text-blue-900">{totalOutputWeight.toFixed(2)} kg</p>
                </div>

                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-purple-700 mb-1">Cut Pieces</p>
                  <p className="text-xl text-purple-900">{totalCutPiecesWeight.toFixed(2)} kg</p>
                </div>

                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-xs text-red-700 mb-1">Total Scrap</p>
                  <p className="text-xl text-red-900">{totalScrapWeight.toFixed(2)} kg</p>
                  <p className="text-xs text-red-700">{currentScrapPercentage.toFixed(2)}%</p>
                </div>

                <div className="bg-amber-50 p-3 rounded-lg">
                  <p className="text-xs text-amber-700 mb-1">End Pieces</p>
                  <p className="text-xl text-amber-900">{totalEndPieceWeight.toFixed(2)} kg</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-700 mb-1">Total Time</p>
                  <p className="text-xl text-gray-900">{totalOperationTime} min</p>
                </div>
              </div>

              {/* Save Button */}
              {operations.length > 0 && (
                <button
                  onClick={saveOperations}
                  className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save All Operations
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
