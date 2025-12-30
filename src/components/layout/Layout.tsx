import { ReactNode } from 'react';
import { useApp } from '../../context/AppContext';
import { Screen } from '../MainApp';
import {
  Package,
  LayoutDashboard,
  Scissors,
  Box,
  BarChart3,
  Database,
  Users,
  LogOut,
  Menu
} from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export function Layout({ children, currentScreen, onNavigate }: LayoutProps) {
  const { currentUser, logout } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!currentUser) return null;

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, screen: 'dashboard' as Screen, roles: ['OPERATOR', 'SUPERVISOR', 'MANAGER', 'ADMIN'] },
    { name: 'Cutting Jobs', icon: Scissors, screen: 'jobs' as Screen, roles: ['OPERATOR', 'SUPERVISOR', 'MANAGER', 'ADMIN'] },
    { name: 'End Pieces', icon: Box, screen: 'endpieces' as Screen, roles: ['OPERATOR', 'SUPERVISOR', 'MANAGER', 'ADMIN'] },
    { name: 'Reports', icon: BarChart3, screen: 'reports' as Screen, roles: ['SUPERVISOR', 'MANAGER', 'ADMIN'] },
    { name: 'Materials', icon: Database, screen: 'materials' as Screen, roles: ['SUPERVISOR', 'MANAGER', 'ADMIN'] },
    { name: 'Users', icon: Users, screen: 'users' as Screen, roles: ['ADMIN'] },
  ];

  const visibleNav = navigation.filter(item => item.roles.includes(currentUser.role));

  const roleColors = {
    OPERATOR: 'bg-green-100 text-green-800',
    SUPERVISOR: 'bg-purple-100 text-purple-800',
    MANAGER: 'bg-blue-100 text-blue-800',
    ADMIN: 'bg-orange-100 text-orange-800'
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="w-6 h-6 text-white" />
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <h2 className="text-blue-900 truncate text-sm">Scrap Mgmt</h2>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {visibleNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.screen;
              
              return (
                <button
                  key={item.name}
                  onClick={() => onNavigate(item.screen)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  title={!sidebarOpen ? item.name : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm">{item.name}</span>}
                </button>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-200">
            {sidebarOpen && (
              <div className="mb-3">
                <p className="text-sm text-gray-900 truncate">{currentUser.fullName}</p>
                <p className="text-xs text-gray-500 truncate">{currentUser.employeeId}</p>
                <div className="mt-2">
                  <span className={`inline-block px-2 py-1 text-xs rounded ${roleColors[currentUser.role]}`}>
                    {currentUser.role}
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm">Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-gray-900">
                  {visibleNav.find(item => item.screen === currentScreen)?.name || 'Dashboard'}
                </h1>
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
