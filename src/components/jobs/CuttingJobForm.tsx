import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Screen } from '../MainApp';
import { CuttingJob } from '../../types';
import { ArrowLeft, Save } from 'lucide-react';

interface CuttingJobFormProps {
  jobId?: string;
  onNavigate: (screen: Screen) => void;
}

export function CuttingJobForm({ jobId, onNavigate }: CuttingJobFormProps) {
  const { cuttingJobs, addCuttingJob, updateCuttingJob, currentUser, users, machines, materials } = useApp();
  
  const existingJob = jobId ? cuttingJobs.find(j => j.id === jobId) : null;
  const isEditing = !!existingJob;

  const [formData, setFormData] = useState({
    jobOrderNo: '',
    jobDate: new Date().toISOString().split('T')[0],
    shift: 'DAY' as 'DAY' | 'NIGHT' | 'AFTERNOON',
    operatorId: currentUser?.id || '',
    supervisorId: '',
    machineId: '',
    materialId: '',
    plannedOutputQty: '',
    notes: ''
  });

  useEffect(() => {
    if (existingJob) {
      setFormData({
        jobOrderNo: existingJob.jobOrderNo,
        jobDate: existingJob.jobDate,
        shift: existingJob.shift,
        operatorId: existingJob.operatorId,
        supervisorId: existingJob.supervisorId,
        machineId: existingJob.machineId,
        materialId: existingJob.materialId,
        plannedOutputQty: existingJob.plannedOutputQty.toString(),
        notes: existingJob.notes || ''
      });
    }
  }, [existingJob]);

  const handleSubmit = (e: React.FormEvent, startNow: boolean = false) => {
    e.preventDefault();

    const job: CuttingJob = {
      id: existingJob?.id || `job-${Date.now()}`,
      jobOrderNo: formData.jobOrderNo,
      jobDate: formData.jobDate,
      shift: formData.shift,
      operatorId: formData.operatorId,
      supervisorId: formData.supervisorId,
      machineId: formData.machineId,
      materialId: formData.materialId,
      plannedOutputQty: parseInt(formData.plannedOutputQty),
      actualOutputQty: existingJob?.actualOutputQty || 0,
      totalInputWeight: existingJob?.totalInputWeight || 0,
      totalOutputWeight: existingJob?.totalOutputWeight || 0,
      totalScrapWeight: existingJob?.totalScrapWeight || 0,
      totalEndPieceWeight: existingJob?.totalEndPieceWeight || 0,
      scrapPercentage: existingJob?.scrapPercentage || 0,
      status: startNow ? 'IN_PROGRESS' : (existingJob?.status || 'PLANNED'),
      notes: formData.notes,
      createdAt: existingJob?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: existingJob?.completedAt
    };

    if (isEditing) {
      updateCuttingJob(job);
    } else {
      addCuttingJob(job);
    }

    onNavigate('jobs');
  };

  const operators = users.filter(u => u.role === 'OPERATOR' && u.isActive);
  const supervisors = users.filter(u => u.role === 'SUPERVISOR' && u.isActive);
  const activeMachines = machines.filter(m => m.status === 'ACTIVE');
  const activeMaterials = materials.filter(m => m.status === 'ACTIVE' && m.currentStockQty > 0);

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => onNavigate('jobs')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </button>
        <h2>{isEditing ? 'Edit Cutting Job' : 'Create New Cutting Job'}</h2>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
          {/* Job Order Number */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Job Order Number *
            </label>
            <input
              type="text"
              required
              value={formData.jobOrderNo}
              onChange={(e) => setFormData({ ...formData, jobOrderNo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., JOB-2025-001"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Job Date */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Job Date *
              </label>
              <input
                type="date"
                required
                value={formData.jobDate}
                onChange={(e) => setFormData({ ...formData, jobDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Shift */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Shift *
              </label>
              <select
                required
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="DAY">Day</option>
                <option value="AFTERNOON">Afternoon</option>
                <option value="NIGHT">Night</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Operator */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Operator *
              </label>
              <select
                required
                value={formData.operatorId}
                onChange={(e) => setFormData({ ...formData, operatorId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Operator</option>
                {operators.map(op => (
                  <option key={op.id} value={op.id}>
                    {op.fullName} ({op.employeeId})
                  </option>
                ))}
              </select>
            </div>

            {/* Supervisor */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Supervisor *
              </label>
              <select
                required
                value={formData.supervisorId}
                onChange={(e) => setFormData({ ...formData, supervisorId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Supervisor</option>
                {supervisors.map(sup => (
                  <option key={sup.id} value={sup.id}>
                    {sup.fullName} ({sup.employeeId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Machine */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Machine *
            </label>
            <select
              required
              value={formData.machineId}
              onChange={(e) => setFormData({ ...formData, machineId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Machine</option>
              {activeMachines.map(machine => (
                <option key={machine.id} value={machine.id}>
                  {machine.machineCode} - {machine.machineName} ({machine.machineType})
                </option>
              ))}
            </select>
          </div>

          {/* Material */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Raw Material *
            </label>
            <select
              required
              value={formData.materialId}
              onChange={(e) => setFormData({ ...formData, materialId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Material</option>
              {activeMaterials.map(material => (
                <option key={material.id} value={material.id}>
                  {material.materialCode} - {material.materialGrade} (Stock: {material.currentStockQty} {material.unitOfMeasure})
                </option>
              ))}
            </select>
          </div>

          {/* Planned Output Quantity */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Planned Output Quantity *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.plannedOutputQty}
              onChange={(e) => setFormData({ ...formData, plannedOutputQty: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Number of pieces to produce"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Additional notes about this job..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isEditing ? 'Update Job' : 'Save as Planned'}
            </button>
            
            {!isEditing && (
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Start Job Now
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigate('jobs')}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
