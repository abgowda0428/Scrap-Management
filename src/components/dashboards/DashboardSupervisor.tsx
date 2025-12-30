import { useApp } from '../../context/AppContext';
import { Screen } from '../MainApp';
import { Package, AlertTriangle, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardSupervisorProps {
  onNavigate: (screen: Screen) => void;
}

export function DashboardSupervisor({ onNavigate }: DashboardSupervisorProps) {
  const { cuttingJobs, scrapEntries, users, scrapReasons } = useApp();

  const today = new Date().toISOString().split('T')[0];
  const todayJobs = cuttingJobs.filter(job => job.jobDate === today);
  const todayScrap = scrapEntries.filter(scrap => scrap.scrapDate === today);

  const totalScrapWeight = todayScrap.reduce((sum, s) => sum + s.scrapWeight, 0);
  const totalInputWeight = todayJobs.reduce((sum, j) => sum + j.totalInputWeight, 0);
  const avgScrapPercentage = totalInputWeight > 0 ? (totalScrapWeight / totalInputWeight) * 100 : 0;
  const totalScrapValue = todayScrap.reduce((sum, s) => sum + s.scrapValueEstimate, 0);

  // Top scrap reason
  const reasonCounts = todayScrap.reduce((acc, scrap) => {
    const reason = scrapReasons.find(r => r.id === scrap.reasonCodeId);
    if (reason) {
      acc[reason.reasonName] = (acc[reason.reasonName] || 0) + scrap.scrapWeight;
    }
    return acc;
  }, {} as Record<string, number>);

  const topReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0];

  // Operator performance
  const operators = users.filter(u => u.role === 'OPERATOR');
  const operatorStats = operators.map(op => {
    const opJobs = todayJobs.filter(j => j.operatorId === op.id);
    const opScrap = todayScrap.filter(s => s.operatorId === op.id);
    const opInputWeight = opJobs.reduce((sum, j) => sum + j.totalInputWeight, 0);
    const opScrapWeight = opScrap.reduce((sum, s) => sum + s.scrapWeight, 0);
    const opScrapPercentage = opInputWeight > 0 ? (opScrapWeight / opInputWeight) * 100 : 0;

    return {
      name: op.fullName.split(' ')[0],
      scrapPercentage: Number(opScrapPercentage.toFixed(1)),
      jobs: opJobs.length
    };
  }).filter(op => op.jobs > 0).sort((a, b) => b.scrapPercentage - a.scrapPercentage);

  // Scrap by reason (pie chart data)
  const scrapByReason = Object.entries(reasonCounts).map(([reason, weight]) => ({
    name: reason,
    value: Number(weight.toFixed(1))
  })).sort((a, b) => b.value - a.value).slice(0, 5);

  const COLORS = ['#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#10b981'];

  // High scrap alerts
  const highScrapJobs = todayJobs.filter(job => job.scrapPercentage > 10);

  const stats = [
    {
      label: 'Total Jobs Today',
      value: todayJobs.length.toString(),
      subtext: `${todayJobs.filter(j => j.status === 'COMPLETED').length} completed`,
      icon: Package,
      color: 'blue'
    },
    {
      label: 'Avg Scrap % Today',
      value: `${avgScrapPercentage.toFixed(1)}%`,
      subtext: `${totalScrapWeight.toFixed(1)} kg`,
      icon: AlertTriangle,
      color: avgScrapPercentage > 5 ? 'red' : 'green'
    },
    {
      label: 'Total Scrap Value',
      value: `$${totalScrapValue.toFixed(0)}`,
      subtext: 'Material cost lost',
      icon: TrendingUp,
      color: 'orange'
    },
    {
      label: 'Active Operators',
      value: operatorStats.length.toString(),
      subtext: `${operators.length} total`,
      icon: Users,
      color: 'purple'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">{stat.label}</p>
                <div className={`p-2 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-gray-900 mb-1">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.subtext}</p>
            </div>
          );
        })}
      </div>

      {/* Top Scrap Reason */}
      {topReason && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-900 mb-1">Top Scrap Reason Today</p>
          <p className="text-sm text-blue-700">
            <span className="font-medium">{topReason[0]}</span> - {topReason[1].toFixed(1)} kg 
            ({((topReason[1] / totalScrapWeight) * 100).toFixed(0)}% of total scrap)
          </p>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scrap by Operator */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="mb-4">Scrap % by Operator</h3>
          {operatorStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={operatorStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Scrap %', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="scrapPercentage" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>

        {/* Scrap by Reason */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="mb-4">Scrap by Reason</h3>
          {scrapByReason.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={scrapByReason}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}kg`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {scrapByReason.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>
      </div>

      {/* High Scrap Alerts */}
      {highScrapJobs.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="text-red-900">High Scrap Alerts ({highScrapJobs.length})</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {highScrapJobs.map(job => {
              const operator = users.find(u => u.id === job.operatorId);
              return (
                <div key={job.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <h4 className="text-gray-900">{job.jobOrderNo}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Operator: {operator?.fullName} • Scrap: {job.scrapPercentage.toFixed(1)}%
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('jobs')}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                  >
                    Review
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('jobs')}
          className="bg-white border-2 border-blue-600 text-blue-600 p-4 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <p>View All Jobs</p>
        </button>
        <button
          onClick={() => onNavigate('reports')}
          className="bg-white border-2 border-purple-600 text-purple-600 p-4 rounded-lg hover:bg-purple-50 transition-colors"
        >
          <p>Generate Reports</p>
        </button>
        <button
          onClick={() => onNavigate('endpieces')}
          className="bg-white border-2 border-green-600 text-green-600 p-4 rounded-lg hover:bg-green-50 transition-colors"
        >
          <p>End Piece Inventory</p>
        </button>
      </div>
    </div>
  );
}
