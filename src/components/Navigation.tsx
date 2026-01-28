// import { 
//   LayoutDashboard, 
//   Plus, 
//   Scissors, 
//   Trash2, 
//   Recycle, 
//   BarChart3, 
//   LogOut,
//   Factory,
//   Settings,
//   Users,
//   Package,
//   Menu,
//   X,
//   CheckSquare,
//   Ruler
// } from 'lucide-react';
// import { useApp } from '../context/AppContext';
// import { useState } from 'react';
// import autocratLogo from 'figma:asset/1ad85b15198cdb675e83e1093de980f6661c927d.png';

// export function Navigation() {
//   const { currentUser, currentScreen, setCurrentScreen, setCurrentUser } = useApp();
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   const handleLogout = () => {
//     setCurrentUser(null);
//     setCurrentScreen('login');
//   };

//   const handleNavigation = (screenId: string) => {
//     setCurrentScreen(screenId);
//     setIsMobileMenuOpen(false); // Close mobile menu after navigation
//   };

//   const menuItems = [
//     { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['OPERATOR', 'SUPERVISOR', 'MANAGER'] },
//     { id: 'create-job', label: 'Create Job', icon: Plus, roles: ['OPERATOR', 'SUPERVISOR', 'MANAGER'] },
//     { id: 'my-jobs', label: 'My Jobs', icon: Scissors, roles: ['OPERATOR', 'SUPERVISOR', 'MANAGER'] },
//     { id: 'scrap-entry', label: 'Log Scrap', icon: Trash2, roles: ['OPERATOR', 'SUPERVISOR', 'MANAGER'] },
//     { id: 'cut-pieces', label: 'Cut Pieces', icon: Ruler, roles: ['OPERATOR', 'SUPERVISOR', 'MANAGER'] },
//     { id: 'approval-dashboard', label: 'Approvals', icon: CheckSquare, roles: ['SUPERVISOR', 'MANAGER'] },
//     { id: 'end-pieces', label: 'End Pieces', icon: Recycle, roles: ['OPERATOR', 'SUPERVISOR', 'MANAGER'] },
//     { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['SUPERVISOR', 'MANAGER'] },
//     { id: 'materials', label: 'Materials', icon: Package, roles: ['SUPERVISOR', 'MANAGER'] },
//     { id: 'user-management', label: 'Users', icon: Users, roles: ['MANAGER'] },
//   ];

//   const visibleMenuItems = menuItems.filter(item => 
//     currentUser && item.roles.includes(currentUser.role)
//   );

//   const isOperator = currentUser?.role === 'OPERATOR';

//   return (
//     <>
//       {/* Mobile Header (Operators only) */}
//       {isOperator && (
//         <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
//           <div className="flex items-center justify-between p-4">
//             <div className="flex items-center gap-3">
//               <img 
//                 src={autocratLogo} 
//                 alt="Autocrat Engineers" 
//                 className="h-8 w-auto"
//               />
//               <div>
//                 <h2 className="text-gray-900 text-sm">Scrap MS</h2>
//                 <p className="text-xs text-gray-500">{currentUser?.full_name}</p>
//               </div>
//             </div>
//             <button
//               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//               className="p-2 hover:bg-gray-100 rounded-lg"
//             >
//               {isMobileMenuOpen ? (
//                 <X className="w-6 h-6 text-gray-700" />
//               ) : (
//                 <Menu className="w-6 h-6 text-gray-700" />
//               )}
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Desktop Sidebar (Always visible for Supervisor/Manager) */}
//       <div className={`bg-white border-r border-gray-200 w-64 min-h-screen flex flex-col ${
//         isOperator ? 'hidden lg:flex' : 'flex'
//       }`}>
//         {/* Header */}
//         <div className="p-6 border-b border-gray-200">
//           <div className="flex flex-col items-center gap-3">
//             <img 
//               src={autocratLogo} 
//               alt="Autocrat Engineers" 
//               className="h-12 w-auto"
//             />
//             <div className="text-center">
//               <h2 className="text-gray-900 text-sm">Scrap Management</h2>
//               <p className="text-xs text-gray-500">Autocrat Engineers</p>
//             </div>
//           </div>
//         </div>

//         {/* User Info */}
//         <div className="p-4 border-b border-gray-200">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
//               <span className="text-blue-600">{currentUser?.full_name.charAt(0)}</span>
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="text-sm text-gray-900 truncate">{currentUser?.full_name}</p>
//               <p className="text-xs text-gray-500">{currentUser?.role}</p>
//             </div>
//           </div>
//         </div>

//         {/* Navigation Menu */}
//         <nav className="flex-1 p-4">
//           <ul className="space-y-1">
//             {visibleMenuItems.map(item => (
//               <li key={item.id}>
//                 <button
//                   onClick={() => handleNavigation(item.id)}
//                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
//                     currentScreen === item.id
//                       ? 'bg-blue-50 text-blue-600'
//                       : 'text-gray-700 hover:bg-gray-50'
//                   }`}
//                 >
//                   <item.icon className="w-5 h-5" />
//                   <span className="text-sm">{item.label}</span>
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </nav>

//         {/* Footer */}
//         <div className="p-4 border-t border-gray-200">
//           <button
//             onClick={handleLogout}
//             className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
//           >
//             <LogOut className="w-5 h-5" />
//             <span className="text-sm">Logout</span>
//           </button>
//         </div>
//       </div>

//       {/* Mobile Menu Overlay (Operators only) */}
//       {isOperator && isMobileMenuOpen && (
//         <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileMenuOpen(false)}>
//           <div className="bg-white w-64 h-full shadow-xl" onClick={(e) => e.stopPropagation()}>
//             <div className="p-4 border-b border-gray-200">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
//                   <span className="text-blue-600">{currentUser?.full_name.charAt(0)}</span>
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm text-gray-900 truncate">{currentUser?.full_name}</p>
//                   <p className="text-xs text-gray-500">{currentUser?.role}</p>
//                 </div>
//               </div>
//             </div>

//             <nav className="p-4">
//               <ul className="space-y-1">
//                 {visibleMenuItems.map(item => (
//                   <li key={item.id}>
//                     <button
//                       onClick={() => handleNavigation(item.id)}
//                       className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
//                         currentScreen === item.id
//                           ? 'bg-blue-50 text-blue-600'
//                           : 'text-gray-700 hover:bg-gray-50'
//                       }`}
//                     >
//                       <item.icon className="w-5 h-5" />
//                       <span className="text-sm">{item.label}</span>
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </nav>

//             <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
//               <button
//                 onClick={handleLogout}
//                 className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
//               >
//                 <LogOut className="w-5 h-5" />
//                 <span className="text-sm">Logout</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }



import {
  LayoutDashboard,
  Plus,
  Scissors,
  Trash2,
  Recycle,
  BarChart3,
  LogOut,
  Users,
  Package,
  Menu,
  X,
  CheckSquare,
  Ruler,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useState } from 'react';
import { supabase } from '../src/config/supabase';
import autocratLogo from 'figma:asset/1ad85b15198cdb675e83e1093de980f6661c927d.png';

export function Navigation() {
  const { currentUser, currentScreen, setCurrentScreen, setCurrentUser } =
    useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!currentUser) return null;

  const role = currentUser.role; // OPERATOR | SUPERVISOR | MANAGER
  const isOperator = role === 'OPERATOR';

  // ================= LOGOUT =================
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setCurrentScreen('login');
  };

  const handleNavigation = (screenId: string) => {
    setCurrentScreen(screenId);
    setIsMobileMenuOpen(false);
  };

  // ================= ROLE-BASED MENU =================
  // const menuItems = [
  //   { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['OPERATOR', 'SUPERVISOR', 'MANAGER'] },
  //   { id: 'create-job', label: 'Create Job', icon: Plus, roles: ['OPERATOR', 'SUPERVISOR', 'MANAGER'] },
  //   { id: 'my-jobs', label: 'My Jobs', icon: Scissors, roles: ['OPERATOR', 'SUPERVISOR', 'MANAGER'] },
  //   { id: 'scrap-entry', label: 'Log Scrap', icon: Trash2, roles: ['OPERATOR', 'SUPERVISOR', 'MANAGER'] },
  //   { id: 'cut-pieces', label: 'Cut Pieces', icon: Ruler, roles: ['OPERATOR', 'SUPERVISOR', 'MANAGER'] },
  //   { id: 'approval-dashboard', label: 'Approvals', icon: CheckSquare, roles: ['SUPERVISOR', 'MANAGER'] },
  //   { id: 'end-pieces', label: 'End Pieces', icon: Recycle, roles: ['OPERATOR', 'SUPERVISOR', 'MANAGER'] },
  //   { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['SUPERVISOR', 'MANAGER'] },
  //   { id: 'materials', label: 'Materials', icon: Package, roles: ['SUPERVISOR', 'MANAGER'] },
  //   { id: 'user-management', label: 'Users', icon: Users, roles: ['MANAGER'] },
  // ];

//   const menuItems = [
//   // ===== COMMON =====
//   {
//     id: 'dashboard',
//     label: 'Dashboard',
//     icon: LayoutDashboard,
//     roles: ['OPERATOR', 'SUPERVISOR', 'MANAGER'],
//   },

//   // ===== OPERATOR =====
//   {
//     id: 'create-job',
//     label: 'Create Job',
//     icon: Plus,
//     roles: ['OPERATOR', 'SUPERVISOR', 'MANAGER'],
//   },
//   {
//     id: 'my-jobs',
//     label: 'My Jobs',
//     icon: Scissors,
//     roles: ['OPERATOR', 'SUPERVISOR'],
//   },
//   {
//     id: 'scrap-entry',
//     label: 'Log Scrap',
//     icon: Trash2,
//     roles: ['OPERATOR', 'SUPERVISOR'],
//   },
//   {
//     id: 'cut-pieces',
//     label: 'Cut Pieces',
//     icon: Ruler,
//     roles: ['OPERATOR', 'SUPERVISOR', 'MANAGER'],
//   },
//   {
//     id: 'end-pieces',
//     label: 'End Pieces',
//     icon: Recycle,
//     roles: ['OPERATOR', 'SUPERVISOR'],
//   },

//   // ===== SUPERVISOR =====
//   {
//     id: 'approval-dashboard',
//     label: 'Approvals',
//     icon: CheckSquare,
//     roles: ['SUPERVISOR'],
//   },
//   {
//     id: 'reports',
//     label: 'Reports',
//     icon: BarChart3,
//     roles: ['SUPERVISOR', 'MANAGER'],
//   },
//   {
//     id: 'materials',
//     label: 'Materials',
//     icon: Package,
//     roles: ['SUPERVISOR', 'MANAGER'],
//   },

//   // ===== MANAGER ONLY =====
//   {
//     id: 'user-management',
//     label: 'Users',
//     icon: Users,
//     roles: ['MANAGER'],
//   },
// ];

  const menuItems = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        roles: ['OPERATOR', 'SUPERVISOR', 'MANAGER'],
      },

      {
        id: 'create-job',
        label: 'Create Job',
        icon: Plus,
        roles: ['OPERATOR', 'SUPERVISOR','MANAGER'],
      },

      {
        id: 'my-jobs',
        label: 'My Jobs',
        icon: Scissors,
        roles: ['OPERATOR', 'SUPERVISOR','MANAGER'],
      },

      {
        id: 'scrap-entry',
        label: 'Log Scrap',
        icon: Trash2,
        roles: ['OPERATOR', 'SUPERVISOR','MANAGER'],
      },

      {
        id: 'cut-pieces',
        label: 'Cut Pieces',
        icon: Ruler,
        roles: ['OPERATOR', 'SUPERVISOR', 'MANAGER'],
      },

      {
        id: 'end-pieces',
        label: 'End Pieces',
        icon: Recycle,
        roles: ['OPERATOR', 'SUPERVISOR','MANAGER'],
      },

      {
        id: 'approval-dashboard',
        label: 'Approvals',
        icon: CheckSquare,
        roles: ['SUPERVISOR','MANAGER'],
      },

      {
        id: 'reports',
        label: 'Reports',
        icon: BarChart3,
        roles: ['SUPERVISOR', 'MANAGER'],
      },

      {
        id: 'materials',
        label: 'Materials',
        icon: Package,
        roles: ['SUPERVISOR', 'MANAGER','OPERATOR'],
      },

      {
        id: 'user-management',
        label: 'Users',
        icon: Users,
        roles: ['MANAGER'],
      },
    ];



  // const visibleMenuItems = menuItems.filter((item) =>
  //   item.roles.includes(role)
  // );

  const visibleMenuItems = menuItems.filter(
    item => currentUser && item.roles.includes(currentUser.role)
  );

  console.log('NAV ROLE:', currentUser?.role);
  console.log('VISIBLE MENU:', visibleMenuItems.map(i => i.id));

  // ================= UI =================
  return (
    <>
      {/* ================= MOBILE HEADER (OPERATOR) ================= */}
      {isOperator && (
        <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <img src={autocratLogo} alt="Autocrat" className="h-8 w-auto" />
              <div>
                <h2 className="text-gray-900 text-sm">Scrap MS</h2>
                <p className="text-xs text-gray-500">
                  {currentUser.full_name}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* ================= SIDEBAR ================= */}
      <div
        className={`bg-white border-r border-gray-200 w-64 min-h-screen flex flex-col ${
          isOperator ? 'hidden lg:flex' : 'flex'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 text-center">
          <img src={autocratLogo} className="h-12 mx-auto" />
          <p className="text-xs text-gray-500 mt-2">
            {currentUser.role}
          </p>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {visibleMenuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                    currentScreen === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {isOperator && isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="bg-white w-64 h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="p-4">
              {visibleMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}