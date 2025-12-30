import { useApp } from '../../context/AppContext';
import { Screen } from '../MainApp';
import { Package, AlertTriangle, Box, Plus, PlayCircle } from 'lucide-react';

interface DashboardOperatorProps {
  onNavigate: (screen: Screen) => void;
}

export function DashboardOperator({ onNavigate }: DashboardOperatorProps) {
  const { currentUser, cuttingJobs, scrapEntries, endPieces } = useApp();

  // Filter data for current operator
  const myJobs = cuttingJobs.filter(job => job.operatorId === currentUser?.id);
  const todayJobs = myJobs.filter(job => job.jobDate === new Date().toISOString().split('T')[0]);
  const myInProgressJobs = todayJobs.filter(job => job.status === 'IN_PROGRESS');
  const myCompletedToday = todayJobs.filter(job => job.status === 'COMPLETED');
  
  const myScrap = scrapEntries.filter(scrap => scrap.operatorId === currentUser?.id);
  const myScrapToday = myScrap.filter(scrap => scrap.scrapDate === new Date().toISOString().split('T')[0]);
  
  const totalScrapWeightToday = myScrapToday.reduce((sum, s) => sum + s.scrapWeight, 0);
  const totalInputWeightToday = todayJobs.reduce((sum, j) => sum + j.totalInputWeight, 0);
  const scrapPercentageToday = totalInputWeightToday > 0 
    ? (totalScrapWeightToday / totalInputWeightToday) * 100 
    : 0;

  // Weekly stats
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().split('T')[0];
  
  const myScrapThisWeek = myScrap.filter(scrap => scrap.scrapDate >= weekAgoStr);
  const myJobsThisWeek = myJobs.filter(job => job.jobDate >= weekAgoStr);
  
  const totalScrapWeightWeek = myScrapThisWeek.reduce((sum, s) => sum + s.scrapWeight, 0);
  const totalInputWeightWeek = myJobsThisWeek.reduce((sum, j) => sum + j.totalInputWeight, 0);
  const scrapPercentageWeek = totalInputWeightWeek > 0 
    ? (totalScrapWeightWeek / totalInputWeightWeek) * 100 
    : 0;

  const myEndPieces = endPieces.filter(ep => {
    const job = cuttingJobs.find(j => j.id === ep.cuttingJobId);
    return job?.operatorId === currentUser?.id;
  });

  const stats = [
    {
      label: 'Jobs Today',
      value: `${myCompletedToday.length + myInProgressJobs.length}`,
      subtext: `${myCompletedToday.length} completed, ${myInProgressJobs.length} in progress`,
      icon: Package,
      color: 'blue'
    },
    {
      label: 'My Scrap % Today',
      value: `${scrapPercentageToday.toFixed(1)}%`,
      subtext: `${totalScrapWeightToday.toFixed(1)} kg scrap`,
      icon: AlertTriangle,
      color: scrapPercentageToday > 5 ? 'red' : 'green'
    },
    {
      label: 'My Scrap % This Week',
      value: `${scrapPercentageWeek.toFixed(1)}%`,
      subtext: `${totalScrapWeightWeek.toFixed(1)} kg scrap`,
      icon: AlertTriangle,
      color: scrapPercentageWeek > 5 ? 'orange' : 'green'
    },
    {
      label: 'End Pieces Created',
      value: myEndPieces.filter(ep => ep.status === 'AVAILABLE').length.toString(),
      subtext: `${myEndPieces.length} total`,
      icon: Box,
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
      {/* Welcome */}
      <div>
        <h2 className="mb-2">Welcome back, {currentUser?.fullName?.split(' ')[0]}!</h2>
        <p className="text-gray-600">Here&apos;s your performance overview</p>
      </div>

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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('create-job')}
          className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-4"
        >
          <Plus className="w-8 h-8" />
          <div className="text-left">
            <p>Create New Job</p>
            <p className="text-sm text-blue-100">Start a cutting job</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('jobs')}
          className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-4"
        >
          <PlayCircle className="w-8 h-8" />
          <div className="text-left">
            <p>View My Jobs</p>
            <p className="text-sm text-green-100">Active and completed</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('endpieces')}
          className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-4"
        >
          <Box className="w-8 h-8" />
          <div className="text-left">
            <p>End Pieces</p>
            <p className="text-sm text-purple-100">Search inventory</p>
          </div>
        </button>
      </div>

      {/* Active Jobs */}
      {myInProgressJobs.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3>Active Jobs ({myInProgressJobs.length})</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {myInProgressJobs.map(job => {
              const material = cuttingJobs.find(j => j.id === job.id);
              return (
                <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-gray-900 mb-1">{job.jobOrderNo}</h4>
                      <p className="text-sm text-gray-600">
                        Started: {new Date(job.createdAt).toLocaleTimeString()}
                      </p>
                      <div className="mt-2 flex gap-4 text-sm">
                        <span className="text-gray-600">
                          Progress: {job.actualOutputQty}/{job.plannedOutputQty} pieces
                        </span>
                        <span className={`${job.scrapPercentage > 5 ? 'text-red-600' : 'text-green-600'}`}>
                          Scrap: {job.scrapPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate('jobs')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Performance Alerts */}
      {scrapPercentageToday > 7 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-900">High Scrap Alert</p>
            <p className="text-sm text-yellow-700 mt-1">
              Your scrap percentage today ({scrapPercentageToday.toFixed(1)}%) is above the target of 5%. 
              Please review your cutting operations and consult your supervisor if needed.
            </p>
          </div>
        </div>
      )}

      {scrapPercentageToday < 4 && myCompletedToday.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <Package className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-900">Excellent Performance!</p>
            <p className="text-sm text-green-700 mt-1">
              Your scrap percentage today ({scrapPercentageToday.toFixed(1)}%) is excellent. Keep up the great work!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
