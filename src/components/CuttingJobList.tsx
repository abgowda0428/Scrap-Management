// import { User, CuttingJob, RawMaterial, Machine } from '../types';

// import { Plus, CheckCircle, Clock, Calendar, User as UserIcon } from 'lucide-react';


// interface CuttingJobListProps {
//   currentUser: User;
//   jobs: CuttingJob[];
//   rawMaterials: RawMaterial[];
//   machines: Machine[];
//   onSelectJob: (jobId: string) => void;
//   onCreateNew: () => void;
// }

// export function CuttingJobList({ currentUser, jobs, rawMaterials, machines, onSelectJob, onCreateNew }: CuttingJobListProps) {
//   const relevantJobs = currentUser.role === 'OPERATOR' 
//     ? jobs.filter(j => j.operatorId === currentUser.id)
//     : jobs;

//   const sortedJobs = [...relevantJobs].sort((a, b) => 
//     new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//   );

//   return (
//     <div>
//       <div className="mb-8 flex items-center justify-between">
//         <div>
//           <h1 className="text-gray-900 mb-2">Cutting Jobs</h1>
//           <p className="text-gray-600">
//             {currentUser.role === 'OPERATOR' ? 'My cutting jobs' : 'All cutting jobs'}
//           </p>
//         </div>
//         <button
//           onClick={onCreateNew}
//           className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
//         >
//           <Plus className="w-5 h-5" />
//           Create New Job
//         </button>
//       </div>

//       {/* Summary Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//         <div className="bg-white rounded-lg shadow p-4">
//           <p className="text-sm text-gray-600 mb-1">Total Jobs</p>
//           <p className="text-gray-900">{sortedJobs.length}</p>
//         </div>
//         <div className="bg-white rounded-lg shadow p-4">
//           <p className="text-sm text-gray-600 mb-1">Completed</p>
//           <p className="text-gray-900">{sortedJobs.filter(j => j.status === 'COMPLETED').length}</p>
//         </div>
//         <div className="bg-white rounded-lg shadow p-4">
//           <p className="text-sm text-gray-600 mb-1">In Progress</p>
//           <p className="text-gray-900">{sortedJobs.filter(j => j.status === 'IN_PROGRESS').length}</p>
//         </div>
//         <div className="bg-white rounded-lg shadow p-4">
//           <p className="text-sm text-gray-600 mb-1">Planned</p>
//           <p className="text-gray-900">{sortedJobs.filter(j => j.status === 'PLANNED').length}</p>
//         </div>
//       </div>

//       {/* Jobs List */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         {sortedJobs.length === 0 ? (
//           <div className="p-12 text-center">
//             <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
//             <p className="text-gray-500 mb-4">No cutting jobs found</p>
//             <button
//               onClick={onCreateNew}
//               className="text-blue-600 hover:text-blue-700"
//             >
//               Create your first job →
//             </button>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50 border-b border-gray-200">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
//                     Job Order No.
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
//                     Date & Shift
//                   </th>
//                   {currentUser.role !== 'OPERATOR' && (
//                     <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
//                       Operator
//                     </th>
//                   )}
//                   <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
//                     Material
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
//                     Machine
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
//                     Output
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
//                     Scrap %
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
//                     Action
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {sortedJobs.map((job) => {
//                   const operator = mockUsers.find(u => u.id === job.operatorId);
//                   const material = rawMaterials.find(m => m.id === job.materialId);
//                   const machine = machines.find(m => m.id === job.machineId);

//                   return (
//                     <tr key={job.id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4">
//                         <span className="text-gray-900">{job.jobOrderNo}</span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="text-sm text-gray-900">{new Date(job.jobDate).toLocaleDateString()}</div>
//                         <div className="text-xs text-gray-500">{job.shift}</div>
//                       </td>
//                       {currentUser.role !== 'OPERATOR' && (
//                         <td className="px-6 py-4">
//                           <div className="flex items-center gap-2">
//                             <UserIcon className="w-4 h-4 text-gray-400" />
//                             <span className="text-sm text-gray-900">{operator?.fullName}</span>
//                           </div>
//                         </td>
//                       )}
//                       <td className="px-6 py-4">
//                         <div className="text-sm text-gray-900">{material?.materialCode}</div>
//                         <div className="text-xs text-gray-500">{material?.materialGrade}</div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className="text-sm text-gray-900">{machine?.machineCode}</span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="text-sm text-gray-900">
//                           {job.actualOutputQty || 0} / {job.plannedOutputQty}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className={`text-sm ${
//                           !job.scrapPercentage ? 'text-gray-400' :
//                           job.scrapPercentage <= 4 ? 'text-green-600' :
//                           job.scrapPercentage <= 6 ? 'text-yellow-600' :
//                           'text-red-600'
//                         }`}>
//                           {job.scrapPercentage ? `${job.scrapPercentage.toFixed(1)}%` : '-'}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
//                           job.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
//                           job.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
//                           job.status === 'PLANNED' ? 'bg-gray-100 text-gray-800' :
//                           'bg-red-100 text-red-800'
//                         }`}>
//                           {job.status === 'COMPLETED' && <CheckCircle className="w-3 h-3 mr-1" />}
//                           {job.status === 'IN_PROGRESS' && <Clock className="w-3 h-3 mr-1" />}
//                           {job.status.replace('_', ' ')}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <button
//                           onClick={() => onSelectJob(job.id)}
//                           className="text-blue-600 hover:text-blue-800 text-sm"
//                         >
//                           {job.status === 'COMPLETED' ? 'View' : 'Open'}
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// } 


//prajeeth//
export default function CuttingJobList() {
  return (
    <div style={{ padding: 40, fontSize: 24 }}>
      ✅ REAL CuttingJobList is rendering
    </div>
  );
}
