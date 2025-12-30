import { Machine } from '../types';
import { Settings, MapPin, Calendar } from 'lucide-react';

interface MachineListProps {
  machines: Machine[];
}

export function MachineList({ machines }: MachineListProps) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Machine Inventory</h1>
        <p className="text-gray-600">Manage cutting machines and equipment</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {machines.map((machine) => {
          const daysSinceMainten = Math.floor(
            (new Date().getTime() - new Date(machine.lastMaintenanceDate).getTime()) / (1000 * 60 * 60 * 24)
          );
          const maintenanceStatus = daysSinceMainten > 60 ? 'overdue' : daysSinceMainten > 30 ? 'due' : 'ok';

          return (
            <div key={machine.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Settings className="w-6 h-6 text-blue-600" />
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
                  machine.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  machine.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {machine.status}
                </span>
              </div>

              <h3 className="text-gray-900 mb-1">{machine.machineName}</h3>
              <p className="text-sm text-gray-600 mb-4">{machine.machineCode}</p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Settings className="w-4 h-4" />
                  <span>{machine.machineType}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{machine.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Last maintenance: {new Date(machine.lastMaintenanceDate).toLocaleDateString()}</span>
                </div>
              </div>

              {maintenanceStatus !== 'ok' && (
                <div className={`mt-4 p-3 rounded-lg text-sm ${
                  maintenanceStatus === 'overdue' ? 'bg-red-50 text-red-800' : 'bg-yellow-50 text-yellow-800'
                }`}>
                  {maintenanceStatus === 'overdue' ? '⚠️ Maintenance overdue' : '⏰ Maintenance due soon'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
