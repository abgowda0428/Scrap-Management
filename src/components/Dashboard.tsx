// import { 
//   Package, 
//   TrendingDown, 
//   DollarSign, 
//   Recycle, 
//   AlertTriangle,
//   Activity,
//   Users,
//   Settings
// } from 'lucide-react';
// import { useApp } from '../context/AppContext';

// import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// const cuttingJobs: any[] = [];

// export function Dashboard() {
//   const { currentUser } = useApp();

//   // Calculate stats
//   const totalJobs = cuttingJobs.length;
//   const completedJobs = cuttingJobs.filter(j => j.status === 'COMPLETED');
//   const totalScrapWeight = completedJobs.reduce((sum, job) => sum + job.total_scrap_weight_kg, 0);
//   const totalInputWeight = completedJobs.reduce((sum, job) => sum + job.total_input_weight_kg, 0);
//   const avgScrapPercentage = totalInputWeight > 0 ? (totalScrapWeight / totalInputWeight) * 100 : 0;
//   const totalScrapValue = mockScrap.reduce((sum, s) => sum + s.scrap_value_estimate, 0);
//   const materialUtilization = 100 - avgScrapPercentage;
  
//   const totalEndPieces = mockEndPieces.filter(ep => ep.status === 'AVAILABLE').length;
//   const usedEndPieces = mockEndPieces.filter(ep => ep.status === 'USED').length;
//   const endPieceReuseRate = mockEndPieces.length > 0 
//     ? (usedEndPieces / mockEndPieces.length) * 100 
//     : 0;

//   // Scrap by reason data
//   const scrapByReason = mockScrap.reduce((acc, s) => {
//     const reason = s.reason_name || 'Unknown';
//     if (!acc[reason]) {
//       acc[reason] = { name: reason, value: 0, count: 0 };
//     }
//     acc[reason].value += s.scrap_weight_kg;
//     acc[reason].count += 1;
//     return acc;
//   }, {} as Record<string, { name: string; value: number; count: number }>);

//   const scrapReasonData = Object.values(scrapByReason);

//   // Scrap trend data (last 7 days)
//   const scrapTrendData = [
//     { date: 'Dec 4', scrapPercentage: 3.8, scrapWeight: 10.5 },
//     { date: 'Dec 5', scrapPercentage: 4.2, scrapWeight: 11.2 },
//     { date: 'Dec 6', scrapPercentage: 3.5, scrapWeight: 9.8 },
//     { date: 'Dec 7', scrapPercentage: 5.1, scrapWeight: 13.5 },
//     { date: 'Dec 8', scrapPercentage: 4.0, scrapWeight: 10.8 },
//     { date: 'Dec 9', scrapPercentage: 4.0, scrapWeight: 12.0 },
//     { date: 'Dec 10', scrapPercentage: avgScrapPercentage, scrapWeight: totalScrapWeight },
//   ];

//   const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

//   const renderOperatorDashboard = () => (
//     <>
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
//         <StatCard
//           title="My Jobs Today"
//           value={mockCuttingJobs.filter(j => j.operator_id === currentUser?.id).length.toString()}
//           subtitle={`${completedJobs.filter(j => j.operator_id === currentUser?.id).length} completed`}
//           icon={Package}
//           color="blue"
//         />
//         <StatCard
//           title="My Scrap % Today"
//           value={`${avgScrapPercentage.toFixed(1)}%`}
//           subtitle="Target: {'<'} 5%"
//           icon={TrendingDown}
//           color="orange"
//         />
//         <StatCard
//           title="My Efficiency"
//           value={`${materialUtilization.toFixed(1)}%`}
//           subtitle="Material utilization"
//           icon={Activity}
//           color="green"
//         />
//         <StatCard
//           title="End Pieces Created"
//           value={mockEndPieces.filter(ep => ep.cutting_job_id === 'JOB001').length.toString()}
//           subtitle="Available for reuse"
//           icon={Recycle}
//           color="purple"
//         />
//       </div>

//       <div className="bg-white rounded-lg shadow p-4 lg:p-6 mb-6">
//         <h2 className="mb-4 text-lg lg:text-xl">My Active Jobs</h2>
//         <div className="space-y-3">
//           {mockCuttingJobs
//             .filter(j => j.operator_id === currentUser?.id && (j.status === 'IN_PROGRESS' || j.status === 'PLANNED'))
//             .map(job => (
//               <div key={job.id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 bg-gray-50 rounded-lg space-y-2 lg:space-y-0">
//                 <div>
//                   <p className="text-gray-900">{job.job_order_no}</p>
//                   <p className="text-sm text-gray-600 mt-1">{job.material_code}</p>
//                   <p className="text-sm text-gray-600">{job.machine_name}</p>
//                 </div>
//                 <span className={`px-3 py-1 rounded-full text-sm self-start lg:self-auto ${
//                   job.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
//                 }`}>
//                   {job.status.replace('_', ' ')}
//                 </span>
//               </div>
//             ))}
//         </div>
//       </div>

//       <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
//         <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
//         <div>
//           <p className="text-sm lg:text-base text-yellow-900">Tip: Check end piece inventory before starting new jobs to maximize material reuse!</p>
//         </div>
//       </div>
//     </>
//   );

//   const renderSupervisorDashboard = () => (
//     <>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <StatCard
//           title="Total Jobs Today"
//           value={totalJobs.toString()}
//           subtitle={`${completedJobs.length} completed`}
//           icon={Package}
//           color="blue"
//         />
//         <StatCard
//           title="Avg Scrap % Today"
//           value={`${avgScrapPercentage.toFixed(1)}%`}
//           subtitle="All operators"
//           icon={TrendingDown}
//           color="orange"
//         />
//         <StatCard
//           title="Total Scrap Value"
//           value={`₹${totalScrapValue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
//           subtitle="Today's scrap cost"
//           icon={DollarSign}
//           color="red"
//         />
//         <StatCard
//           title="Material Utilization"
//           value={`${materialUtilization.toFixed(1)}%`}
//           subtitle="Efficiency rate"
//           icon={Activity}
//           color="green"
//         />
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
//         <div className="bg-white rounded-lg shadow p-6">
//           <h2 className="mb-4">Scrap by Reason</h2>
//           <ResponsiveContainer width="100%" height={300}>
//             <PieChart>
//               <Pie
//                 data={scrapReasonData}
//                 cx="50%"
//                 cy="50%"
//                 labelLine={false}
//                 label={(entry) => `${entry.name}: ${entry.value.toFixed(1)}kg`}
//                 outerRadius={80}
//                 fill="#8884d8"
//                 dataKey="value"
//               >
//                 {scrapReasonData.map((entry, index) => (
//                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                 ))}
//               </Pie>
//               <Tooltip />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <h2 className="mb-4">Scrap Trend (Last 7 Days)</h2>
//           <ResponsiveContainer width="100%" height={300}>
//             <LineChart data={scrapTrendData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="date" />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Line type="monotone" dataKey="scrapPercentage" stroke="#f59e0b" name="Scrap %" />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       <div className="bg-white rounded-lg shadow p-6">
//         <h2 className="mb-4">Alerts & Notifications</h2>
//         <div className="space-y-3">
//           <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
//             <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
//             <div>
//               <p className="text-red-900">High scrap detected on Job JOB-2025-001 (5.0%)</p>
//               <p className="text-sm text-red-700">Operator: John Doe - Review needed</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );

//   const renderManagerDashboard = () => (
//     <>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <StatCard
//           title="Total Jobs (This Month)"
//           value="125"
//           subtitle="15 in progress"
//           icon={Package}
//           color="blue"
//         />
//         <StatCard
//           title="Avg Scrap % (Month)"
//           value="4.8%"
//           subtitle="↓ 0.3% vs last month"
//           icon={TrendingDown}
//           color="green"
//         />
//         <StatCard
//           title="Total Scrap Cost"
//           value="$15,200"
//           subtitle="This month"
//           icon={DollarSign}
//           color="red"
//         />
//         <StatCard
//           title="End Piece Reuse Rate"
//           value={`${endPieceReuseRate.toFixed(1)}%`}
//           subtitle={`${totalEndPieces} available`}
//           icon={Recycle}
//           color="purple"
//         />
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
//         <div className="bg-white rounded-lg shadow p-6">
//           <h2 className="mb-4">Scrap by Material Type</h2>
//           <ResponsiveContainer width="100%" height={300}>
//             <PieChart>
//               <Pie
//                 data={[
//                   { name: 'SS304 Sheet', value: 45 },
//                   { name: 'MS Rod', value: 25 },
//                   { name: 'Al Pipe', value: 30 },
//                 ]}
//                 cx="50%"
//                 cy="50%"
//                 labelLine={false}
//                 label={(entry) => `${entry.name}: ${entry.value}%`}
//                 outerRadius={80}
//                 fill="#8884d8"
//                 dataKey="value"
//               >
//                 <Cell fill="#3b82f6" />
//                 <Cell fill="#10b981" />
//                 <Cell fill="#f59e0b" />
//               </Pie>
//               <Tooltip />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <h2 className="mb-4">Monthly Scrap Trend</h2>
//           <ResponsiveContainer width="100%" height={300}>
//             <LineChart data={scrapTrendData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="date" />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Line type="monotone" dataKey="scrapPercentage" stroke="#ef4444" name="Scrap %" strokeWidth={2} />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
//         <div className="bg-white rounded-lg shadow p-6">
//           <h2 className="mb-4">Top Scrap Reasons (This Month)</h2>
//           <div className="space-y-3">
//             {[
//               { reason: 'Setup Scrap', percentage: 40, count: 45, avoidable: false },
//               { reason: 'Kerf Loss', percentage: 25, count: 38, avoidable: false },
//               { reason: 'Wrong Cut', percentage: 15, count: 22, avoidable: true },
//               { reason: 'Machine Error', percentage: 12, count: 18, avoidable: true },
//               { reason: 'Material Defect', percentage: 8, count: 12, avoidable: true },
//             ].map((item, index) => (
//               <div key={index} className="flex items-center justify-between">
//                 <div className="flex-1">
//                   <div className="flex items-center gap-2">
//                     <p className="text-sm text-gray-900">{item.reason}</p>
//                     {item.avoidable && (
//                       <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">Avoidable</span>
//                     )}
//                   </div>
//                   <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
//                     <div 
//                       className={`h-2 rounded-full ${item.avoidable ? 'bg-red-500' : 'bg-blue-500'}`}
//                       style={{ width: `${item.percentage}%` }}
//                     />
//                   </div>
//                 </div>
//                 <span className="ml-4 text-sm text-gray-600">{item.percentage}%</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <h2 className="mb-4">Operator Performance</h2>
//           <ResponsiveContainer width="100%" height={250}>
//             <BarChart
//               data={[
//                 { name: 'John D.', scrapPct: 3.2, jobs: 45 },
//                 { name: 'Mike W.', scrapPct: 4.8, jobs: 38 },
//                 { name: 'Sarah K.', scrapPct: 5.2, jobs: 42 },
//                 { name: 'Tom B.', scrapPct: 6.8, jobs: 35 },
//               ]}
//             >
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="name" />
//               <YAxis />
//               <Tooltip />
//               <Bar dataKey="scrapPct" fill="#f59e0b" name="Scrap %" />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
//         <h3 className="text-blue-900 mb-2">💡 Key Insights</h3>
//         <ul className="space-y-2 text-blue-800">
//           <li>• Avoidable scrap accounts for 35% of total scrap - potential savings: $5,320/month</li>
//           <li>• Wrong Cut errors increased by 12% this week - recommend operator training</li>
//           <li>• Machine CUT-MACH-03 has 2× higher scrap rate - schedule maintenance</li>
//           <li>• End piece reuse rate improved from 28% to {endPieceReuseRate.toFixed(1)}% - great progress!</li>
//         </ul>
//       </div>
//     </>
//   );

//   return (
//     <div>
//       <div className="mb-8">
//         <h1 className="text-gray-900">
//           {currentUser?.role === 'OPERATOR' && 'My Dashboard'}
//           {currentUser?.role === 'SUPERVISOR' && 'Supervisor Dashboard'}
//           {currentUser?.role === 'MANAGER' && 'Executive Dashboard'}
//         </h1>
//         <p className="text-gray-600 mt-1">
//           Welcome back, {currentUser?.full_name} - {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
//         </p>
//       </div>

//       {currentUser?.role === 'OPERATOR' && renderOperatorDashboard()}
//       {currentUser?.role === 'SUPERVISOR' && renderSupervisorDashboard()}
//       {currentUser?.role === 'MANAGER' && renderManagerDashboard()}
//     </div>
//   );
// }

// interface StatCardProps {
//   title: string;
//   value: string;
//   subtitle: string;
//   icon: any;
//   color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
// }

// function StatCard({ title, value, subtitle, icon: Icon, color }: StatCardProps) {
//   const colorClasses = {
//     blue: 'bg-blue-100 text-blue-600',
//     green: 'bg-green-100 text-green-600',
//     orange: 'bg-orange-100 text-orange-600',
//     red: 'bg-red-100 text-red-600',
//     purple: 'bg-purple-100 text-purple-600',
//   };

//   return (
//     <div className="bg-white rounded-lg shadow p-6">
//       <div className="flex items-center justify-between mb-3">
//         <p className="text-sm text-gray-600">{title}</p>
//         <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
//           <Icon className="w-5 h-5" />
//         </div>
//       </div>
//       <p className="text-gray-900 mb-1">{value}</p>
//       <p className="text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: subtitle }} />
//     </div>
//   );
// }

import {
  Package,
  TrendingDown,
  DollarSign,
  Recycle,
  AlertTriangle,
  Activity,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

/* ================= SAFE PLACEHOLDERS ================= */
const cuttingJobs: any[] = [];
const scrapEntries: any[] = [];
const endPieces: any[] = [];
/* ==================================================== */

export function Dashboard() {
  const { currentUser } = useApp();

  /* ================= CALCULATIONS ================= */
  const totalJobs = cuttingJobs.length;
  const completedJobs = cuttingJobs.filter(j => j.status === 'COMPLETED');

  const totalScrapWeight = completedJobs.reduce(
    (sum, j) => sum + (j.total_scrap_weight_kg || 0),
    0
  );

  const totalInputWeight = completedJobs.reduce(
    (sum, j) => sum + (j.total_input_weight_kg || 0),
    0
  );

  const avgScrapPercentage =
    totalInputWeight > 0 ? (totalScrapWeight / totalInputWeight) * 100 : 0;

  const totalScrapValue = scrapEntries.reduce(
    (sum, s) => sum + (s.scrap_value_estimate || 0),
    0
  );

  const materialUtilization = 100 - avgScrapPercentage;

  const totalEndPieces = endPieces.length;
  const usedEndPieces = endPieces.filter(ep => ep.status === 'USED').length;

  const endPieceReuseRate =
    totalEndPieces > 0 ? (usedEndPieces / totalEndPieces) * 100 : 0;

  /* ================= CHART DATA ================= */
  const scrapTrendData = [
    { date: 'Mon', scrapPercentage: 0 },
    { date: 'Tue', scrapPercentage: 0 },
    { date: 'Wed', scrapPercentage: 0 },
    { date: 'Thu', scrapPercentage: 0 },
    { date: 'Fri', scrapPercentage: avgScrapPercentage },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  /* ================= DASHBOARD VIEWS ================= */

  const OperatorDashboard = () => (
    <>
      <StatsGrid>
        <StatCard title="My Jobs Today" value="0" subtitle="No jobs yet" icon={Package} color="blue" />
        <StatCard title="My Scrap %" value="0%" subtitle="Target < 5%" icon={TrendingDown} color="orange" />
        <StatCard title="Efficiency" value="100%" subtitle="Material usage" icon={Activity} color="green" />
        <StatCard title="End Pieces" value="0" subtitle="Available" icon={Recycle} color="purple" />
      </StatsGrid>

      <EmptyState message="No active jobs assigned yet." />
    </>
  );

  const SupervisorDashboard = () => (
    <>
      <StatsGrid>
        <StatCard title="Total Jobs" value={totalJobs.toString()} subtitle="Today" icon={Package} color="blue" />
        <StatCard title="Avg Scrap %" value={`${avgScrapPercentage.toFixed(1)}%`} subtitle="All operators" icon={TrendingDown} color="orange" />
        <StatCard title="Scrap Cost" value={`₹${totalScrapValue}`} subtitle="Today" icon={DollarSign} color="red" />
        <StatCard title="Utilization" value={`${materialUtilization.toFixed(1)}%`} subtitle="Efficiency" icon={Activity} color="green" />
      </StatsGrid>

      <ChartCard title="Scrap Trend">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={scrapTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line dataKey="scrapPercentage" stroke="#f59e0b" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </>
  );

  const ManagerDashboard = () => (
    <>
      <StatsGrid>
        <StatCard title="Monthly Jobs" value="0" subtitle="In progress" icon={Package} color="blue" />
        <StatCard title="Avg Scrap %" value="0%" subtitle="Monthly" icon={TrendingDown} color="green" />
        <StatCard title="Scrap Cost" value="₹0" subtitle="This month" icon={DollarSign} color="red" />
        <StatCard title="Reuse Rate" value={`${endPieceReuseRate.toFixed(1)}%`} subtitle="End pieces" icon={Recycle} color="purple" />
      </StatsGrid>

      <ChartCard title="Scrap Reasons">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={[]} dataKey="value" outerRadius={80}>
              {COLORS.map((c, i) => (
                <Cell key={i} fill={c} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </>
  );

  /* ================= HARD ROLE SWITCH ================= */

  let dashboardContent: JSX.Element;

  switch (currentUser?.role) {
    case 'OPERATOR':
      dashboardContent = <OperatorDashboard />;
      break;

    case 'SUPERVISOR':
      dashboardContent = <SupervisorDashboard />;
      break;

    case 'MANAGER':
      dashboardContent = <ManagerDashboard />;
      break;

    default:
      dashboardContent = (
        <div className="p-8 text-red-600">
          Invalid role configuration. Contact administrator.
        </div>
      );
  }

  /* ================= RENDER ================= */

  return (
    <div>
      <h1 className="text-gray-900 mb-1">
        {currentUser?.role === 'OPERATOR' && 'My Dashboard'}
        {currentUser?.role === 'SUPERVISOR' && 'Supervisor Dashboard'}
        {currentUser?.role === 'MANAGER' && 'Executive Dashboard'}
      </h1>

      <p className="text-gray-600 mb-6">
        Welcome back, {currentUser?.full_name}
      </p>

      {dashboardContent}
    </div>
  );
}

/* ================= REUSABLE UI ================= */

function StatsGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">{children}</div>;
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="mb-4">{title}</h2>
      {children}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
      <AlertTriangle className="w-5 h-5 text-yellow-600" />
      <p className="text-yellow-900">{message}</p>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}

function StatCard({ title, value, subtitle, icon: Icon, color }: StatCardProps) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between mb-3">
        <p className="text-sm text-gray-600">{title}</p>
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}
