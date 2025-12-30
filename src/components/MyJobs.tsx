// import { useState } from 'react';
// import { Plus, Filter, Eye, Clock, Play, XCircle, AlertTriangle, ArrowLeft, CheckCircle, Scissors, Package } from 'lucide-react';
// import { useApp } from '../context/AppContext';

// import { CuttingJobDetail } from './CuttingJobDetail';

// // Mock cut pieces data for tracking
// const mockCutPiecesData = [
//   { job_id: 'JOB001', job_order_no: 'WO-2025-001', total_pieces: 8, available: 2, in_process: 3, completed: 3 },
//   { job_id: 'JOB002', job_order_no: 'WO-2025-002', total_pieces: 5, available: 5, in_process: 0, completed: 0 },
//   { job_id: 'JOB003', job_order_no: 'WO-2025-003', total_pieces: 12, available: 0, in_process: 4, completed: 8 },
// ];

// export function MyJobs() {
//   const { currentUser, setCurrentScreen } = useApp();
//   const [filterStatus, setFilterStatus] = useState('ALL');
//   const [selectedJob, setSelectedJob] = useState<string | null>(null);
//   const [cancelJobId, setCancelJobId] = useState<string | null>(null);
//   const [cancelReason, setCancelReason] = useState('');

//   const isOperator = currentUser?.role === 'OPERATOR';
//   const isSupervisor = currentUser?.role === 'SUPERVISOR' || currentUser?.role === 'MANAGER';
  
//   const [jobs, setJobs] = useState<any[]>([]).filter(job => {
//     if (isOperator && job.operator_id !== currentUser?.id) return false;
//     if (filterStatus !== 'ALL' && job.status !== filterStatus) return false;
//     return true;
//   });

//   const handleCancelJob = () => {
//     if (!cancelReason.trim()) {
//       alert('Please provide a reason for cancellation');
//       return;
//     }
    
//     console.log(`Job ${cancelJobId} cancelled by ${currentUser?.full_name}. Reason: ${cancelReason}`);
//     alert(`Job Order cancelled successfully!\n\nReason: ${cancelReason}`);
//     setCancelJobId(null);
//     setCancelReason('');
//   };

//   if (selectedJob) {
//     const job = mockCuttingJobs.find(j => j.id === selectedJob);
//     if (job) {
//       return <CuttingJobDetail job={job} onBack={() => setSelectedJob(null)} />;
//     }
//   }

//   return (
//     <div className="overflow-hidden">
//       {/* Cancel Job Modal */}
//       {cancelJobId && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="p-3 bg-red-100 rounded-full">
//                 <AlertTriangle className="w-6 h-6 text-red-600" />
//               </div>
//               <div>
//                 <h3 className="text-gray-900">Cancel Job Order</h3>
//                 <p className="text-sm text-gray-600">
//                   {mockCuttingJobs.find(j => j.id === cancelJobId)?.job_order_no}
//                 </p>
//               </div>
//             </div>

//             <div className="mb-4">
//               <label className="block text-sm text-gray-700 mb-2">
//                 Cancellation Reason *
//               </label>
//               <textarea
//                 value={cancelReason}
//                 onChange={(e) => setCancelReason(e.target.value)}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//                 rows={4}
//                 placeholder="Provide reason for cancelling this job order..."
//                 autoFocus
//               />
//             </div>

//             <div className="flex gap-3">
//               <button
//                 onClick={handleCancelJob}
//                 className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition-colors"
//               >
//                 Confirm Cancellation
//               </button>
//               <button
//                 onClick={() => {
//                   setCancelJobId(null);
//                   setCancelReason('');
//                 }}
//                 className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="mb-3 lg:mb-6">
//         <div className="flex items-center gap-2 lg:gap-4 mb-3 lg:mb-4">
//           <button
//             onClick={() => setCurrentScreen('dashboard')}
//             className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
//           >
//             <ArrowLeft className="w-5 h-5" />
//           </button>
//           <div className="flex-1 min-w-0">
//             <h1 className="text-gray-900 text-lg lg:text-2xl">
//               {isOperator ? 'My Jobs' : 'All Cutting Jobs'}
//             </h1>
//             <p className="text-gray-600 mt-1 text-sm">
//               {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
//             </p>
//           </div>
//         </div>

//         {/* Filter Buttons */}
//         <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
//           {['ALL', 'PLANNED', 'IN_PROGRESS', 'COMPLETED'].map(status => (
//             <button
//               key={status}
//               onClick={() => setFilterStatus(status)}
//               className={`px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm whitespace-nowrap transition-colors flex-shrink-0 ${
//                 filterStatus === status
//                   ? 'bg-blue-600 text-white'
//                   : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
//               }`}
//             >
//               {status.replace('_', ' ')}
//             </button>
//           ))}
//         </div>
//       </div>

//       <div className="space-y-3 lg:space-y-4">
//         {jobs.length === 0 ? (
//           <div className="bg-white rounded-lg shadow p-8 lg:p-12 text-center">
//             <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//             <p className="text-gray-500">No jobs found matching your filters</p>
//           </div>
//         ) : (
//           jobs.map(job => (
//             <div
//               key={job.id}
//               className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden"
//             >
//               <div className="p-3 lg:p-6">
//                 <div className="flex items-start gap-2 mb-3">
//                   <div className="flex-1 min-w-0">
//                     <div className="flex flex-col gap-1.5 mb-2">
//                       <h2 className="text-gray-900 text-sm lg:text-xl truncate">{job.job_order_no}</h2>
//                       <div>
//                         <StatusBadge status={job.status} />
//                       </div>
//                     </div>
//                     <div className="grid grid-cols-2 gap-2 text-sm">
//                       <div className="min-w-0">
//                         <p className="text-gray-600 text-xs">Date</p>
//                         <p className="text-gray-900 text-xs lg:text-sm truncate">{new Date(job.job_date).toLocaleDateString()}</p>
//                       </div>
//                       <div className="min-w-0">
//                         <p className="text-gray-600 text-xs">Material</p>
//                         <p className="text-gray-900 text-xs lg:text-sm truncate">{job.material_code}</p>
//                       </div>
//                       <div className="min-w-0">
//                         <p className="text-gray-600 text-xs">Machine</p>
//                         <p className="text-gray-900 text-xs lg:text-sm truncate">{job.machine_name}</p>
//                       </div>
//                       <div className="min-w-0">
//                         <p className="text-gray-600 text-xs">Operator</p>
//                         <p className="text-gray-900 text-xs lg:text-sm truncate">{job.operator_name}</p>
//                       </div>
//                     </div>
//                   </div>

//                   <button
//                     onClick={() => setSelectedJob(job.id)}
//                     className="p-1.5 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
//                   >
//                     <Eye className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
//                   </button>
//                 </div>

//                 {job.status === 'COMPLETED' && (
//                   <div className="grid grid-cols-3 lg:grid-cols-5 gap-2 pt-3 border-t border-gray-200 mb-3">
//                     <div className="min-w-0">
//                       <p className="text-xs text-gray-600 mb-0.5">Output</p>
//                       <p className="text-xs lg:text-sm text-gray-900 truncate">
//                         {job.actual_output_qty}/{job.planned_output_qty}
//                       </p>
//                     </div>
//                     <div className="min-w-0">
//                       <p className="text-xs text-gray-600 mb-0.5">Scrap Wt</p>
//                       <p className="text-xs lg:text-sm text-gray-900 truncate">{job.total_scrap_weight_kg.toFixed(1)} kg</p>
//                     </div>
//                     <div className="min-w-0">
//                       <p className="text-xs text-gray-600 mb-0.5">Scrap %</p>
//                       <p className={`text-xs lg:text-sm truncate ${
//                         job.scrap_percentage > 5 ? 'text-red-600' : 'text-green-600'
//                       }`}>
//                         {job.scrap_percentage.toFixed(1)}%
//                       </p>
//                     </div>
//                     <div className="min-w-0">
//                       <p className="text-xs text-gray-600 mb-0.5">End Pcs</p>
//                       <p className="text-xs lg:text-sm text-gray-900 truncate">{job.total_end_piece_weight_kg.toFixed(1)} kg</p>
//                     </div>
//                     <div className="min-w-0">
//                       <p className="text-xs text-gray-600 mb-0.5">Efficiency</p>
//                       <p className="text-xs lg:text-sm text-green-600 truncate">
//                         {((job.total_output_weight_kg / job.total_input_weight_kg) * 100).toFixed(1)}%
//                       </p>
//                     </div>
//                   </div>
//                 )}

//                 {/* Cut Pieces Tracking Summary */}
//                 {job.status === 'COMPLETED' && (() => {
//                   const cutPiecesInfo = mockCutPiecesData.find(cp => cp.job_id === job.id);
//                   if (!cutPiecesInfo || cutPiecesInfo.total_pieces === 0) return null;
                  
//                   const movedCount = cutPiecesInfo.in_process + cutPiecesInfo.completed;
//                   const movedPercentage = (movedCount / cutPiecesInfo.total_pieces) * 100;
                  
//                   return (
//                     <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
//                       <div className="flex items-center gap-2 mb-2">
//                         <Scissors className="w-4 h-4 text-purple-600" />
//                         <h3 className="text-sm text-purple-900">Cut Pieces Movement</h3>
//                       </div>
//                       <div className="grid grid-cols-4 gap-2 text-center">
//                         <div className="bg-white rounded p-2">
//                           <p className="text-lg text-purple-900">{cutPiecesInfo.total_pieces}</p>
//                           <p className="text-xs text-purple-700">Total</p>
//                         </div>
//                         <div className="bg-green-100 rounded p-2">
//                           <p className="text-lg text-green-900">{cutPiecesInfo.available}</p>
//                           <p className="text-xs text-green-700">Available</p>
//                         </div>
//                         <div className="bg-blue-100 rounded p-2">
//                           <p className="text-lg text-blue-900">{movedCount}</p>
//                           <p className="text-xs text-blue-700">Moved</p>
//                         </div>
//                         <div className="bg-amber-100 rounded p-2">
//                           <p className="text-lg text-amber-900">{movedPercentage.toFixed(0)}%</p>
//                           <p className="text-xs text-amber-700">Progress</p>
//                         </div>
//                       </div>
//                       <div className="mt-2">
//                         <div className="flex justify-between text-xs text-purple-700 mb-1">
//                           <span>To Next Operations</span>
//                           <span>{movedCount}/{cutPiecesInfo.total_pieces}</span>
//                         </div>
//                         <div className="w-full bg-purple-200 rounded-full h-2">
//                           <div 
//                             className="bg-purple-600 h-2 rounded-full transition-all"
//                             style={{ width: `${movedPercentage}%` }}
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })()}

//                 {job.status === 'IN_PROGRESS' && (
//                   <div className="pt-3 border-t border-gray-200">
//                     <button
//                       onClick={() => setSelectedJob(job.id)}
//                       className="w-full bg-blue-600 text-white px-4 py-2.5 lg:py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-xs lg:text-sm"
//                     >
//                       <Play className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
//                       Continue Working on Job
//                     </button>
//                   </div>
//                 )}

//                 {/* Supervisor Cancel Button */}
//                 {isSupervisor && (job.status === 'PLANNED' || job.status === 'IN_PROGRESS') && (
//                   <div className={`${job.status === 'IN_PROGRESS' ? 'mt-3' : 'pt-3 border-t border-gray-200'}`}>
//                     <button
//                       onClick={() => setCancelJobId(job.id)}
//                       className="w-full bg-red-50 text-red-600 border border-red-200 px-4 py-2.5 lg:py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-xs lg:text-sm"
//                     >
//                       <XCircle className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
//                       Cancel Job Order
//                     </button>
//                   </div>
//                 )}

//                 {job.notes && (
//                   <div className="mt-3 pt-3 border-t border-gray-200">
//                     <p className="text-xs lg:text-sm text-gray-600">
//                       <strong>Notes:</strong> {job.notes}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }

// function StatusBadge({ status }: { status: string }) {
//   const config = {
//     PLANNED: { label: 'Planned', className: 'bg-gray-100 text-gray-800', icon: Clock },
//     IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-100 text-blue-800', icon: Play },
//     COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-800', icon: CheckCircle },
//     CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-800', icon: XCircle },
//   };

//   const { label, className, icon: Icon } = config[status as keyof typeof config] || config.PLANNED;

//   return (
//     <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${className}`}>
//       <Icon className="w-3 h-3" />
//       {label}
//     </span>
//   );
// }

import { useState, useEffect, useMemo } from 'react';
import {
  Eye,
  Clock,
  Play,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Scissors,
} from 'lucide-react';

import { useApp } from '../context/AppContext';
import { supabase } from '../src/config/supabase';
import { CuttingJobDetail } from './CuttingJobDetail';

/* ------------------------------------------------------------------
   TEMP MOCK (CUT PIECES)
   NOTE: This will be replaced by DB data in next stage
------------------------------------------------------------------- */
const mockCutPiecesData = [
  { job_id: 'JOB001', job_order_no: 'WO-2025-001', total_pieces: 8, available: 2, in_process: 3, completed: 3 },
  { job_id: 'JOB002', job_order_no: 'WO-2025-002', total_pieces: 5, available: 5, in_process: 0, completed: 0 },
  { job_id: 'JOB003', job_order_no: 'WO-2025-003', total_pieces: 12, available: 0, in_process: 4, completed: 8 },
];

export function MyJobs() {
  const { currentUser, setCurrentScreen } = useApp();

  const [jobs, setJobs] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [cancelJobId, setCancelJobId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const isOperator = currentUser?.role === 'OPERATOR';
  const isSupervisor = currentUser?.role === 'SUPERVISOR' || currentUser?.role === 'MANAGER';

  /* ------------------------------------------------------------------
     FETCH JOBS (READ MODEL)
     Source: my_jobs_view
  ------------------------------------------------------------------- */
  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from('my_jobs_view')
        .select('*')
        .order('job_date', { ascending: false });

      if (error) {
        console.error('Failed to fetch jobs:', error);
        return;
      }

      setJobs(data || []);
    };

    fetchJobs();
  }, []);

  /* ------------------------------------------------------------------
     FILTERED JOBS (DERIVED STATE)
  ------------------------------------------------------------------- */
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      if (isOperator && job.operator_id !== currentUser?.id) return false;
      if (filterStatus !== 'ALL' && job.status !== filterStatus) return false;
      return true;
    });
  }, [jobs, filterStatus, isOperator, currentUser]);

  /* ------------------------------------------------------------------
     CANCEL JOB (UI ONLY – BACKEND COMES LATER)
  ------------------------------------------------------------------- */
  const handleCancelJob = () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    console.log(`Job ${cancelJobId} cancelled by ${currentUser?.full_name}`);
    console.log(`Reason: ${cancelReason}`);

    alert(`Job Order cancelled successfully!\n\nReason: ${cancelReason}`);
    setCancelJobId(null);
    setCancelReason('');
  };

  /* ------------------------------------------------------------------
     JOB DETAIL VIEW
  ------------------------------------------------------------------- */
  if (selectedJob) {
    const job = jobs.find(j => j.id === selectedJob);
    if (job) {
      return <CuttingJobDetail job={job} onBack={() => setSelectedJob(null)} />;
    }
  }

  return (
    <div className="overflow-hidden">
      {/* ---------------- CANCEL MODAL ---------------- */}
      {cancelJobId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-gray-900">Cancel Job Order</h3>
                <p className="text-sm text-gray-600">
                  {jobs.find(j => j.id === cancelJobId)?.job_order_no}
                </p>
              </div>
            </div>

            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              rows={4}
              placeholder="Provide reason for cancelling this job order..."
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCancelJob}
                className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg"
              >
                Confirm Cancellation
              </button>
              <button
                onClick={() => {
                  setCancelJobId(null);
                  setCancelReason('');
                }}
                className="px-4 py-2.5 border border-gray-300 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- HEADER ---------------- */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-gray-900 text-2xl">
              {isOperator ? 'My Jobs' : 'All Cutting Jobs'}
            </h1>
            <p className="text-gray-600 text-sm">
              {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex gap-2">
          {['ALL', 'PLANNED', 'IN_PROGRESS', 'COMPLETED'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-4 py-2 rounded-lg text-sm ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* ---------------- JOB LIST ---------------- */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No jobs found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map(job => (
            <div key={job.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl text-gray-900">{job.job_order_no}</h2>
                  <StatusBadge status={job.status} />
                  <p className="text-sm text-gray-600 mt-2">
                    {job.material_code} • {job.machine_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Operator: {job.operator_name}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedJob(job.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Eye />
                </button>
              </div>

              {isSupervisor && (job.status === 'PLANNED' || job.status === 'IN_PROGRESS') && (
                <button
                  onClick={() => setCancelJobId(job.id)}
                  className="mt-4 w-full bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg"
                >
                  <XCircle className="inline mr-2" />
                  Cancel Job
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------
   STATUS BADGE
------------------------------------------------------------------- */
function StatusBadge({ status }: { status: string }) {
  const config: any = {
    PLANNED: { label: 'Planned', className: 'bg-gray-100 text-gray-800', icon: Clock },
    IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-100 text-blue-800', icon: Play },
    COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-800', icon: CheckCircle },
    CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-800', icon: XCircle },
  };

  const { label, className, icon: Icon } = config[status];

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}
