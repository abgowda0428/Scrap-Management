import { User } from '../types';
import { Screen } from '../App';
import { 
  LayoutDashboard, 
  Package, 
  Settings, 
  ClipboardList, 
  Scissors, 
  PackageOpen, 
  FileText,
  LogOut,
  Factory,
  Users
} from 'lucide-react';

interface SidebarProps {
  currentUser: User;
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
}

export function Sidebar({ currentUser, currentScreen, onNavigate, onLogout }: SidebarProps) {
  const menuItems = [
    { screen: 'dashboard' as Screen, label: 'Dashboard', icon: LayoutDashboard, roles: ['OPERATOR', 'SUPERVISOR', 'MANAGER', 'ADMIN'] },
    { screen: 'job-list' as Screen, label: 'Cutting Jobs', icon: Scissors, roles: ['OPERATOR', 'SUPERVISOR', 'MANAGER', 'ADMIN'] },
    { screen: 'end-pieces' as Screen, label: 'End Pieces', icon: PackageOpen, roles: ['OPERATOR', 'SUPERVISOR', 'MANAGER', 'ADMIN'] },
    { screen: 'scrap-report' as Screen, label: 'Scrap Reports', icon: FileText, roles: ['SUPERVISOR', 'MANAGER', 'ADMIN'] },
    { screen: 'raw-materials' as Screen, label: 'Raw Materials', icon: Package, roles: ['SUPERVISOR', 'MANAGER', 'ADMIN'] },
    { screen: 'machines' as Screen, label: 'Machines', icon: Settings, roles: ['SUPERVISOR', 'MANAGER', 'ADMIN'] },
    { screen: 'user-management' as Screen, label: 'User Management', icon: Users, roles: ['MANAGER', 'ADMIN'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Factory className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm">Scrap Management</h2>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Logged in as</p>
          <p className="text-sm">{currentUser.fullName}</p>
          <p className="text-xs text-blue-400">{currentUser.role}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.screen;
            
            return (
              <li key={item.screen}>
                <button
                  onClick={() => onNavigate(item.screen)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}