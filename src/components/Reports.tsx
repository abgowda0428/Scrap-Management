import { useState } from 'react';
import { ArrowLeft, Download, Calendar, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';

import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function Reports() {
  const { setCurrentScreen } = useApp();
  const [dateRange, setDateRange] = useState('7days');
  const [selectedReport, setSelectedReport] = useState('scrap-summary');

  // Sample data
  const scrapByReason = [
    { name: 'Setup Scrap', value: 40, count: 15 },
    { name: 'Kerf Loss', value: 25, count: 12 },
    { name: 'Wrong Cut', value: 15, count: 8 },
    { name: 'Machine Error', value: 12, count: 5 },
    { name: 'Material Defect', value: 8, count: 4 },
  ];

  const scrapByOperator = [
    { name: 'John D.', scrapPct: 3.2, jobs: 45, avoidable: 1.1 },
    { name: 'Mike W.', scrapPct: 4.8, jobs: 38, avoidable: 2.5 },
    { name: 'Sarah K.', scrapPct: 5.2, jobs: 42, avoidable: 3.1 },
    { name: 'Tom B.', scrapPct: 6.8, jobs: 35, avoidable: 4.2 },
  ];

  const scrapTrend = [
    { date: 'Dec 4', scrapPct: 3.8, scrapWeight: 10.5, jobs: 18 },
    { date: 'Dec 5', scrapPct: 4.2, scrapWeight: 11.2, jobs: 20 },
    { date: 'Dec 6', scrapPct: 3.5, scrapWeight: 9.8, jobs: 22 },
    { date: 'Dec 7', scrapPct: 5.1, scrapWeight: 13.5, jobs: 19 },
    { date: 'Dec 8', scrapPct: 4.0, scrapWeight: 10.8, jobs: 21 },
    { date: 'Dec 9', scrapPct: 4.0, scrapWeight: 12.0, jobs: 20 },
    { date: 'Dec 10', scrapPct: 5.0, scrapWeight: 12.5, jobs: 18 },
  ];

  const machineEfficiency = [
    { machine: 'MACH-01', scrapPct: 4.5, jobs: 85, uptime: 95 },
    { machine: 'MACH-02', scrapPct: 5.2, jobs: 72, uptime: 92 },
    { machine: 'MACH-03', scrapPct: 9.1, jobs: 45, uptime: 78 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const totalScrapWeight = mockScrap.reduce((sum, s) => sum + s.scrap_weight, 0);
  const totalScrapValue = mockScrap.reduce((sum, s) => sum + s.scrap_value_estimate, 0);
  const completedJobs = mockCuttingJobs.filter(j => j.status === 'COMPLETED');
  const avgScrapPct = completedJobs.length > 0
    ? completedJobs.reduce((sum, j) => sum + j.scrap_percentage, 0) / completedJobs.length
    : 0;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-gray-900">Scrap Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">Comprehensive scrap analysis and insights</p>
          </div>
        </div>

        <button
          onClick={() => alert('Exporting report to Excel...')}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export to Excel
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="thismonth">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-2" />
              Report Type
            </label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="scrap-summary">Scrap Summary</option>
              <option value="operator-performance">Operator Performance</option>
              <option value="machine-efficiency">Machine Efficiency</option>
              <option value="cost-analysis">Cost Analysis</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Material Type</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Materials</option>
              <option value="sheet">Sheet</option>
              <option value="rod">Rod</option>
              <option value="pipe">Pipe</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Shift</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Shifts</option>
              <option value="day">Day Shift</option>
              <option value="afternoon">Afternoon Shift</option>
              <option value="night">Night Shift</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Total Scrap Weight</p>
          <p className="text-gray-900">{totalScrapWeight.toFixed(1)} kg</p>
          <p className="text-xs text-gray-500 mt-1">↓ 8% vs last period</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Total Scrap Value</p>
          <p className="text-gray-900">${totalScrapValue.toFixed(0)}</p>
          <p className="text-xs text-gray-500 mt-1">↓ $125 vs last period</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Avg Scrap %</p>
          <p className="text-gray-900">{avgScrapPct.toFixed(1)}%</p>
          <p className="text-xs text-green-600 mt-1">Target: {'<'} 5.0%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Total Jobs</p>
          <p className="text-gray-900">{mockCuttingJobs.length}</p>
          <p className="text-xs text-gray-500 mt-1">{completedJobs.length} completed</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="mb-4">Scrap Trend Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={scrapTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="scrapPct" stroke="#f59e0b" name="Scrap %" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="scrapWeight" stroke="#3b82f6" name="Weight (kg)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="mb-4">Scrap by Reason</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={scrapByReason}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}%`}
                outerRadius={100}
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
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="mb-4">Operator Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scrapByOperator}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="scrapPct" fill="#f59e0b" name="Total Scrap %" />
              <Bar dataKey="avoidable" fill="#ef4444" name="Avoidable Scrap %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="mb-4">Machine Efficiency</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={machineEfficiency}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="machine" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="scrapPct" fill="#3b82f6" name="Scrap %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="mb-4">Detailed Scrap Entries</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Job No</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Operator</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Machine</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Material</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Weight</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Reason</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockScrap.map(scrap => (
                <tr key={scrap.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Date(scrap.scrap_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{scrap.cutting_job_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{scrap.operator_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{scrap.machine_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{scrap.material_code}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{scrap.scrap_weight} kg</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      scrap.reason_code === 'WRONG_CUT' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {scrap.reason_name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">${scrap.scrap_value_estimate.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-blue-900 mb-3">📊 Key Insights & Recommendations</h3>
        <ul className="space-y-2 text-blue-800">
          <li>• <strong>Avoidable scrap accounts for 35%</strong> of total scrap - potential monthly savings of $5,320</li>
          <li>• <strong>Wrong Cut errors increased by 12%</strong> this week - recommend operator training session</li>
          <li>• <strong>Machine MACH-03</strong> has 2× higher scrap rate than average - schedule immediate maintenance</li>
          <li>• <strong>Tom B.</strong> has highest avoidable scrap rate (4.2%) - assign mentor for next shift</li>
          <li>• <strong>Setup scrap</strong> is the leading reason (40%) - consider optimization of setup procedures</li>
        </ul>
      </div>
    </div>
  );
}