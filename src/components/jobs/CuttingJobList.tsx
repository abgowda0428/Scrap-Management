import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Screen } from '../MainApp';
import { Plus, Pencil, PlayCircle, CheckCircle, Search } from 'lucide-react';

interface CuttingJobListProps {
  onNavigate: (screen: Screen) => void;
  onSelectJob: (jobId: string) => void;
}

export function CuttingJobList({ onNavigate, onSelectJob }: CuttingJobListProps) {
  const { cuttingJobs, users, machines, materials, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Filter jobs based on user role
  let filteredJobs = cuttingJobs;
  if (currentUser?.role === 'OPERATOR') {
    filteredJobs = cuttingJobs.filter(job => job.operatorId === currentUser.id);
  }

  // Apply filters
  if (statusFilter !== 'ALL') {
    filteredJobs = filteredJobs.filter(job => job.status === statusFilter);
  }

  if (searchTerm) {
    filteredJobs = filteredJobs.filter(job => 
      job.jobOrderNo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Sort by date (newest first)
  filteredJobs = [...filteredJobs].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getJobWithDetails = (job: typeof cuttingJobs[0]) => ({
    ...job,
    operator: users.find(u => u.id === job.operatorId),
    supervisor: users.find(u => u.id === job.supervisorId),
    machine: machines.find(m => m.id === job.machineId),
    material: materials.find(m => m.id === job.materialId)
  });

  const statusColors = {
    PLANNED: 'bg-gray-100 text-gray-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800'
  };

  const statusIcons = {
    PLANNED: null,
    IN_PROGRESS: PlayCircle,
    COMPLETED: CheckCircle,
    CANCELLED: null
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Cutting Jobs</h2>
          <p className="text-gray-600 mt-1">{filteredJobs.length} jobs found</p>
        </div>
        <button
          onClick={() => onNavigate('create-job')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New Job
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by job order number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="PLANNED">Planned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Job List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredJobs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">No jobs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                    Job Order No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                    Operator
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                    Machine
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                    Material
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                    Scrap %
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredJobs.map(job => {
                  const jobDetails = getJobWithDetails(job);
                  const StatusIcon = statusIcons[job.status];
                  
                  return (
                    <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-gray-900">{job.jobOrderNo}</div>
                        {job.notes && (
                          <div className="text-sm text-gray-500 mt-1">{job.notes}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(job.jobDate).toLocaleDateString()}
                        <div className="text-xs text-gray-500">{job.shift}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {jobDetails.operator?.fullName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {jobDetails.machine?.machineCode}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {jobDetails.material?.materialCode}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="text-gray-900">
                          {job.actualOutputQty}/{job.plannedOutputQty}
                        </div>
                        <div className="text-xs text-gray-500">
                          {job.plannedOutputQty > 0 
                            ? ((job.actualOutputQty / job.plannedOutputQty) * 100).toFixed(0) 
                            : 0}% complete
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`${
                          job.scrapPercentage > 7 ? 'text-red-600' : 
                          job.scrapPercentage > 5 ? 'text-orange-600' : 
                          'text-green-600'
                        }`}>
                          {job.scrapPercentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {StatusIcon && <StatusIcon className="w-4 h-4" />}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${statusColors[job.status]}`}>
                            {job.status.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {job.status === 'IN_PROGRESS' && (
                            <button
                              onClick={() => {
                                onSelectJob(job.id);
                                onNavigate('cutting-operation');
                              }}
                              className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
                            >
                              Continue
                            </button>
                          )}
                          {(job.status === 'PLANNED' || job.status === 'IN_PROGRESS') && (
                            <button
                              onClick={() => {
                                onSelectJob(job.id);
                                onNavigate('edit-job');
                              }}
                              className="text-gray-600 hover:text-gray-800 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
