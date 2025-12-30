import { useState } from 'react';
import { FileText, Download, Calendar, Filter, TrendingUp, TrendingDown, Package, Users, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type ReportType = 
  | 'daily-scrap'
  | 'material-wise'
  | 'operator-performance'
  | 'machine-efficiency'
  | 'end-piece-utilization'
  | 'monthly-summary'
  | 'reusable-vs-nonreusable'
  | 'cost-analysis';

export function ReportsEnhanced() {
  const { currentUser } = useApp();
  const [selectedReport, setSelectedReport] = useState<ReportType>('daily-scrap');
  const [dateRange, setDateRange] = useState({
    from: '2025-12-01',
    to: '2025-12-11',
  });

  // Mock data for different reports
  const dailyScrapData = [
    { date: '2025-12-06', scrap: 12.5, target: 15, jobs: 8 },
    { date: '2025-12-07', scrap: 18.2, target: 15, jobs: 10 },
    { date: '2025-12-08', scrap: 10.8, target: 15, jobs: 7 },
    { date: '2025-12-09', scrap: 22.4, target: 15, jobs: 12 },
    { date: '2025-12-10', scrap: 14.6, target: 15, jobs: 9 },
    { date: '2025-12-11', scrap: 16.3, target: 15, jobs: 11 },
  ];

  const materialWiseData = [
    { material: 'SS304', weight: 45.2, value: 29380, percentage: 35, reusable: 8.5, nonReusable: 36.7 },
    { material: 'Aluminum', weight: 32.8, value: 19024, percentage: 25, reusable: 12.3, nonReusable: 20.5 },
    { material: 'Brass', weight: 28.5, value: 27075, percentage: 22, reusable: 5.2, nonReusable: 23.3 },
    { material: 'SS316', weight: 15.4, value: 13475, percentage: 12, reusable: 3.1, nonReusable: 12.3 },
    { material: 'PVDF', weight: 4.8, value: 18000, percentage: 4, reusable: 1.2, nonReusable: 3.6 },
    { material: 'Plastic', weight: 2.5, value: 725, percentage: 2, reusable: 0.8, nonReusable: 1.7 },
  ];

  const operatorPerformanceData = [
    { name: 'John Doe', jobs: 45, scrapPercent: 3.2, efficiency: 96.8, avoidable: 1.2, scrapWeight: 28.5 },
    { name: 'Mike Wilson', jobs: 38, scrapPercent: 4.8, efficiency: 95.2, avoidable: 2.1, scrapWeight: 32.4 },
    { name: 'Sarah Chen', jobs: 52, scrapPercent: 2.9, efficiency: 97.1, avoidable: 0.8, scrapWeight: 24.8 },
    { name: 'David Kumar', jobs: 41, scrapPercent: 5.2, efficiency: 94.8, avoidable: 2.8, scrapWeight: 38.2 },
  ];

  const machineEfficiencyData = [
    { machine: 'HS-01', jobs: 42, scrapPercent: 3.5, utilization: 87, downtime: 24 },
    { machine: 'BS-02', jobs: 38, scrapPercent: 4.2, utilization: 82, downtime: 32 },
    { machine: 'CNC-03', jobs: 35, scrapPercent: 2.8, utilization: 91, downtime: 16 },
    { machine: 'HS-04', jobs: 29, scrapPercent: 5.8, utilization: 76, downtime: 48 },
  ];

  const endPieceUtilizationData = [
    { status: 'Available', count: 45, weight: 125.5, value: 95280 },
    { status: 'Reserved', count: 12, weight: 32.8, value: 24850 },
    { status: 'Used', count: 28, weight: 78.2, value: 59330 },
    { status: 'Scraped', count: 8, weight: 15.4, value: 11680 },
  ];

  const reusableVsNonReusable = [
    { category: 'Reusable', weight: 48.5, value: 36780, percentage: 38 },
    { category: 'Non-Reusable', weight: 78.7, value: 59650, percentage: 62 },
  ];

  const monthlyTrendData = [
    { month: 'Jul', scrap: 145.8, cost: 110420, jobs: 312 },
    { month: 'Aug', scrap: 132.4, cost: 100280, jobs: 298 },
    { month: 'Sep', scrap: 158.6, cost: 120150, jobs: 335 },
    { month: 'Oct', scrap: 128.2, cost: 97080, jobs: 289 },
    { month: 'Nov', scrap: 142.5, cost: 107990, jobs: 318 },
    { month: 'Dec', scrap: 129.2, cost: 97850, jobs: 287 },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const reportTypes = [
    { id: 'daily-scrap', label: 'Daily Scrap Report', icon: TrendingDown },
    { id: 'material-wise', label: 'Material-Wise Scrap', icon: Package },
    { id: 'operator-performance', label: 'Operator Performance', icon: Users },
    { id: 'machine-efficiency', label: 'Machine Efficiency', icon: TrendingUp },
    { id: 'end-piece-utilization', label: 'End Piece Utilization', icon: Package },
    { id: 'reusable-vs-nonreusable', label: 'Reusable vs Non-Reusable', icon: FileText },
    { id: 'monthly-summary', label: 'Monthly Summary', icon: Calendar },
    { id: 'cost-analysis', label: 'Cost Analysis', icon: DollarSign },
  ];

  const exportReport = () => {
    alert(`Exporting ${selectedReport} report to Excel...\nDate Range: ${dateRange.from} to ${dateRange.to}`);
  };

  const printReport = () => {
    alert(`Printing ${selectedReport} report...`);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Reports & Analytics</h1>
        <p className="text-gray-600">Comprehensive reporting for scrap management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Report Type Selector */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-gray-900 mb-3">Report Types</h3>
            <div className="space-y-1">
              {reportTypes.map(report => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id as ReportType)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedReport === report.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <report.icon className="w-4 h-4" />
                  {report.label}
                </button>
              ))}
            </div>

            {/* Date Range Filter */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-gray-900 mb-3 text-sm">Date Range</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">From</label>
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">To</label>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={() => alert('Applying filters...')}
                className="w-full mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Apply Filter
              </button>
            </div>

            {/* Export Options */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-gray-900 mb-3 text-sm">Export</h3>
              <div className="space-y-2">
                <button
                  onClick={exportReport}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export to Excel
                </button>
                <button
                  onClick={printReport}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Print Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow p-6">
            {/* Report Header */}
            <div className="mb-6 pb-4 border-b">
              <h2 className="text-xl text-gray-900 mb-1">
                {reportTypes.find(r => r.id === selectedReport)?.label}
              </h2>
              <p className="text-sm text-gray-600">
                Period: {dateRange.from} to {dateRange.to}
              </p>
            </div>

            {/* Daily Scrap Report */}
            {selectedReport === 'daily-scrap' && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-700">Total Scrap</p>
                    <p className="text-2xl text-blue-900 mt-1">94.8 kg</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-700">Avg Scrap %</p>
                    <p className="text-2xl text-red-900 mt-1">4.2%</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-700">Total Jobs</p>
                    <p className="text-2xl text-green-900 mt-1">57</p>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyScrapData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="scrap" fill="#3B82F6" name="Actual Scrap (kg)" />
                    <Bar dataKey="target" fill="#10B981" name="Target (kg)" />
                  </BarChart>
                </ResponsiveContainer>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs text-gray-700">Date</th>
                        <th className="px-4 py-3 text-right text-xs text-gray-700">Jobs</th>
                        <th className="px-4 py-3 text-right text-xs text-gray-700">Scrap (kg)</th>
                        <th className="px-4 py-3 text-right text-xs text-gray-700">Target (kg)</th>
                        <th className="px-4 py-3 text-right text-xs text-gray-700">Variance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {dailyScrapData.map((row, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 text-sm text-gray-900">{row.date}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{row.jobs}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{row.scrap}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 text-right">{row.target}</td>
                          <td className={`px-4 py-3 text-sm text-right ${
                            row.scrap > row.target ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {row.scrap > row.target ? '+' : ''}{(row.scrap - row.target).toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Material-Wise Report */}
            {selectedReport === 'material-wise' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={materialWiseData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.material}: ${entry.percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="weight"
                      >
                        {materialWiseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={materialWiseData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="material" type="category" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="reusable" fill="#10B981" name="Reusable (kg)" stackId="a" />
                      <Bar dataKey="nonReusable" fill="#EF4444" name="Non-Reusable (kg)" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs text-gray-700">Material</th>
                        <th className="px-4 py-3 text-right text-xs text-gray-700">Weight (kg)</th>
                        <th className="px-4 py-3 text-right text-xs text-gray-700">Reusable</th>
                        <th className="px-4 py-3 text-right text-xs text-gray-700">Non-Reusable</th>
                        <th className="px-4 py-3 text-right text-xs text-gray-700">Value (₹)</th>
                        <th className="px-4 py-3 text-right text-xs text-gray-700">Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {materialWiseData.map((row, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 text-sm text-gray-900">{row.material}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{row.weight}</td>
                          <td className="px-4 py-3 text-sm text-green-600 text-right">{row.reusable}</td>
                          <td className="px-4 py-3 text-sm text-red-600 text-right">{row.nonReusable}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            ₹{row.value.toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">{row.percentage}%</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-medium">
                        <td className="px-4 py-3 text-sm text-gray-900">Total</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {materialWiseData.reduce((sum, row) => sum + row.weight, 0).toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-sm text-green-600 text-right">
                          {materialWiseData.reduce((sum, row) => sum + row.reusable, 0).toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-sm text-red-600 text-right">
                          {materialWiseData.reduce((sum, row) => sum + row.nonReusable, 0).toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          ₹{materialWiseData.reduce((sum, row) => sum + row.value, 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Operator Performance */}
            {selectedReport === 'operator-performance' && (
              <div className="space-y-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={operatorPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="scrapPercent" fill="#EF4444" name="Scrap %" />
                    <Bar dataKey="efficiency" fill="#10B981" name="Efficiency %" />
                  </BarChart>
                </ResponsiveContainer>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs text-gray-700">Operator</th>
                        <th className="px-4 py-3 text-right text-xs text-gray-700">Jobs</th>
                        <th className="px-4 py-3 text-right text-xs text-gray-700">Scrap %</th>
                        <th className="px-4 py-3 text-right text-xs text-gray-700">Efficiency %</th>
                        <th className="px-4 py-3 text-right text-xs text-gray-700">Avoidable %</th>
                        <th className="px-4 py-3 text-right text-xs text-gray-700">Total Scrap (kg)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {operatorPerformanceData.map((row, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 text-sm text-gray-900">{row.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{row.jobs}</td>
                          <td className={`px-4 py-3 text-sm text-right ${
                            row.scrapPercent <= 5 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {row.scrapPercent}%
                          </td>
                          <td className="px-4 py-3 text-sm text-green-600 text-right">{row.efficiency}%</td>
                          <td className="px-4 py-3 text-sm text-red-600 text-right">{row.avoidable}%</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{row.scrapWeight}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Machine Efficiency */}
            {selectedReport === 'machine-efficiency' && (
              <div className="space-y-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={machineEfficiencyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="machine" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="scrapPercent" fill="#EF4444" name="Scrap %" />
                    <Bar dataKey="utilization" fill="#3B82F6" name="Utilization %" />
                  </BarChart>
                </ResponsiveContainer>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs text-gray-700">Machine</th>
                        <th className="px-4 py-3 text-right text-xs text-gray-700">Jobs</th>
                        <th className="px-4 py-3 text-right text-xs text-gray-700">Scrap %</th>
                        <th className="px-4 py-3 text-right text-xs text-gray-700">Utilization %</th>
                        <th className="px-4 py-3 text-right text-xs text-gray-700">Downtime (hrs)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {machineEfficiencyData.map((row, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 text-sm text-gray-900">{row.machine}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{row.jobs}</td>
                          <td className={`px-4 py-3 text-sm text-right ${
                            row.scrapPercent <= 5 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {row.scrapPercent}%
                          </td>
                          <td className="px-4 py-3 text-sm text-blue-600 text-right">{row.utilization}%</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{row.downtime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Reusable vs Non-Reusable */}
            {selectedReport === 'reusable-vs-nonreusable' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <p className="text-sm text-green-700 mb-2">Reusable Scrap</p>
                    <p className="text-3xl text-green-900">{reusableVsNonReusable[0].weight} kg</p>
                    <p className="text-sm text-green-700 mt-1">
                      ₹{reusableVsNonReusable[0].value.toLocaleString('en-IN')} ({reusableVsNonReusable[0].percentage}%)
                    </p>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <p className="text-sm text-red-700 mb-2">Non-Reusable Scrap</p>
                    <p className="text-3xl text-red-900">{reusableVsNonReusable[1].weight} kg</p>
                    <p className="text-sm text-red-700 mt-1">
                      ₹{reusableVsNonReusable[1].value.toLocaleString('en-IN')} ({reusableVsNonReusable[1].percentage}%)
                    </p>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reusableVsNonReusable}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.category}: ${entry.percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="weight"
                    >
                      <Cell fill="#10B981" />
                      <Cell fill="#EF4444" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-blue-900 mb-2">💡 Insights</h3>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>• {reusableVsNonReusable[0].percentage}% of total scrap is reusable - good for cost savings</li>
                    <li>• Focus on converting non-reusable scrap to reusable through better planning</li>
                    <li>• Potential savings: ₹{reusableVsNonReusable[0].value.toLocaleString('en-IN')} in reusable inventory</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Monthly Summary */}
            {selectedReport === 'monthly-summary' && (
              <div className="space-y-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="scrap" stroke="#EF4444" name="Scrap (kg)" />
                    <Line yAxisId="right" type="monotone" dataKey="cost" stroke="#3B82F6" name="Cost (₹)" />
                  </LineChart>
                </ResponsiveContainer>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs text-gray-700">Month</th>
                        <th className="px-4 py-3 text-right text-xs text-gray-700">Jobs</th>
                        <th className="px-4 py-3 text-right text-xs text-gray-700">Scrap (kg)</th>
                        <th className="px-4 py-3 text-right text-xs text-gray-700">Cost (₹)</th>
                        <th className="px-4 py-3 text-right text-xs text-gray-700">Avg/Job (kg)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {monthlyTrendData.map((row, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 text-sm text-gray-900">{row.month}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{row.jobs}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{row.scrap}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            ₹{row.cost.toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">
                            {(row.scrap / row.jobs).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
