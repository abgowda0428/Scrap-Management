import { useState } from 'react';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

import { ScrapClassification, MaterialCategory, ScrapType } from '../types/index';

export function ScrapEntry() {
  const { currentUser, setCurrentScreen } = useApp();
  
  const [formData, setFormData] = useState({
    cutting_job_id: '',
    scrap_weight_kg: '',
    scrap_quantity: '',
    dimension_details: '',
    reason_code_id: '',
    scrap_type: 'KERF_LOSS' as ScrapType,
    material_category: 'STAINLESS_STEEL' as MaterialCategory,
    scrap_classification: 'NON_REUSABLE' as ScrapClassification,
    
    // Reusable scrap fields
    reusable_storage_location: '',
    potential_use: '',
    
    // Recyclable flag
    is_recyclable: false,
    
    notes: ''
  });

  // Get active jobs for current user
  const activeJobs = mockCuttingJobs.filter(job => {
    if (currentUser?.role === 'OPERATOR') {
      return job.operator_id === currentUser.id && job.status === 'IN_PROGRESS';
    }
    return job.status === 'IN_PROGRESS';
  });

  const selectedJob = mockCuttingJobs.find(j => j.id === formData.cutting_job_id);
  const selectedMaterial = selectedJob ? mockMaterials.find(m => m.id === selectedJob.material_id) : null;
  const selectedReason = mockScrapReasons.find(r => r.id === formData.reason_code_id);

  const estimatedValue = selectedMaterial && formData.scrap_weight_kg 
    ? parseFloat(formData.scrap_weight_kg) * selectedMaterial.cost_per_kg
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate scrap entry ID
    const scrapId = `SCR-${Date.now()}`;
    const scrapData = {
      id: scrapId,
      scrap_tracking_id: selectedJob?.scrap_tracking_id || '',
      ...formData,
      scrap_weight_kg: parseFloat(formData.scrap_weight_kg),
      scrap_quantity: parseInt(formData.scrap_quantity),
      material_id: selectedJob?.material_id || '',
      material_code: selectedMaterial?.item_code,
      material_identification: selectedMaterial?.material_identification,
      operator_id: currentUser?.id || '',
      operator_name: currentUser?.full_name,
      machine_id: selectedJob?.machine_id || '',
      machine_name: selectedJob?.machine_name,
      scrap_date: new Date().toISOString().split('T')[0],
      scrap_time: new Date().toTimeString().split(' ')[0],
      scrap_value_estimate: estimatedValue,
      approval_status: 'PENDING' as const,
      disposed_to_vendor: false,
      reason_code: selectedReason?.reason_code,
      reason_name: selectedReason?.reason_name,
      created_at: new Date().toISOString(),
    };
    
    console.log('Scrap Entry Created:', scrapData);
    alert(`Scrap entry recorded!\nScrap ID: ${scrapId}\nStatus: Pending Supervisor Approval\nEstimated Value: ₹${estimatedValue.toFixed(2)}`);
    setCurrentScreen('dashboard');
  };

  return (
    <div>
      <div className="mb-4 lg:mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-gray-900">Log Scrap Entry</h1>
            <p className="text-gray-600 text-sm lg:text-base">Record scrap with two-dimensional classification</p>
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
                  Cutting Job *
                </label>
                <select
                  required
                  value={formData.cutting_job_id}
                  onChange={(e) => {
                    const job = mockCuttingJobs.find(j => j.id === e.target.value);
                    const material = job ? mockMaterials.find(m => m.id === job.material_id) : null;
                    setFormData({ 
                      ...formData, 
                      cutting_job_id: e.target.value,
                      material_category: (material?.material_category || 'STAINLESS_STEEL') as MaterialCategory
                    });
                  }}
                  className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select active job...</option>
                  {activeJobs.map(job => (
                    <option key={job.id} value={job.id}>
                      {job.job_order_no} - {job.material_code} ({job.machine_name})
                    </option>
                  ))}
                </select>
                {activeJobs.length === 0 && (
                  <p className="text-sm text-amber-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    No active jobs found. Start a job first.
                  </p>
                )}
              </div>

              {selectedJob && (
                <>
                  {/* Material Info Display */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm text-blue-900 mb-2">Material Information</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600 text-xs">Material Code</p>
                        <p className="text-blue-900">{selectedMaterial?.item_code}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Material</p>
                        <p className="text-blue-900">{selectedMaterial?.material_identification}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Category</p>
                        <p className="text-blue-900">{selectedMaterial?.material_category.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Cost/kg</p>
                        <p className="text-blue-900">₹{selectedMaterial?.cost_per_kg}</p>
                      </div>
                    </div>
                  </div>

                  {/* Two-Dimensional Classification */}
                  <div className="border-2 border-blue-200 rounded-lg p-4">
                    <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">REQUIRED</span>
                      Scrap Classification (Two Dimensions)
                    </h3>

                    {/* Dimension 1: Material Category (Auto-set from job) */}
                    <div className="mb-4">
                      <label className="block text-sm text-gray-700 mb-2">
                        Dimension 1: Material Category *
                      </label>
                      <input
                        type="text"
                        value={selectedMaterial?.material_category.replace('_', ' ')}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                      <p className="text-xs text-gray-500 mt-1">Auto-set from selected job material</p>
                    </div>

                    {/* Dimension 2: Usability Classification */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Dimension 2: Usability Classification *
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.scrap_classification === 'REUSABLE' 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-300 hover:border-green-300'
                        }`}>
                          <input
                            type="radio"
                            name="scrap_classification"
                            value="REUSABLE"
                            checked={formData.scrap_classification === 'REUSABLE'}
                            onChange={(e) => setFormData({ ...formData, scrap_classification: e.target.value as ScrapClassification })}
                            className="w-4 h-4 text-green-600"
                          />
                          <div className="ml-3">
                            <p className="text-gray-900">Reusable Scrap</p>
                            <p className="text-xs text-gray-600">Can be used in future production</p>
                          </div>
                        </label>

                        <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.scrap_classification === 'NON_REUSABLE' 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-gray-300 hover:border-red-300'
                        }`}>
                          <input
                            type="radio"
                            name="scrap_classification"
                            value="NON_REUSABLE"
                            checked={formData.scrap_classification === 'NON_REUSABLE'}
                            onChange={(e) => setFormData({ ...formData, scrap_classification: e.target.value as ScrapClassification })}
                            className="w-4 h-4 text-red-600"
                          />
                          <div className="ml-3">
                            <p className="text-gray-900">Non-Reusable Scrap</p>
                            <p className="text-xs text-gray-600">Waste material for disposal</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Scrap Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Scrap Weight (kg) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0.01"
                        step="0.01"
                        value={formData.scrap_weight_kg}
                        onChange={(e) => setFormData({ ...formData, scrap_weight_kg: e.target.value })}
                        className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Scrap Quantity (pieces) *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.scrap_quantity}
                        onChange={(e) => setFormData({ ...formData, scrap_quantity: e.target.value })}
                        className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Scrap Type */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Scrap Type *
                    </label>
                    <select
                      required
                      value={formData.scrap_type}
                      onChange={(e) => setFormData({ ...formData, scrap_type: e.target.value as ScrapType })}
                      className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="KERF_LOSS">Kerf Loss</option>
                      <option value="END_CUT">End Cut</option>
                      <option value="WRONG_CUT">Wrong Cut</option>
                      <option value="DAMAGED">Damaged Material</option>
                      <option value="SETUP_WASTE">Setup Waste</option>
                    </select>
                  </div>

                  {/* Scrap Reason */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Scrap Reason *
                    </label>
                    <select
                      required
                      value={formData.reason_code_id}
                      onChange={(e) => setFormData({ ...formData, reason_code_id: e.target.value })}
                      className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select reason...</option>
                      {mockScrapReasons.filter(r => r.is_active).map(reason => (
                        <option key={reason.id} value={reason.id}>
                          {reason.reason_code} - {reason.reason_name}
                          {reason.is_avoidable && ' (Avoidable)'}
                        </option>
                      ))}
                    </select>
                    {selectedReason && (
                      <p className={`text-xs mt-1 ${selectedReason.is_avoidable ? 'text-red-600' : 'text-gray-500'}`}>
                        {selectedReason.description}
                        {selectedReason.is_avoidable && ' - This scrap could have been avoided!'}
                      </p>
                    )}
                  </div>

                  {/* Conditional Fields for Reusable Scrap */}
                  {formData.scrap_classification === 'REUSABLE' && (
                    <div className="bg-green-50 p-4 rounded-lg space-y-4">
                      <h3 className="text-sm text-green-900">Reusable Scrap Details</h3>
                      
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          Dimension Details
                        </label>
                        <input
                          type="text"
                          value={formData.dimension_details}
                          onChange={(e) => setFormData({ ...formData, dimension_details: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="e.g., L:500mm x W:100mm x T:10mm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          Storage Location *
                        </label>
                        <input
                          type="text"
                          required={formData.scrap_classification === 'REUSABLE'}
                          value={formData.reusable_storage_location}
                          onChange={(e) => setFormData({ ...formData, reusable_storage_location: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="e.g., Rack A-12"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          Potential Use
                        </label>
                        <select
                          value={formData.potential_use}
                          onChange={(e) => setFormData({ ...formData, potential_use: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Select potential use...</option>
                          <option value="Production">Future Production</option>
                          <option value="Machine Fixture">Machine Fixture</option>
                          <option value="Testing">Testing Purpose</option>
                          <option value="Future Use">Future Use - TBD</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Recyclable Flag */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="recyclable"
                      checked={formData.is_recyclable}
                      onChange={(e) => setFormData({ ...formData, is_recyclable: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="recyclable" className="text-sm text-gray-700">
                      This scrap is recyclable (can be sold to vendor)
                    </label>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Additional notes about this scrap..."
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white px-6 py-3 lg:py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      Submit for Approval
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentScreen('dashboard')}
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
            <h3 className="text-gray-900 mb-4">Scrap Summary</h3>
            
            {selectedJob ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Job Order</p>
                  <p className="text-gray-900">{selectedJob.job_order_no}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 mb-1">Scrap Tracking ID</p>
                  <p className="text-gray-900 text-sm">{selectedJob.scrap_tracking_id}</p>
                </div>

                {formData.scrap_weight_kg && (
                  <>
                    <div className="border-t pt-3">
                      <p className="text-xs text-gray-600 mb-1">Weight</p>
                      <p className="text-gray-900">{formData.scrap_weight_kg} kg</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 mb-1">Estimated Value</p>
                      <p className="text-xl text-red-600">₹{estimatedValue.toFixed(2)}</p>
                    </div>
                  </>
                )}

                {formData.scrap_classification && (
                  <div className="border-t pt-3">
                    <p className="text-xs text-gray-600 mb-1">Classification</p>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-900">
                        Material: <span className="font-medium">{selectedMaterial?.material_category.replace('_', ' ')}</span>
                      </p>
                      <p className="text-sm text-gray-900">
                        Usability: <span className={`font-medium ${
                          formData.scrap_classification === 'REUSABLE' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formData.scrap_classification}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                  <p className="text-xs text-amber-800">
                    <strong>Note:</strong> This scrap entry will be sent to your supervisor for approval before SAP integration.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Select a job to see summary</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
