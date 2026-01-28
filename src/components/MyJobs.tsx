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


//prajeeth


// import { useState, useEffect, useMemo } from 'react';
// // import { XCircle } from 'lucide-react';
// //import { useApp } from '../context/AppContext';

// import {
//   Eye,
//   Clock,
//   Play,
//   XCircle,
//   AlertTriangle,
//   ArrowLeft,
//   CheckCircle,
//   Scissors,
// } from 'lucide-react';

// import { useApp } from '../context/AppContext';
// import { supabase } from '../src/config/supabase';
// import { CuttingJobDetail } from './CuttingJobDetail';

// /* ------------------------------------------------------------------
//    TEMP MOCK (CUT PIECES)
//    NOTE: This will be replaced by DB data in next stage
// ------------------------------------------------------------------- */
// const mockCutPiecesData = [
//   { job_id: 'JOB001', job_order_no: 'WO-2025-001', total_pieces: 8, available: 2, in_process: 3, completed: 3 },
//   { job_id: 'JOB002', job_order_no: 'WO-2025-002', total_pieces: 5, available: 5, in_process: 0, completed: 0 },
//   { job_id: 'JOB003', job_order_no: 'WO-2025-003', total_pieces: 12, available: 0, in_process: 4, completed: 8 },
// ];



// export function MyJobs() {
//   const { currentUser, setCurrentScreen } = useApp();

//   const [jobs, setJobs] = useState<any[]>([]);
//   const [filterStatus, setFilterStatus] = useState<'ALL' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
//   const [selectedJob, setSelectedJob] = useState<string | null>(null);
//   const [cancelJobId, setCancelJobId] = useState<string | null>(null);
//   const [cancelReason, setCancelReason] = useState('');

//   const isOperator = currentUser?.role === 'OPERATOR';
//   const isSupervisor = currentUser?.role === 'SUPERVISOR' || currentUser?.role === 'MANAGER';

//   /* ------------------------------------------------------------------
//      FETCH JOBS (READ MODEL)
//      Source: my_jobs_view
//   ------------------------------------------------------------------- */
//   useEffect(() => {
//     const fetchJobs = async () => {
//       const { data, error } = await supabase
//         .from('my_jobs_view')
//         .select('*')
//         .order('job_date', { ascending: false });

//       if (error) {
//         console.error('Failed to fetch jobs:', error);
//         return;
//       }

//       setJobs(data || []);
//     };

//     fetchJobs();
//   }, []);

//   /* ------------------------------------------------------------------
//      FILTERED JOBS (DERIVED STATE)
//   ------------------------------------------------------------------- */
//   const filteredJobs = useMemo(() => {
//     return jobs.filter(job => {
//       if (isOperator && job.operator_id !== currentUser?.id) return false;
//       if (filterStatus !== 'ALL' && job.status !== filterStatus) return false;
//       return true;
//     });
//   }, [jobs, filterStatus, isOperator, currentUser]);

//   /* ------------------------------------------------------------------
//      CANCEL JOB (UI ONLY – BACKEND COMES LATER)
//   ------------------------------------------------------------------- */
//   const handleCancelJob = async () => {
//   if (!cancelReason.trim()) {
//     alert('Please provide a reason for cancellation');
//     return;
//   }

//   try {
//     await supabase
//       .from('cutting_jobs')
//       .update({
//         status: 'CANCELLED',
//         cancel_reason: cancelReason,
//       })
//       .eq('id', cancelJobId);

//     setJobs(prev =>
//       prev.map(j =>
//         j.id === cancelJobId
//           ? { ...j, status: 'CANCELLED' }
//           : j
//       )
//     );

//     setCancelJobId(null);
//     setCancelReason('');
//   } catch (error) {
//     console.error('Cancel job failed:', error);
//     alert('Failed to cancel job');
//   }
// };

//   /* ------------------------------------------------------------------
//      JOB DETAIL VIEW
//   ------------------------------------------------------------------- */
//   if (selectedJob) {
//     const job = jobs.find(j => j.id === selectedJob);
//     if (job) {
//       return <CuttingJobDetail job={job} onBack={() => setSelectedJob(null)} />;
//     }
//   }

//   return (
//     <div className="overflow-hidden">
//       {/* ---------------- CANCEL MODAL ---------------- */}
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
//                   {jobs.find(j => j.id === cancelJobId)?.job_order_no}
//                 </p>
//               </div>
//             </div>

//             <textarea
//               value={cancelReason}
//               onChange={(e) => setCancelReason(e.target.value)}
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg"
//               rows={4}
//               placeholder="Provide reason for cancelling this job order..."
//             />

//             <div className="flex gap-3 mt-4">
//               <button
//                 onClick={handleCancelJob}
//                 className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg"
//               >
//                 Confirm Cancellation
//               </button>
//               <button
//                 onClick={() => {
//                   setCancelJobId(null);
//                   setCancelReason('');
//                 }}
//                 className="px-4 py-2.5 border border-gray-300 rounded-lg"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ---------------- HEADER ---------------- */}
//       <div className="mb-6">
//         <div className="flex items-center gap-3 mb-4">
//           <button
//             onClick={() => setCurrentScreen('dashboard')}
//             className="p-2 hover:bg-gray-100 rounded-lg"
//           >
//             <ArrowLeft className="w-5 h-5" />
//           </button>
//           <div>
//             <h1 className="text-gray-900 text-2xl">
//               {isOperator ? 'My Jobs' : 'All Cutting Jobs'}
//             </h1>
//             <p className="text-gray-600 text-sm">
//               {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
//             </p>
//           </div>
//         </div>

//         {/* FILTERS */}
//         <div className="flex gap-2">
//           {['ALL', 'PLANNED', 'IN_PROGRESS', 'COMPLETED'].map(status => (
//             <button
//               key={status}
//               onClick={() => setFilterStatus(status as any)}
//               className={`px-4 py-2 rounded-lg text-sm ${
//                 filterStatus === status
//                   ? 'bg-blue-600 text-white'
//                   : 'bg-white border border-gray-300'
//               }`}
//             >
//               {status.replace('_', ' ')}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* ---------------- JOB LIST ---------------- */}
//       {filteredJobs.length === 0 ? (
//         <div className="bg-white rounded-lg shadow p-12 text-center">
//           <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//           <p className="text-gray-500">No jobs found</p>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {filteredJobs.map(job => (
//             <div key={job.id} className="bg-white rounded-lg shadow p-6">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <h2 className="text-xl text-gray-900">{job.job_order_no}</h2>
//                   <StatusBadge status={job.status} />
//                   <p className="text-sm text-gray-600 mt-2">
//                     {job.material_code} • {job.machine_name}
//                   </p>
//                   <p className="text-sm text-gray-600">
//                     Operator: {job.operator_name}
//                   </p>
//                 </div>
//                 {/* ---------------- JOB ACTIONS ---------------- */}
// {job.status === 'PLANNED' && (
//   <button
//     onClick={async () => {
//       // 1. Update DB
//       await supabase
//         .from('cutting_jobs')
//         .update({ status: 'IN_PROGRESS' })
//         .eq('id', job.id);

//       // 2. Update UI safely
//       setJobs(prev =>
//         prev.map(j =>
//           j.id === job.id ? { ...j, status: 'IN_PROGRESS' } : j
//         )
//       );
//     }}
//     className="mt-4 w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg
//                hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
//   >
//     <Play className="w-4 h-4" />
//     Start Job
//   </button>
// )}

// {job.status === 'IN_PROGRESS' && (
//   <button
//     onClick={() => {
//       setSelectedJob(job.id);
//       setCurrentScreen('cutting-operation');
//     }}
//     className="mt-4 w-full bg-indigo-600 text-white px-4 py-2.5 rounded-lg
//                hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
//   >
//     <Play className="w-4 h-4" />
//     Continue Working
//   </button>
// )}

// {/* ---------------- CANCEL JOB (SUPERVISOR ONLY) ---------------- */}


//                 <button
//                   onClick={() => setSelectedJob(job.id)}
//                   className="p-2 hover:bg-gray-100 rounded-lg"
//                 >
//                   <Eye />
//                 </button>
//               </div>

//               {isSupervisor && (job.status === 'PLANNED' || job.status === 'IN_PROGRESS') && (
//                 <button
//                   onClick={() => setCancelJobId(job.id)}
//                   className="mt-4 w-full bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg"
//                 >
//                   <XCircle className="inline mr-2" />
//                   Cancel Job
//                 </button>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// /* ------------------------------------------------------------------
//    STATUS BADGE
// ------------------------------------------------------------------- */
// function StatusBadge({ status }: { status: string }) {
//   const config: any = {
//     PLANNED: { label: 'Planned', className: 'bg-gray-100 text-gray-800', icon: Clock },
//     IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-100 text-blue-800', icon: Play },
//     COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-800', icon: CheckCircle },
//     CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-800', icon: XCircle },
//   };

//   const { label, className, icon: Icon } = config[status];

//   return (
//     <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${className}`}>
//       <Icon className="w-3 h-3" />
//       {label}
//     </span>
//   );
// }

//prajeeth-in-progress



// import { useState, useEffect, useMemo } from 'react';

// import {
//   Eye,
//   Clock,
//   Play,
//   XCircle,
//   AlertTriangle,
//   ArrowLeft,
//   CheckCircle,
// } from 'lucide-react';

// import { useApp } from '../context/AppContext';
// import { supabase } from '../src/config/supabase';
// import { CuttingJobDetail } from './CuttingJobDetail';

// export function MyJobs() {
//   const { currentUser, setCurrentScreen } = useApp();

//   // Safety guard – DO NOT CHANGE
//   if (!currentUser) {
//     return <div className="p-6">Loading user…</div>;
//   }

//   /* ---------------- STATE (UNCHANGED) ---------------- */
//   const [jobs, setJobs] = useState<any[]>([]);
//   const [filterStatus, setFilterStatus] = useState<
//     'ALL' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
//   >('ALL');

//   const [selectedJob, setSelectedJob] = useState<string | null>(null);
//   const [cancelJobId, setCancelJobId] = useState<string | null>(null);
//   const [cancelReason, setCancelReason] = useState('');

//   /* ---------------- ROLE LOGIC (UNCHANGED) ---------------- */
//   const isOperator = currentUser.role === 'OPERATOR';
//   const isSupervisor = currentUser.role !== 'OPERATOR';

//   /* ---------------- FETCH JOBS (UNCHANGED) ---------------- */
//   useEffect(() => {
//     const fetchJobs = async () => {
//       const { data, error } = await supabase
//         .from('my_jobs_view')
//         .select('*')
//         .order('job_date', { ascending: false });

//       if (error) {
//         console.error('Failed to fetch jobs:', error);
//         return;
//       }

//       setJobs(data || []);
//     };

//     fetchJobs();
//   }, []);

//   /* ---------------- FILTER LOGIC (UNCHANGED) ---------------- */
//   const filteredJobs = useMemo(() => {
//     return jobs.filter(job => {
//       if (isOperator && job.operator_id !== currentUser.id) return false;
//       if (filterStatus !== 'ALL' && job.status !== filterStatus) return false;
//       return true;
//     });
//   }, [jobs, filterStatus, isOperator, currentUser]);

//   /* ---------------- CANCEL HANDLER (UNCHANGED) ---------------- */
//   const handleCancelJob = async () => {
//     if (!cancelReason.trim()) {
//       alert('Please provide a reason for cancellation');
//       return;
//     }

//     try {
//       await supabase
//         .from('cutting_jobs')
//         .update({
//           status: 'CANCELLED',
//           cancel_reason: cancelReason,
//         })
//         .eq('id', cancelJobId);

//       setJobs(prev =>
//         prev.map(j =>
//           j.id === cancelJobId ? { ...j, status: 'CANCELLED' } : j
//         )
//       );

//       setCancelJobId(null);
//       setCancelReason('');
//     } catch (error) {
//       console.error('Cancel job failed:', error);
//       alert('Failed to cancel job');
//     }
//   };

//   /* ---------------- JOB DETAIL VIEW (UNCHANGED) ---------------- */
//   if (selectedJob) {
//     const job = jobs.find(j => j.id === selectedJob);
//     if (job) {
//       return (
//         <CuttingJobDetail
//           job={job}
//           onBack={() => setSelectedJob(null)}
//         />
//       );
//     }
//   }

//   return (
//     <div className="overflow-hidden">

//       {/* ================= CANCEL MODAL (UNCHANGED) ================= */}
//       {cancelJobId && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
//             <h3 className="text-gray-900 mb-2">Cancel Job Order</h3>

//             <textarea
//               value={cancelReason}
//               onChange={e => setCancelReason(e.target.value)}
//               className="w-full px-4 py-3 border rounded-lg"
//               rows={4}
//               placeholder="Provide reason for cancelling this job order..."
//             />

//             <div className="flex gap-3 mt-4">
//               <button
//                 onClick={handleCancelJob}
//                 className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg"
//               >
//                 Confirm Cancellation
//               </button>
//               <button
//                 onClick={() => {
//                   setCancelJobId(null);
//                   setCancelReason('');
//                 }}
//                 className="px-4 py-2 border rounded-lg"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ================= HEADER ================= */}
//       <div className="mb-6">
//         <div className="flex items-center gap-3 mb-4">
//           <button
//             onClick={() => setCurrentScreen('dashboard')}
//             className="p-2 hover:bg-gray-100 rounded-lg"
//           >
//             <ArrowLeft className="w-5 h-5" />
//           </button>

//           <div>
//             <h1 className="text-2xl text-gray-900">
//               {isOperator ? 'My Jobs' : 'All Cutting Jobs'}
//             </h1>
//             <p className="text-sm text-gray-600">
//               {filteredJobs.length} job(s) found
//             </p>
//           </div>
//         </div>

//         {/* FILTER TABS (UNCHANGED) */}
//         <div className="flex gap-2">
//           {['ALL', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(status => (
//             <button
//               key={status}
//               onClick={() => setFilterStatus(status as any)}
//               className={`px-4 py-2 rounded-lg text-sm ${
//                 filterStatus === status
//                   ? status === 'CANCELLED'
//                     ? 'bg-red-600 text-white'
//                     : 'bg-blue-600 text-white'
//                   : 'bg-white border'
//               }`}
//             >
//               {status.replace('_', ' ')}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* ================= JOB LIST ================= */}
//       <div className="space-y-4">
//         {filteredJobs.map(job => (
//           <div key={job.id} className="bg-white rounded-lg shadow p-6">

//             {/* ===== CARD LAYOUT (ALIGNMENT ONLY) ===== */}
//             <div className="flex justify-between gap-6">

//               {/* -------- LEFT : JOB INFO -------- */}
//               <div className="flex-1">
//                 <h2 className="text-xl text-gray-900">{job.job_order_no}</h2>
//                 <StatusBadge status={job.status} />

//                 <p className="text-sm text-gray-600 mt-2">
//                   {job.material_code} • {job.machine_name}
//                 </p>

//                 <p className="text-sm text-gray-600 mt-1">
//                   Operator:{' '}
//                   <span className="text-gray-900 font-medium">
//                     {job.operator_name || '-'}
//                   </span>
//                 </p>

//                 {/* MASTER JOB DETAILS – SHOWN FOR ALL STATES */}
//                 {['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(job.status) && (
//                   <div className="mt-2 space-y-1 text-sm">
//                     <p>
//                       Supervisor:{' '}
//                       <strong>{job.supervisor_name || '-'}</strong>
//                     </p>
//                     <p>
//                       Planned Qty:{' '}
//                       <strong>{job.planned_output_qty ?? '-'} pcs</strong>
//                     </p>
//                     <p>
//                       Master Serial No:{' '}
//                       <strong>{job.fg_code || '-'}</strong>
//                     </p>
//                   </div>
//                 )}
//               </div>

//               {/* -------- RIGHT : ACTIONS -------- */}
//               <div className="flex flex-col items-end gap-3 min-w-[200px]">

//                 {/* Eye icon */}
//                 <button
//                   onClick={() => setSelectedJob(job.id)}
//                   className="p-2 hover:bg-gray-100 rounded-lg"
//                 >
//                   <Eye />
//                 </button>

//                 {/* Start / Continue */}
//                 {job.status === 'PLANNED' && (
//                   <button
//                     onClick={async () => {
//                       await supabase
//                         .from('cutting_jobs')
//                         .update({ status: 'IN_PROGRESS' })
//                         .eq('id', job.id);

//                       setJobs(prev =>
//                         prev.map(j =>
//                           j.id === job.id ? { ...j, status: 'IN_PROGRESS' } : j
//                         )
//                       );
//                     }}
//                     className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
//                   >
//                     <Play className="w-4 h-4" />
//                     Start Job
//                   </button>
//                 )}

//                 {job.status === 'IN_PROGRESS' && (
//                   <button
//                     onClick={() => {
//                       setSelectedJob(job.id);
//                       setCurrentScreen('cutting-operation');
//                     }}
//                     className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
//                   >
//                     <Play className="w-4 h-4" />
//                     Continue
//                   </button>
//                 )}

//                 {/* Cancel */}
//                 {isSupervisor &&
//                   (job.status === 'PLANNED' || job.status === 'IN_PROGRESS') && (
//                     <button
//                       onClick={() => setCancelJobId(job.id)}
//                       className="bg-red-50 text-red-600 border px-4 py-2 rounded-lg"
//                     >
//                       Cancel Job
//                     </button>
//                   )}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// /* ================= STATUS BADGE ================= */
// function StatusBadge({ status }: { status: string }) {
//   const map: any = {
//     PLANNED: ['Planned', 'bg-gray-100 text-gray-800', Clock],
//     IN_PROGRESS: ['In Progress', 'bg-blue-100 text-blue-800', Play],
//     COMPLETED: ['Completed', 'bg-green-100 text-green-800', CheckCircle],
//     CANCELLED: ['Cancelled', 'bg-red-100 text-red-800', XCircle],
//   };

//   const [label, cls, Icon] = map[status];

//   return (
//     <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${cls}`}>
//       <Icon className="w-3 h-3" />
//       {label}
//     </span>
//   );
// }
// PRAJEETH <IN-PROGRSS> CONTINUE
// import { useState, useEffect, useMemo } from 'react';

// import {
//   Eye,
//   Clock,
//   Play,
//   XCircle,
//   AlertTriangle,
//   ArrowLeft,
//   CheckCircle,
// } from 'lucide-react';

// import { useApp } from '../context/AppContext';
// import { supabase } from '../src/config/supabase';
// import { CuttingJobDetail } from './CuttingJobDetail';
// import { ChevronDown, ChevronUp } from 'lucide-react';


// export function MyJobs() {
//   const { currentUser, setCurrentScreen } = useApp();

//   // Safety guard – DO NOT CHANGE
//   if (!currentUser) {
//     return <div className="p-6">Loading user…</div>;
//   }

//   /* ---------------- STATE (UNCHANGED) ---------------- */
//   const [jobs, setJobs] = useState<any[]>([]);
//   const [filterStatus, setFilterStatus] = useState<
//     'ALL' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
//   >('ALL');

//   const [selectedJob, setSelectedJob] = useState<string | null>(null);
//   const [cancelJobId, setCancelJobId] = useState<string | null>(null);
//   const [cancelReason, setCancelReason] = useState('');

//   /* ---------------- ROLE LOGIC (UNCHANGED) ---------------- */
//   const isOperator = currentUser.role === 'OPERATOR';
//   const isSupervisor = currentUser.role !== 'OPERATOR';

//   /* ---------------- FETCH JOBS (UNCHANGED) ---------------- */
//   useEffect(() => {
//     const fetchJobs = async () => {
//       const { data, error } = await supabase
//         .from('my_jobs_view')
//         .select('*')
//         .order('job_date', { ascending: false });

//       if (error) {
//         console.error('Failed to fetch jobs:', error);
//         return;
//       }

//       setJobs(data || []);
//     };

//     fetchJobs();
//   }, []);

//   /* ---------------- FILTER LOGIC (UNCHANGED) ---------------- */
//   const filteredJobs = useMemo(() => {
//     return jobs.filter(job => {
//       if (isOperator && job.operator_id !== currentUser.id) return false;
//       if (filterStatus !== 'ALL' && job.status !== filterStatus) return false;
//       return true;
//     });
//   }, [jobs, filterStatus, isOperator, currentUser]);

//   /* ---------------- CANCEL HANDLER (UNCHANGED) ---------------- */
//   const handleCancelJob = async () => {
//     if (!cancelReason.trim()) {
//       alert('Please provide a reason for cancellation');
//       return;
//     }

//     try {
//       await supabase
//         .from('cutting_jobs')
//         .update({
//           status: 'CANCELLED',
//           cancel_reason: cancelReason,
//         })
//         .eq('id', cancelJobId);

//       setJobs(prev =>
//         prev.map(j =>
//           j.id === cancelJobId ? { ...j, status: 'CANCELLED' } : j
//         )
//       );

//       setCancelJobId(null);
//       setCancelReason('');
//     } catch (error) {
//       console.error('Cancel job failed:', error);
//       alert('Failed to cancel job');
//     }
//   };

//   /* ---------------- JOB DETAIL VIEW (UNCHANGED) ---------------- */
//   if (selectedJob) {
//     const job = jobs.find(j => j.id === selectedJob);
//     if (job) {
//       return (
//         <CuttingJobDetail
//           job={job}
//           onBack={() => setSelectedJob(null)}
//         />
//       );
//     }
//   }

//   return (
//     <div className="overflow-hidden">

//       {/* ================= CANCEL MODAL (UNCHANGED) ================= */}
//       {cancelJobId && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
//             <h3 className="text-gray-900 mb-2">Cancel Job Order</h3>

//             <textarea
//               value={cancelReason}
//               onChange={e => setCancelReason(e.target.value)}
//               className="w-full px-4 py-3 border rounded-lg"
//               rows={4}
//               placeholder="Provide reason for cancelling this job order..."
//             />

//             <div className="flex gap-3 mt-4">
//               <button
//                 onClick={handleCancelJob}
//                 className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg"
//               >
//                 Confirm Cancellation
//               </button>
//               <button
//                 onClick={() => {
//                   setCancelJobId(null);
//                   setCancelReason('');
//                 }}
//                 className="px-4 py-2 border rounded-lg"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ================= HEADER ================= */}
//       <div className="mb-6">
//         <div className="flex items-center gap-3 mb-4">
//           <button
//             onClick={() => setCurrentScreen('dashboard')}
//             className="p-2 hover:bg-gray-100 rounded-lg"
//           >
//             <ArrowLeft className="w-5 h-5" />
//           </button>

//           <div>
//             <h1 className="text-2xl text-gray-900">
//               {isOperator ? 'My Jobs' : 'All Cutting Jobs'}
//             </h1>
//             <p className="text-sm text-gray-600">
//               {filteredJobs.length} job(s) found
//             </p>
//           </div>
//         </div>

//         {/* FILTER TABS (UNCHANGED) */}
//         <div className="flex gap-2">
//           {['ALL', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(status => (
//             <button
//               key={status}
//               onClick={() => setFilterStatus(status as any)}
//               className={`px-4 py-2 rounded-lg text-sm ${
//                 filterStatus === status
//                   ? status === 'CANCELLED'
//                     ? 'bg-red-600 text-white'
//                     : 'bg-blue-600 text-white'
//                   : 'bg-white border'
//               }`}
//             >
//               {status.replace('_', ' ')}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* ================= JOB LIST ================= */}
//       <div className="space-y-4">
//         {filteredJobs.map(job => (
//           <div key={job.id} className="bg-white rounded-lg shadow p-6">

//             {/* ===== CARD LAYOUT (ALIGNMENT ONLY) ===== */}
//             <div className="flex justify-between gap-6">

//               {/* -------- LEFT : JOB INFO -------- */}
//               <div className="flex-1">
//                 <h2 className="text-xl text-gray-900">{job.job_order_no}</h2>
//                 <StatusBadge status={job.status} />

//                 <p className="text-sm text-gray-600 mt-2">
//                   {job.material_code} • {job.machine_name}
//                 </p>

//                 <p className="text-sm text-gray-00 mt-2">
//                   Operator:{' '}
//                   <span className="text-sm text-gray-600 mt-1">
//                     {job.operator_name || '-'}
//                   </span>
//                 </p>

//                 {/* MASTER JOB DETAILS – SHOWN FOR ALL STATES */}
//                 <p className="text-sm text-gray-00 mt-2">
//   Supervisor:{' '}
//   <span className="text-sm text-gray-600 mt-1">
//     {job.supervisor_name || '-'}
//   </span>
// </p>

// <p className="text-sm text-gray-00 mt-2">
//   Planned Qty:{' '}
//   <span className="text-sm text-gray-600 mt-1">
//     {job.planned_output_qty ?? '-'} pcs
//   </span>
// </p>

// <p className="text-sm text-gray-00 mt-2">
//   Master Serial No:{' '}
//   <span className="text-sm text-gray-600 mt-1">
//     {job.fg_code || '-'}
//   </span>
// </p>

//               </div>

//               {/* -------- RIGHT : ACTIONS -------- */}
//               <div className="flex flex-col items-end gap-3 min-w-[200px]">

//                 {/* Eye icon */}
//                 <button
//                   onClick={() => setSelectedJob(job.id)}
//                   className="p-2 hover:bg-gray-100 rounded-lg"
//                 >
//                   <Eye />
//                 </button>

//                 {/* Start Job – PLANNED */}
                

// {/* Start Job – only when PLANNED */}
// {job.status === 'PLANNED' && (
//   <button
//     onClick={async () => {
//       await supabase
//         .from('cutting_jobs')
//         .update({ status: 'IN_PROGRESS' })
//         .eq('id', job.id);

//       setJobs(prev =>
//         prev.map(j =>
//           j.id === job.id ? { ...j, status: 'IN_PROGRESS' } : j
//         )
//       );
//     }}
//     className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
//   >
//     <Play className="w-4 h-4" />
//     Start Job
//   </button>
// )}

// {/* Continue Job – only when IN_PROGRESS */}
// {job.status === 'IN_PROGRESS' && (
//   <button
//     onClick={() => {
//       setSelectedJob(job.id);
//       setCurrentScreen('cutting-operation');
//     }}
//     className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
//   >
//     <Play className="w-4 h-4" />
//     Continue Job
//   </button>
// )}


// {/* Continue Job – IN_PROGRESS */}
// {/* {job.status === 'IN_PROGRESS' && ( prajeeth
//   <button
//     onClick={() => {
//       setSelectedJob(job.id);
//       setCurrentScreen('cutting-operation');
//     }}
//     className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
//   >
//     <Play className="w-4 h-4" />
//     Continue Job
//   </button>
// )} */}
// {/* {job.status?.toUpperCase().replace(' ', '_') === 'IN_PROGRESS' && (
//   <button
//     onClick={() => {
//       setSelectedJob(job.id);
//       setCurrentScreen('cutting-operation');
//     }}
//     className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
//   >
//     <Play className="w-4 h-4" />
//     Continue Job
//   </button>
// )}
//  */}


                
//                 {/* Cancel */}
//                 {isSupervisor &&
//                   (job.status === 'PLANNED' || job.status === 'IN_PROGRESS') && (
//                     <button
//                       onClick={() => setCancelJobId(job.id)}
//                       className="bg-red-50 text-red-600 border px-4 py-2 rounded-lg"
//                     >
//                       Cancel Job
//                     </button>
//                   )}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// /* ================= STATUS BADGE ================= */
// function StatusBadge({ status }: { status: string }) {
//   const map: any = {
//     PLANNED: ['Planned', 'bg-gray-100 text-gray-800', Clock],
//     IN_PROGRESS: ['In Progress', 'bg-blue-100 text-blue-800', Play],
//     COMPLETED: ['Completed', 'bg-green-100 text-green-800', CheckCircle],
//     CANCELLED: ['Cancelled', 'bg-red-100 text-red-800', XCircle],
//   };

//   const [label, cls, Icon] = map[status];
  

//   return (
//     <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${cls}`}>
//       <Icon className="w-3 h-3" />
//       {label}
//     </span>
//   );
// }


// dropdown expand collapse job details
  // import { useState, useEffect, useMemo } from 'react';
  // import {
  //   Eye,
  //   Clock,
  //   Play,
  //   XCircle,
  //   ArrowLeft,
  //   CheckCircle,
  //   ChevronDown,
  //   ChevronUp,
  // } from 'lucide-react';

  // import { useApp } from '../context/AppContext';
  // import { supabase } from '../src/config/supabase';
  // import { CuttingJobDetail } from './CuttingJobDetail';

  // export function MyJobs() {
  //   const { currentUser, setCurrentScreen } = useApp();

  //   if (!currentUser) {
  //     return <div className="p-6">Loading user…</div>;
  //   }

  //   const [jobs, setJobs] = useState<any[]>([]);
  //   const [filterStatus, setFilterStatus] = useState<
  //     'ALL' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  //   >('ALL');

  //   const [selectedJob, setSelectedJob] = useState<string | null>(null);
  //   const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  //   const isOperator = currentUser.role === 'OPERATOR';
  //   const isSupervisor = currentUser.role !== 'OPERATOR';

  //   /* ================= FETCH JOBS ================= */
  //   useEffect(() => {
  //     const fetchJobs = async () => {
  //       const { data } = await supabase
  //         .from('my_jobs_view')
  //         .select('*')
  //         .order('job_date', { ascending: false });

  //       setJobs(data || []);
  //     };

  //     fetchJobs();
  //   }, []);

  //   /* ================= FILTER ================= */
  //   const filteredJobs = useMemo(() => {
  //     return jobs.filter(job => {
  //       if (isOperator && job.operator_id !== currentUser.id) return false;
  //       if (filterStatus !== 'ALL' && job.status !== filterStatus) return false;
  //       return true;
  //     });
  //   }, [jobs, filterStatus, isOperator, currentUser]);

  //   /* ================= DETAIL VIEW ================= */
  //   if (selectedJob) {
  //     const job = jobs.find(j => j.id === selectedJob);
  //     if (job) {
  //       return <CuttingJobDetail job={job} onBack={() => setSelectedJob(null)} />;
  //     }
  //   }

  //   return (
  //     <div className="overflow-hidden">
  //       {/* HEADER */}
  //       <div className="mb-6">
  //         <div className="flex items-center gap-3 mb-4">
  //           <button
  //             onClick={() => setCurrentScreen('dashboard')}
  //             className="p-2 hover:bg-gray-100 rounded-lg"
  //           >
  //             <ArrowLeft className="w-5 h-5" />
  //           </button>

  //           <div>
  //             <h1 className="text-2xl text-gray-900">
  //               {isOperator ? 'My Jobs' : 'All Cutting Jobs'}
  //             </h1>
  //             <p className="text-sm text-gray-600">
  //               {filteredJobs.length} job(s) found
  //             </p>
  //           </div>
  //         </div>

  //         <div className="flex gap-2">
  //           {['ALL', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(s => (
  //             <button
  //               key={s}
  //               onClick={() => setFilterStatus(s as any)}
  //               className={`px-4 py-2 rounded-lg text-sm ${
  //                 filterStatus === s
  //                   ? s === 'CANCELLED'
  //                     ? 'bg-red-600 text-white'
  //                     : 'bg-blue-600 text-white'
  //                   : 'bg-white border'
  //               }`}
  //             >
  //               {s.replace('_', ' ')}
  //             </button>
  //           ))}
  //         </div>
  //       </div>

  //       {/* JOB LIST */}
  //       <div className="space-y-4">
  //         {filteredJobs.map(job => {
  //           const isExpanded = expandedJobId === job.id;

  //           return (
  //             <div key={job.id} className="bg-white rounded-lg shadow p-6">
  //               {/* MAIN ROW */}
  //               <div className="flex justify-between gap-6">
  //                 {/* LEFT */}
  //                 <div className="flex-1">
  //                   <h2 className="text-xl text-gray-900">{job.job_order_no}</h2>
  //                   <StatusBadge status={job.status} />

  //                   <p className="text-sm text-gray-600 mt-2">
  //                     {job.material_code} • {job.machine_name}
  //                   </p>

  //                   <p className="text-sm mt-2">
  //                     Operator:{' '}
  //                     <span className="text-gray-600">
  //                       {job.operator_name || '-'}
  //                     </span>
  //                   </p>

  //                   <p className="text-sm mt-2">
  //                     Supervisor:{' '}
  //                     <span className="text-gray-600">
  //                       {job.supervisor_name || '-'}
  //                     </span>
  //                   </p>

  //                   <p className="text-sm mt-2">
  //                     Planned Qty:{' '}
  //                     <span className="text-gray-600">
  //                       {job.planned_output_qty} pcs
  //                     </span>
  //                   </p>

  //                   <p className="text-sm mt-2">
  //                     Master Serial No:{' '}
  //                     <span className="text-gray-600">
  //                       {job.fg_code || '-'}
  //                     </span>
  //                   </p>

  //                   {/* EXPANDED CONTENT */}
  //                   {isExpanded && (
  //                     <div className="mt-4 border-t pt-4 text-sm text-gray-700 space-y-2">
  //                       <p>Job Date: {job.job_date}</p>
  //                       <p>Shift: {job.shift}</p>
  //                       <p>RM Batch No: {job.rm_batch_no}</p>
  //                       <p>Remarks: {job.remarks || '-'}</p>
  //                     </div>
  //                   )}
  //                 </div>

  //                 {/* RIGHT ACTIONS */}
  //                 <div className="flex flex-col items-end gap-3 min-w-[200px]">
  //                   <button
  //                     onClick={() => setSelectedJob(job.id)}
  //                     className="p-2 hover:bg-gray-100 rounded-lg"
  //                   >
  //                     <Eye />
  //                   </button>

  //                   {job.status === 'PLANNED' && (
  //                     <button
  //                       onClick={async () => {
  //                         await supabase
  //                           .from('cutting_jobs')
  //                           .update({ status: 'IN_PROGRESS' })
  //                           .eq('id', job.id);

  //                         setJobs(prev =>
  //                           prev.map(j =>
  //                             j.id === job.id
  //                               ? { ...j, status: 'IN_PROGRESS' }
  //                               : j
  //                           )
  //                         );
  //                       }}
  //                       className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
  //                     >
  //                       <Play className="w-4 h-4" />
  //                       Start Job
  //                     </button>
  //                   )}

  //                   {job.status === 'IN_PROGRESS' && (
  //                     <button
  //                       onClick={() => setSelectedJob(job.id)}
  //                       className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
  //                     >
  //                       <Play className="w-4 h-4" />
  //                       Continue Job
  //                     </button>
  //                   )}

  //                   {isSupervisor &&
  //                     (job.status === 'PLANNED' ||
  //                       job.status === 'IN_PROGRESS') && (
  //                       <button className="bg-red-50 text-red-600 border px-4 py-2 rounded-lg">
  //                         Cancel Job
  //                       </button>
  //                     )}
  //                 </div>
  //               </div>

  //               {/* FOOTER EXPAND BUTTON (CORRECT POSITION) */}
  //               <div className="mt-4 flex justify-center">
  //                 <button
  //                   onClick={() =>
  //                     setExpandedJobId(isExpanded ? null : job.id)
  //                   }
  //                   className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full"
  //                 >
  //                   {isExpanded ? <ChevronUp /> : <ChevronDown />}
  //                 </button>
  //               </div>
  //             </div>
  //           );
  //         })}
  //       </div>
  //     </div>
  //   );
  // }

  // /* STATUS BADGE */
  // function StatusBadge({ status }: { status: string }) {
  //   const map: any = {
  //     PLANNED: ['Planned', 'bg-gray-100 text-gray-800', Clock],
  //     IN_PROGRESS: ['In Progress', 'bg-blue-100 text-blue-800', Play],
  //     COMPLETED: ['Completed', 'bg-green-100 text-green-800', CheckCircle],
  //     CANCELLED: ['Cancelled', 'bg-red-100 text-red-800', XCircle],
  //   };

  //   const [label, cls, Icon] = map[status];

  //   return (
  //     <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${cls}`}>
  //       <Icon className="w-3 h-3" />
  //       {label}
  //     </span>
  //   );
  // }
/* ---------------- ROLE LOGIC (UNCHANGED) ---------------- */
// import { RotateCcw } from 'lucide-react';

// import { useState, useEffect, useMemo } from 'react';
// import {
//   Eye,
//   Clock,
//   Play,
//   XCircle,
//   ArrowLeft,
//   CheckCircle,
//   ChevronDown,
//   ChevronUp,
// } from 'lucide-react';

// import { useApp } from '../context/AppContext';
// import { supabase } from '../src/config/supabase';
// import { CuttingJobDetail } from './CuttingJobDetail';

// export function MyJobs() {
//   const { currentUser, setCurrentScreen } = useApp();

//   if (!currentUser) {
//     return <div className="p-6">Loading user…</div>;
//   }

//   /* ---------------- STATE ---------------- */
//   const [jobs, setJobs] = useState<any[]>([]);
//   const [filterStatus, setFilterStatus] = useState<
//     'ALL' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
//   >('ALL');

//   const [selectedJob, setSelectedJob] = useState<string | null>(null);
//   const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

//   // CANCEL STATE
//   const [cancelJobId, setCancelJobId] = useState<string | null>(null);
//   const [cancelReason, setCancelReason] = useState('');

//   const isOperator = currentUser.role === 'OPERATOR';
//   const isSupervisor = currentUser.role !== 'OPERATOR';

//   /* ---------------- FETCH ---------------- */
//   useEffect(() => {
//     const fetchJobs = async () => {
//       const { data } = await supabase
//         .from('my_jobs_view')
//         .select('*')
//         .order('job_date', { ascending: false });

//       setJobs(data || []);
//     };

//     fetchJobs();
//   }, []);

//   /* ---------------- FILTER ---------------- */
//   const filteredJobs = useMemo(() => {
//     return jobs.filter(job => {
//       if (isOperator && job.operator_id !== currentUser.id) return false;
//       if (filterStatus !== 'ALL' && job.status !== filterStatus) return false;
//       return true;
//     });
//   }, [jobs, filterStatus, isOperator, currentUser]);

//   /* ---------------- CANCEL HANDLER ---------------- */
//   const handleCancelJob = async () => {
//     if (!cancelReason.trim()) {
//       alert('Please provide a reason');
//       return;
//     }

//     await supabase
//       .from('cutting_jobs')
//       .update({
//         status: 'CANCELLED',
//         cancel_reason: cancelReason,
//       })
//       .eq('id', cancelJobId);

//     setJobs(prev =>
//       prev.map(j =>
//         j.id === cancelJobId ? { ...j, status: 'CANCELLED' } : j
//       )
//     );

//     setCancelJobId(null);
//     setCancelReason('');
//   };

//   /* ---------------- DETAIL VIEW ---------------- */
//   if (selectedJob) {
//     const job = jobs.find(j => j.id === selectedJob);
//     if (job) {
//       return <CuttingJobDetail job={job} onBack={() => setSelectedJob(null)} />;
//     }
//   }

//   return (
//     <div className="overflow-hidden">

//       {/* ================= CANCEL MODAL ================= */}
//       {cancelJobId && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md">
//             <h3 className="text-lg mb-3">Cancel Job</h3>

//             <textarea
//               value={cancelReason}
//               onChange={e => setCancelReason(e.target.value)}
//               className="w-full border rounded-lg p-3"
//               rows={4}
//               placeholder="Reason for cancellation"
//             />

//             <div className="flex gap-3 mt-4">
//               <button
//                 onClick={handleCancelJob}
//                 className="flex-1 bg-red-600 text-white py-2 rounded-lg"
//               >
//                 Confirm
//               </button>
//               <button
//                 onClick={() => {
//                   setCancelJobId(null);
//                   setCancelReason('');
//                 }}
//                 className="flex-1 border py-2 rounded-lg"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ================= HEADER ================= */}
//       <div className="mb-6">
//         <div className="flex items-center gap-3 mb-4">
//           <button
//             onClick={() => setCurrentScreen('dashboard')}
//             className="p-2 hover:bg-gray-100 rounded-lg"
//           >
//             <ArrowLeft className="w-5 h-5" />
//           </button>

//           <div>
//             <h1 className="text-2xl text-gray-900">
//               {isOperator ? 'My Jobs' : 'All Cutting Jobs'}
//             </h1>
//             <p className="text-sm text-gray-600">
//               {filteredJobs.length} job(s) found
//             </p>
//           </div>
//         </div>

//         <div className="flex gap-2">
//           {['ALL', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(s => (
//             <button
//               key={s}
//               onClick={() => setFilterStatus(s as any)}
//               className={`px-4 py-2 rounded-lg text-sm ${
//                 filterStatus === s
//                   ? s === 'CANCELLED'
//                     ? 'bg-red-600 text-white'
//                     : 'bg-blue-600 text-white'
//                   : 'bg-white border'
//               }`}
//             >
//               {s.replace('_', ' ')}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* ================= JOB LIST ================= */}
//       <div className="space-y-4">
//         {filteredJobs.map(job => {
//           const isExpanded = expandedJobId === job.id;

//           return (
//             <div key={job.id} className="bg-white rounded-lg shadow p-6">
//               <div className="flex justify-between gap-6">
//                 {/* LEFT */}
//                 <div className="flex-1">
//                   <h2 className="text-xl text-gray-900">{job.job_order_no}</h2>
//                   <StatusBadge status={job.status} />

//                   <p className="text-sm text-gray-600 mt-2">
//                     {job.material_code} • {job.machine_name}
//                   </p>

//                   <p className="text-sm mt-2">
//                     Operator:{' '}
//                     <span className="text-gray-600">
//                       {job.operator_name || '-'}
//                     </span>
//                   </p>

//                   <p className="text-sm mt-2">
//                     Supervisor:{' '}
//                     <span className="text-gray-600">
//                       {job.supervisor_name || '-'}
//                     </span>
//                   </p>

//                   <p className="text-sm mt-2">
//                     Planned Qty:{' '}
//                     <span className="text-gray-600">
//                       {job.planned_output_qty} pcs
//                     </span>
//                   </p>

//                   <p className="text-sm mt-2">
//                     Master Serial No:{' '}
//                     <span className="text-gray-600">
//                       {job.fg_code || '-'}
//                     </span>
//                   </p>

//                   {isExpanded && (
//                     <div className="mt-4 border-t pt-4 text-sm text-gray-700 space-y-2">
//                       <p>Job Date: {job.job_date}</p>
//                       <p>Shift: {job.shift}</p>
//                       <p>RM Batch No: {job.rm_batch_no}</p>
//                       <p>Remarks: {job.remarks || '-'}</p>
//                     </div>
//                   )}
//                 </div>

//                 {/* RIGHT ACTIONS */}
//                 <div className="flex flex-col items-end gap-3 min-w-[200px]">

//                   {/* 👁 Eye ONLY for IN_PROGRESS */}
//                  {job.status === 'IN_PROGRESS' && (
//   <button
//     onClick={() => setSelectedJob(job.id)}
//     className="
//       bg-indigo-50 text-indigo-700
//       border border-indigo-200
//       px-4 py-2 rounded-lg
//       flex items-center gap-2
//       hover:bg-indigo-100
//       transition-colors
//     "
//   >
   
//   </button>
// )}



//                   {job.status === 'PLANNED' && (
//                     <button
//                       onClick={async () => {
//                         await supabase
//                           .from('cutting_jobs')
//                           .update({ status: 'IN_PROGRESS' })
//                           .eq('id', job.id);

//                         setJobs(prev =>
//                           prev.map(j =>
//                             j.id === job.id
//                               ? { ...j, status: 'IN_PROGRESS' }
//                               : j
//                           )
//                         );
//                       }}
//                       className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
//                     >
//                       <Play className="w-4 h-4" />
//                       Start Job
//                     </button>
//                   )}

//                   {job.status === 'IN_PROGRESS' && (
//   <button
//     onClick={() => setSelectedJob(job.id)}
//     className="
//       bg-indigo-50 text-indigo-700
//       border border-indigo-200
//       px-4 py-2 rounded-lg
//       flex items-center gap-2
//       hover:bg-indigo-100
//       transition-colors
//     "
//   >
//     <RotateCcw className="w-4 h-4" />
//     Continue
//   </button>
// )}



//                   {isSupervisor &&
//                     (job.status === 'PLANNED' ||
//                       job.status === 'IN_PROGRESS') && (
//                       <button
//                         onClick={() => setCancelJobId(job.id)}
//                         className="bg-red-50 text-red-600 border px-4 py-2 rounded-lg"
//                       >
//                         Cancel Job
//                       </button>
//                     )}
//                 </div>
//               </div>

//               {/* EXPAND BUTTON */}
//               <div className="mt-4 flex justify-center">
//                 <button
//                   onClick={() =>
//                     setExpandedJobId(isExpanded ? null : job.id)
//                   }
//                   className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full"
//                 >
//                   {isExpanded ? <ChevronUp /> : <ChevronDown />}
//                 </button>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// /* ================= STATUS BADGE ================= */
// function StatusBadge({ status }: { status: string }) {
//   const map: any = {
//     PLANNED: ['Planned', 'bg-gray-100 text-gray-800', Clock],
//     IN_PROGRESS: ['In Progress', 'bg-blue-100 text-blue-800', Play],
//     COMPLETED: ['Completed', 'bg-green-100 text-green-800', CheckCircle],
//     CANCELLED: ['Cancelled', 'bg-red-100 text-red-800', XCircle],
//   };

//   const [label, cls, Icon] = map[status];

//   return (
//     <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${cls}`}>
//       <Icon className="w-3 h-3" />
//       {label}
//     </span>
//   );
// }
// import { RotateCcw } from 'lucide-react';

// import { useState, useEffect, useMemo } from 'react';
// import {
//   Eye,
//   Clock,
//   Play,
//   XCircle,
//   ArrowLeft,
//   CheckCircle,
//   ChevronDown,
//   ChevronUp,
// } from 'lucide-react';

// import { useApp } from '../context/AppContext';
// import { supabase } from '../src/config/supabase';
// import { CuttingJobDetail } from './CuttingJobDetail';

// export function MyJobs() {
//   const { currentUser, setCurrentScreen } = useApp();

//   if (!currentUser) {
//     return <div className="p-6">Loading user…</div>;
//   }

//   /* ---------------- STATE ---------------- */
//   const [jobs, setJobs] = useState<any[]>([]);
//   const [filterStatus, setFilterStatus] = useState<
//     'ALL' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
//   >('ALL');

//   const [selectedJob, setSelectedJob] = useState<string | null>(null);
//   const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

//   // CANCEL STATE
//   const [cancelJobId, setCancelJobId] = useState<string | null>(null);
//   const [cancelReason, setCancelReason] = useState('');

//   const isOperator = currentUser.role === 'OPERATOR';
//   const isSupervisor = currentUser.role !== 'OPERATOR';

//   /* ---------------- FETCH ---------------- */
//   useEffect(() => {
//     const fetchJobs = async () => {
//       const { data } = await supabase
//         .from('my_jobs_view')
//         .select('*')
//         .order('job_date', { ascending: false });

//       setJobs(data || []);
//     };

//     fetchJobs();
//   }, []);

//   /* ---------------- FILTER ---------------- */
//   const filteredJobs = useMemo(() => {
//     return jobs.filter(job => {
//       if (isOperator && job.operator_id !== currentUser.id) return false;
//       if (filterStatus !== 'ALL' && job.status !== filterStatus) return false;
//       return true;
//     });
//   }, [jobs, filterStatus, isOperator, currentUser]);

//   /* ---------------- CANCEL HANDLER ---------------- */
//   const handleCancelJob = async () => {
//     if (!cancelReason.trim()) {
//       alert('Please provide a reason');
//       return;
//     }

//     await supabase
//       .from('cutting_jobs')
//       .update({
//         status: 'CANCELLED',
//         cancel_reason: cancelReason,
//       })
//       .eq('id', cancelJobId);

//     setJobs(prev =>
//       prev.map(j =>
//         j.id === cancelJobId ? { ...j, status: 'CANCELLED' } : j
//       )
//     );

//     setCancelJobId(null);
//     setCancelReason('');
//   };

//   /* ---------------- DETAIL VIEW ---------------- */
//   if (selectedJob) {
//     const job = jobs.find(j => j.id === selectedJob);
//     if (job) {
//       return <CuttingJobDetail job={job} onBack={() => setSelectedJob(null)} />;
//     }
//   }

//   return (
//     <div className="overflow-hidden">

//       {/* ================= CANCEL MODAL ================= */}
//      {cancelJobId && (
//   <div
//     className="
//       fixed inset-0 z-50
//       flex items-center justify-center
//       bg-gray-900/60
//       backdrop-blur-sm
//       transition-opacity
//     "
//   >
//     <div
//       className="
//         bg-white rounded-2xl
//         w-full max-w-md
//         p-6
//         shadow-2xl
//         animate-[modalIn_0.2s_ease-out]
//       "
//     >
//       <h3 className="text-lg font-semibold text-gray-900 mb-3">
//         Cancel Job
//       </h3>

//       <textarea
//         value={cancelReason}
//         onChange={e => setCancelReason(e.target.value)}
//         className="
//           w-full border border-gray-300
//           rounded-xl p-3
//           focus:outline-none focus:ring-2 focus:ring-red-500
//         "
//         rows={4}
//         placeholder="Reason for cancellation"
//       />

//       <div className="flex gap-3 mt-5">
//         <button
//           onClick={handleCancelJob}
//           className="
//             flex-1 bg-red-600 text-white
//             py-2.5 rounded-xl
//             hover:bg-red-700
//             transition-colors
//           "
//         >
//           Confirm
//         </button>

//         <button
//           onClick={() => {
//             setCancelJobId(null);
//             setCancelReason('');
//           }}
//           className="
//             flex-1 border border-gray-300
//             py-2.5 rounded-xl
//             hover:bg-gray-50
//             transition-colors
//           "
//         >
//           Close
//         </button>
//       </div>
//     </div>
//   </div>
// )}

//       {/* ================= HEADER ================= */}
//       <div className="mb-6">
//         <div className="flex items-center gap-3 mb-4">
//           <button
//             onClick={() => setCurrentScreen('dashboard')}
//             className="p-2 hover:bg-gray-100 rounded-lg"
//           >
//             <ArrowLeft className="w-5 h-5" />
//           </button>

//           <div>
//             <h1 className="text-2xl text-gray-900">
//               {isOperator ? 'My Jobs' : 'All Cutting Jobs'}
//             </h1>
//             <p className="text-sm text-gray-600">
//               {filteredJobs.length} job(s) found
//             </p>
//           </div>
//         </div>

//         <div className="flex gap-2">
//           {['ALL', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(s => (
//             <button
//               key={s}
//               onClick={() => setFilterStatus(s as any)}
//               className={`px-4 py-2 rounded-lg text-sm ${
//                 filterStatus === s
//                   ? s === 'CANCELLED'
//                     ? 'bg-red-600 text-white'
//                     : 'bg-blue-600 text-white'
//                   : 'bg-white border'
//               }`}
//             >
//               {s.replace('_', ' ')}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* ================= JOB LIST ================= */}
//       <div className="space-y-4">
//         {filteredJobs.map(job => {
//           const isExpanded = expandedJobId === job.id;

//           return (
//             <div key={job.id} className="bg-white rounded-lg shadow p-6">
//               <div className="flex justify-between gap-6">
//                 {/* LEFT */}
//                 <div className="flex-1">
//                   <h2 className="text-xl text-gray-900">{job.job_order_no}</h2>
//                   <StatusBadge status={job.status} />

//                   <p className="text-sm text-gray-600 mt-2">
//                     {job.material_code} • {job.machine_name}
//                   </p>

//                   <p className="text-sm mt-2">
//                     Operator:{' '}
//                     <span className="text-gray-600">
//                       {job.operator_name || '-'}
//                     </span>
//                   </p>

//                   <p className="text-sm mt-2">
//                     Supervisor:{' '}
//                     <span className="text-gray-600">
//                       {job.supervisor_name || '-'}
//                     </span>
//                   </p>

//                   <p className="text-sm mt-2">
//                     Planned Qty:{' '}
//                     <span className="text-gray-600">
//                       {job.planned_output_qty} pcs
//                     </span>
//                   </p>

//                   <p className="text-sm mt-2">
//                     Master Serial No:{' '}
//                     <span className="text-gray-600">
//                       {job.fg_code || '-'}
//                     </span>
//                   </p>

//                   {isExpanded && (
//                     <div className="mt-4 border-t pt-4 text-sm text-gray-700 space-y-2">
//                       <p>Job Date: {job.job_date}</p>
//                       <p>Shift: {job.shift}</p>
//                       <p>RM Batch No: {job.rm_batch_no}</p>
//                       <p>Remarks: {job.remarks || '-'}</p>
//                     </div>
//                   )}
//                 </div>

//                 {/* RIGHT ACTIONS */}
//                 <div className="flex flex-col items-end gap-3 min-w-[200px]">

//                   {/* 👁 Eye ONLY for IN_PROGRESS */}
//                  {job.status === 'IN_PROGRESS' && (
//   <button
//     onClick={() => setSelectedJob(job.id)}
//     className="
//       bg-indigo-50 text-indigo-700
//       border border-indigo-200
//       px-4 py-2 rounded-lg
//       flex items-center gap-2
//       hover:bg-indigo-100
//       transition-colors
//     "
//   >
   
//   </button>
// )}



//                   {job.status === 'PLANNED' && (
//                     <button
//                       onClick={async () => {
//                         await supabase
//                           .from('cutting_jobs')
//                           .update({ status: 'IN_PROGRESS' })
//                           .eq('id', job.id);

//                         setJobs(prev =>
//                           prev.map(j =>
//                             j.id === job.id
//                               ? { ...j, status: 'IN_PROGRESS' }
//                               : j
//                           )
//                         );
//                       }}
//                       className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
//                     >
//                       <Play className="w-4 h-4" />
//                       Start Job
//                     </button>
//                   )}

//                   {job.status === 'IN_PROGRESS' && (
// //   <button
// //     onClick={() => setSelectedJob(job.id)}
// //     className="
// //       bg-indigo-50 text-indigo-700
// //       border border-indigo-200
// //       px-4 py-2 rounded-lg
// //       flex items-center gap-2
// //       hover:bg-indigo-100
// //       transition-colors
// //     "
// //   >
// //     <RotateCcw className="w-4 h-4" />
// //     Continue
// //   </button>
// // )}
// <button
//   onClick={() => setSelectedJob(job.id)}
//   className="
//     bg-blue-600 text-white
//     px-4 py-2 rounded-lg
//     flex items-center gap-2
//     hover:bg-blue-700
//     transition-colors
//     shadow-sm
//   "
// >
//   <RotateCcw className="w-4 h-4" />
//   Continue
// </button>
//                   )}


//                   {isSupervisor &&
//                     (job.status === 'PLANNED' ||
//                       job.status === 'IN_PROGRESS') && (
//                       <button
//                         onClick={() => setCancelJobId(job.id)}
//                         className="bg-red-50 text-red-600 border px-4 py-2 rounded-lg"
//                       >
//                         Cancel Job
//                       </button>
//                     )}
//                 </div>
//               </div>

//               {/* EXPAND BUTTON */}
//               <div className="mt-4 flex justify-center">
//                 <button
//                   onClick={() =>
//                     setExpandedJobId(isExpanded ? null : job.id)
//                   }
//                   className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full"
//                 >
//                   {isExpanded ? <ChevronUp /> : <ChevronDown />}
//                 </button>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// /* ================= STATUS BADGE ================= */
// function StatusBadge({ status }: { status: string }) {
//   const map: any = {
//     PLANNED: ['Planned', 'bg-gray-100 text-gray-800', Clock],
//     IN_PROGRESS: ['In Progress', 'bg-blue-100 text-blue-800', Play],
//     COMPLETED: ['Completed', 'bg-green-100 text-green-800', CheckCircle],
//     CANCELLED: ['Cancelled', 'bg-red-100 text-red-800', XCircle],
//   };

//   const [label, cls, Icon] = map[status];

//   return (
//     <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${cls}`}>
//       <Icon className="w-3 h-3" />
//       {label}
//     </span>
//   );
// }
import { RotateCcw } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import {
  Eye,
  Clock,
  Play,
  XCircle,
  ArrowLeft,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import { useApp } from '../context/AppContext';
import { supabase } from '../src/config/supabase';
import { CuttingJobDetail } from './CuttingJobDetail';

export function MyJobs() {
  const { currentUser, setCurrentScreen } = useApp();

  if (!currentUser) {
    return <div className="p-6">Loading user…</div>;
  }

  /* ---------------- STATE ---------------- */
  const [jobs, setJobs] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<
    'ALL' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  >('ALL');

  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  // CANCEL STATE
  const [cancelJobId, setCancelJobId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const isOperator = currentUser.role === 'OPERATOR';
  const isSupervisor = currentUser.role !== 'OPERATOR';

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    const fetchJobs = async () => {
      const { data } = await supabase
        .from('my_jobs_view')
        .select('*')
        .order('job_date', { ascending: false });

      setJobs(data || []);
    };

    fetchJobs();
  }, []);

  /* ---------------- FILTER ---------------- */
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      if (isOperator && job.operator_id !== currentUser.id) return false;
      if (filterStatus !== 'ALL' && job.status !== filterStatus) return false;
      return true;
    });
  }, [jobs, filterStatus, isOperator, currentUser]);

  /* ---------------- CANCEL HANDLER ---------------- */
  const handleCancelJob = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("User not logged in");
      return;
    }

    if (!cancelReason.trim()) {
      alert('Please provide a reason');
      return;
    }

    const { error } = await supabase
      .from('cutting_jobs')
      .update({
        status: 'CANCELLED',
        cancel_reason: cancelReason,
        cancelled_at: new Date().toISOString(),
        cancelled_by: user.id
      })
      .eq('id', cancelJobId);

    if (error) {
      console.error("Cancel failed:", error);
      alert("Failed to cancel job");
      return;
    }
    setJobs(prev =>
      prev.map(j =>
        j.id === cancelJobId ? { ...j, status: 'CANCELLED' } : j
      )
    );


    setCancelJobId(null);
    setCancelReason('');
  };


  /* ---------------- DETAIL VIEW ---------------- */
  if (selectedJob) {
    const job = jobs.find(j => j.id === selectedJob);
    if (job) {
      return <CuttingJobDetail job={job} onBack={() => setSelectedJob(null)} />;
    }
  }

  return (
    <div className="overflow-hidden">

      {/* ================= CANCEL MODAL ================= */}
     {cancelJobId && (
  <div
    className="
      fixed inset-0 z-50
      flex items-center justify-center
      bg-gray-900/60
      backdrop-blur-sm
      transition-opacity
    "
  >
    <div
      className="
        bg-white rounded-2xl
        w-full max-w-md
        p-6
        shadow-2xl
        animate-[modalIn_0.2s_ease-out]
      "
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        Cancel Job
      </h3>

      <textarea
        value={cancelReason}
        onChange={e => setCancelReason(e.target.value)}
        className="
          w-full border border-gray-300
          rounded-xl p-3
          focus:outline-none focus:ring-2 focus:ring-red-500
        "
        rows={4}
        placeholder="Reason for cancellation"
      />

      <div className="flex gap-3 mt-5">
        <button
          onClick={handleCancelJob}
          className="
            flex-1 bg-red-600 text-white
            py-2.5 rounded-xl
            hover:bg-red-700
            transition-colors
          "
        >
          Confirm
        </button>

        <button
          onClick={() => {
            setCancelJobId(null);
            setCancelReason('');
          }}
          className="
            flex-1 border border-gray-300
            py-2.5 rounded-xl
            hover:bg-gray-50
            transition-colors
          "
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

      {/* ================= HEADER ================= */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-2xl text-gray-900">
              {isOperator ? 'My Jobs' : 'All Cutting Jobs'}
            </h1>
            <p className="text-sm text-gray-600">
              {filteredJobs.length} job(s) found
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {['ALL', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s as any)}
              className={`px-4 py-2 rounded-lg text-sm ${
                filterStatus === s
                  ? s === 'CANCELLED'
                    ? 'bg-red-600 text-white'
                    : 'bg-blue-600 text-white'
                  : 'bg-white border'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* ================= JOB LIST ================= */}
      <div className="space-y-4">
        {filteredJobs.map(job => {
          const isExpanded = expandedJobId === job.id;

          return (
            <div key={job.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between gap-6">
                {/* LEFT */}
                <div className="flex-1">
                  <h2 className="text-xl text-gray-900">{job.job_order_no}</h2>
                  <StatusBadge status={job.status} />

                  <p className="text-sm text-gray-600 mt-2">
                    {job.material_code} • {job.machine_name}
                  </p>

                  <p className="text-sm mt-2">
                    Operator:{' '}
                    <span className="text-gray-600">
                      {job.operator_name || '-'}
                    </span>
                  </p>

                  <p className="text-sm mt-2">
                    Supervisor:{' '}
                    <span className="text-gray-600">
                      {job.supervisor_name || '-'}
                    </span>
                  </p>

                  <p className="text-sm mt-2">
                    Planned Qty:{' '}
                    <span className="text-gray-600">
                      {job.planned_output_qty} pcs
                    </span>
                  </p>

                  <p className="text-sm mt-2">
                    Master Serial No:{' '}
                    <span className="text-gray-600">
                      {job.fg_code || '-'}
                    </span>
                  </p>

                  {isExpanded && (
                    <div className="mt-4 border-t pt-4 text-sm text-gray-700 space-y-2">
                      <p>Job Date: {job.job_date}</p>
                      <p>Shift: {job.shift}</p>
                      <p>RM Batch No: {job.rm_batch_no}</p>
                      <p>Remarks: {job.notes || '-'}</p>
                    </div>
                  )}
                </div>

                {/* RIGHT ACTIONS */}
                <div className="flex flex-col items-end gap-3 min-w-[200px]">

         



                  {job.status === 'PLANNED' && (
                    <button
                      onClick={async () => {
                        await supabase
                          .from('cutting_jobs')
                          .update({ status: 'IN_PROGRESS' })
                          .eq('id', job.id);

                        setJobs(prev =>
                          prev.map(j =>
                            j.id === job.id
                              ? { ...j, status: 'IN_PROGRESS' }
                              : j
                          )
                        );
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Start Job
                    </button>
                  )}

                  {job.status === 'IN_PROGRESS' && (
//   <button
//     onClick={() => setSelectedJob(job.id)}
//     className="
//       bg-indigo-50 text-indigo-700
//       border border-indigo-200
//       px-4 py-2 rounded-lg
//       flex items-center gap-2
//       hover:bg-indigo-100
//       transition-colors
//     "
//   >
//     <RotateCcw className="w-4 h-4" />
//     Continue
//   </button>
// )}
<button
  onClick={() => setSelectedJob(job.id)}
  className="
    bg-blue-600 text-white
    px-4 py-2 rounded-lg
    flex items-center gap-2
    hover:bg-blue-700
    transition-colors
    shadow-sm
  "
>
  <RotateCcw className="w-4 h-4" />
  Continue
</button>
                  )}
                  {/* ================= CANCEL DETAILS ================= */}
{job.status === 'CANCELLED' && (
  <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm">
    
    <h4 className="text-sm font-semibold text-gray-700 mb-3">
      Job Status Update
    </h4>

    <div className="border-l-2 border-red-400 pl-4 space-y-2">
      <p className="text-red-700 font-semibold">
        Job Cancelled
      </p>

      <p className="text-gray-700">
        <span className="font-medium">Reason:</span>{' '}
        {job.cancel_reason || '-'}
      </p>

      <p className="text-gray-600">
        <span className="font-medium">Cancelled At:</span>{' '}
        {job.cancelled_at
          ? new Date(job.cancelled_at).toLocaleString()
          : '-'}
      </p>

      <p className="text-gray-600">
        <span className="font-medium">Cancelled By:</span>{' '}
        {job.cancelled_by_name || job.cancelled_by || '-'}
      </p>
    </div>
  </div>
)}


                  {isSupervisor &&
                    (job.status === 'PLANNED' ||
                      job.status === 'IN_PROGRESS') && (
                      <button
                        onClick={() => setCancelJobId(job.id)}
                        className="bg-red-50 text-red-600 border px-4 py-2 rounded-lg"
                      >
                        Cancel Job
                      </button>
                    )}
                </div>
              </div>

              {/* EXPAND BUTTON */}
              <div className="mt-4 flex justify-center">
{/* VIZUALIZATION HERE */}
                <button
                  onClick={() =>
                    setExpandedJobId(isExpanded ? null : job.id)
                  }
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full"
                >
                  {isExpanded ? <ChevronUp /> : <ChevronDown />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================= STATUS BADGE ================= */
function StatusBadge({ status }: { status: string }) {
  const map: any = {
    PLANNED: ['Planned', 'bg-gray-100 text-gray-800', Clock],
    IN_PROGRESS: ['In Progress', 'bg-blue-100 text-blue-800', Play],
    COMPLETED: ['Completed', 'bg-green-100 text-green-800', CheckCircle],
    CANCELLED: ['Cancelled', 'bg-red-100 text-red-800', XCircle],
  };

  const [label, cls, Icon] = map[status];

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${cls}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}
