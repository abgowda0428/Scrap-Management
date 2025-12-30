import { useApp } from '../../context/AppContext';
import { Screen } from '../MainApp';
import { Package, DollarSign, TrendingDown, Recycle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface DashboardManagerProps {
  onNavigate: (screen: Screen) => void;
}

export function DashboardManager({ onNavigate }: DashboardManagerProps) {
  const { cuttingJobs, scrapEntries, endPieces, scrapReasons } = useApp();

  // Get last 30 days
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  // Calculate monthly stats
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartStr = monthStart.toISOString().split('T')[0];

  const monthJobs = cuttingJobs.filter(job => job.jobDate >= monthStartStr);
  const monthScrap = scrapEntries.filter(scrap => scrap.scrapDate >= monthStartStr);

  const totalJobsMonth = monthJobs.length;
  const totalScrapCost = monthScrap.reduce((sum, s) => sum + s.scrapValueEstimate, 0);
  const totalInputWeight = monthJobs.reduce((sum, j) => sum + j.totalInputWeight, 0);
  const totalOutputWeight = monthJobs.reduce((sum, j) => sum + j.totalOutputWeight, 0);
  const materialUtilization = totalInputWeight > 0 
    ? (totalOutputWeight / totalInputWeight) * 100 
    : 0;

  const avgScrapPercentage = monthJobs.length > 0
    ? monthJobs.reduce((sum, j) => sum + j.scrapPercentage, 0) / monthJobs.length
    : 0;

  // End piece reuse rate
  const totalEndPiecesCreated = endPieces.length;
  const totalEndPiecesUsed = endPieces.filter(ep => ep.status === 'USED').length;
  const endPieceReuseRate = totalEndPiecesCreated > 0 
    ? (totalEndPiecesUsed / totalEndPiecesCreated) * 100 
    : 0;

  // Trend data (last 7 days)
  const last7Days = last30Days.slice(-7);
  const trendData = last7Days.map(date => {
    const dayJobs = cuttingJobs.filter(job => job.jobDate === date);
    const dayScrap = scrapEntries.filter(scrap => scrap.scrapDate === date);
    const dayInputWeight = dayJobs.reduce((sum, j) => sum + j.totalInputWeight, 0);
    const dayScrapWeight = dayScrap.reduce((sum, s) => sum + s.scrapWeight, 0);
    const scrapPct = dayInputWeight > 0 ? (dayScrapWeight / dayInputWeight) * 100 : 0;

    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      scrapPercentage: Number(scrapPct.toFixed(1)),
      jobs: dayJobs.length
    };
  });

  // Top scrap reasons
  const reasonStats = scrapReasons.map(reason => {
    const reasonScrap = monthScrap.filter(s => s.reasonCodeId === reason.id);
    const weight = reasonScrap.reduce((sum, s) => sum + s.scrapWeight, 0);
    const value = reasonScrap.reduce((sum, s) => sum + s.scrapValueEstimate, 0);

    return {
      name: reason.reasonName.replace(/ /g, '\n'),
      weight: Number(weight.toFixed(1)),
      value: Number(value.toFixed(0)),
      isAvoidable: reason.isAvoidable
    };
  }).filter(r => r.weight > 0).sort((a, b) => b.weight - a.weight).slice(0, 5);

  const stats = [
    {
      label: 'Total Jobs This Month',
      value: totalJobsMonth.toString(),
      subtext: 'Completed and in progress',
      icon: Package,
      color: 'blue'
    },
    {
      label: 'Avg Scrap % This Month',
      value: `${avgScrapPercentage.toFixed(1)}%`,
      subtext: 'Target: < 5%',
      icon: TrendingDown,
      color: avgScrapPercentage > 5 ? 'red' : 'green'
    },
    {
      label: 'Total Scrap Cost',
      value: `$${totalScrapCost.toFixed(0)}`,
      subtext: 'This month',
      icon: DollarSign,
      color: 'orange'
    },
    {
      label: 'Material Utilization',
      value: `${materialUtilization.toFixed(1)}%`,
      subtext: 'Output / Input',
      icon: Recycle,
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

  // Calculate avoidable vs unavoidable scrap cost
  const avoidableScrapCost = monthScrap
    .filter(s => {
      const reason = scrapReasons.find(r => r.id === s.reasonCodeId);
      return reason?.isAvoidable;
    })
    .reduce((sum, s) => sum + s.scrapValueEstimate, 0);

  const avoidablePercentage = totalScrapCost > 0 
    ? (avoidableScrapCost / totalScrapCost) * 100 
    : 0;

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

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
          <p className="text-sm text-blue-700 mb-2">End Piece Reuse Rate</p>
          <p className="text-blue-900 mb-1">{endPieceReuseRate.toFixed(1)}%</p>
          <p className="text-xs text-blue-600">
            {totalEndPiecesUsed} of {totalEndPiecesCreated} reused
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6">
          <p className="text-sm text-orange-700 mb-2">Avoidable Scrap Cost</p>
          <p className="text-orange-900 mb-1">${avoidableScrapCost.toFixed(0)}</p>
          <p className="text-xs text-orange-600">
            {avoidablePercentage.toFixed(0)}% of total • Potential savings
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
          <p className="text-sm text-green-700 mb-2">Annual Savings Potential</p>
          <p className="text-green-900 mb-1">${(avoidableScrapCost * 12).toFixed(0)}</p>
          <p className="text-xs text-green-600">
            If avoidable scrap eliminated
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scrap Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="mb-4">Scrap % Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: 'Scrap %', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Line type="monotone" dataKey="scrapPercentage" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Scrap Reasons */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="mb-4">Top Scrap Reasons by Cost</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={reasonStats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} style={{ fontSize: '12px' }} />
              <Tooltip />
              <Bar dataKey="value" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 3 Scrap Reasons Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="mb-4">Top 3 Scrap Reasons This Month</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reasonStats.slice(0, 3).map((reason, index) => (
            <div key={reason.name} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index === 0 ? 'bg-red-100 text-red-700' :
                  index === 1 ? 'bg-orange-100 text-orange-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{reason.name.replace(/\n/g, ' ')}</p>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-gray-600">Weight: {reason.weight} kg</p>
                <p className="text-gray-600">Cost: ${reason.value}</p>
                <p className={`${reason.isAvoidable ? 'text-red-600' : 'text-green-600'}`}>
                  {reason.isAvoidable ? 'Avoidable' : 'Normal'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('reports')}
          className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <p>View Analytics</p>
        </button>
        <button
          onClick={() => onNavigate('jobs')}
          className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <p>Review Jobs</p>
        </button>
        <button
          onClick={() => onNavigate('materials')}
          className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors"
        >
          <p>Material Master</p>
        </button>
      </div>
    </div>
  );
}
