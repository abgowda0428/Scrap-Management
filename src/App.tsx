// import { AppProvider, useApp } from './context/AppContext';
// import { Login } from './components/Login';
// import { Navigation } from './components/Navigation';
// import { Dashboard } from './components/Dashboard';
// import { CreateCuttingJob } from './components/CreateCuttingJob';
// import { MyJobs } from './components/MyJobs';
// import { EndPieces } from './components/EndPieces';
// import { Reports } from './components/Reports';
// import { ReportsEnhanced } from './components/ReportsEnhanced';
// import { ScrapEntry } from './components/ScrapEntry';
// import { SupervisorApproval } from './components/SupervisorApproval';
// import { JobCompletion } from './components/JobCompletion';
// import { CuttingOperationEntry } from './components/CuttingOperationEntry';
// import { CuttingOperationEntryEnhanced } from './components/CuttingOperationEntryEnhanced';
// import { UserManagementEnhanced } from './components/UserManagementEnhanced';
// import { ApprovalDashboard } from './components/ApprovalDashboard';
// import { CutPiecesTracking } from './components/CutPiecesTracking';
// import { mockMaterials } from './data/mockData';
// import { useEffect } from 'react';
// import autocratLogo from 'figma:asset/1ad85b15198cdb675e83e1093de980f6661c927d.png';

// function AppContent() {
//   const { currentUser, currentScreen } = useApp();

//   // Set page title and favicon
//   useEffect(() => {
//     document.title = 'Autocrat Engineers - Scrap Management System';
    
//     // Set favicon using the logo
//     const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
//     link.type = 'image/png';
//     link.rel = 'icon';
//     link.href = autocratLogo;
//     document.head.appendChild(link);
//   }, []);

//   if (!currentUser) {
//     return <Login />;
//   }

//   const isOperator = currentUser.role === 'OPERATOR';

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <Navigation />
//       <main className={`flex-1 ${isOperator ? 'pt-20 lg:pt-0 p-4 lg:p-8' : 'p-8'}`}>
//         {currentScreen === 'dashboard' && <Dashboard />}
//         {currentScreen === 'create-job' && <CreateCuttingJob />}
//         {currentScreen === 'my-jobs' && <MyJobs />}
//         {currentScreen === 'end-pieces' && <EndPieces />}
//         {currentScreen === 'reports' && <Reports />}
//         {currentScreen === 'scrap-entry' && <ScrapEntry />}
//         {currentScreen === 'cut-pieces' && <CutPiecesTracking />}
//         {currentScreen === 'approval-dashboard' && <ApprovalDashboard />}
//         {currentScreen === 'materials' && <Materials />}
//         {currentScreen === 'user-management' && <UserManagementEnhanced />}
//       </main>
//     </div>
//   );
// }

// function Materials() {
//   const { setCurrentScreen } = useApp();
  
//   return (
//     <div>
//       <div className="mb-6">
//         <h1 className="text-gray-900">Raw Material Master</h1>
//         <p className="text-gray-600 mt-1">Manage raw material inventory</p>
//       </div>

//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Item Code</th>
//                 <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Material Identification</th>
//                 <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Category</th>
//                 <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Grade</th>
//                 <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Stock (kg)</th>
//                 <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Cost/kg</th>
//                 <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Supplier</th>
//                 <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Status</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {mockMaterials.map((material: any) => (
//                 <tr key={material.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 text-sm text-gray-900">{material.item_code}</td>
//                   <td className="px-6 py-4 text-sm text-gray-900">{material.material_identification}</td>
//                   <td className="px-6 py-4 text-sm text-gray-600">{material.material_category}</td>
//                   <td className="px-6 py-4 text-sm text-gray-900">{material.material_grade}</td>
//                   <td className="px-6 py-4 text-sm text-gray-900">
//                     {material.current_stock_qty} kg
//                   </td>
//                   <td className="px-6 py-4 text-sm text-gray-900">
//                     ₹{material.cost_per_kg}
//                   </td>
//                   <td className="px-6 py-4 text-sm text-gray-900">{material.supplier_name}</td>
//                   <td className="px-6 py-4">
//                     <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
//                       material.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
//                     }`}>
//                       {material.status}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function App() {
//   return (
//     <AppProvider>
//       <AppContent />
//     </AppProvider>
//   );
// }



import { AppProvider, useApp } from './context/AppContext';
import { Login } from './components/Login';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { CreateCuttingJob } from './components/CreateCuttingJob';
import { MyJobs } from './components/MyJobs';
import { EndPieces } from './components/EndPieces';
import { Reports } from './components/Reports';
import { ScrapEntry } from './components/ScrapEntry';
import { UserManagementEnhanced } from './components/UserManagementEnhanced';
import { ApprovalDashboard } from './components/ApprovalDashboard';
import { CutPiecesTracking } from './components/CutPiecesTracking';
import { useEffect } from 'react';
import { RawMaterialPage } from './pages/RawMaterialPage';

import autocratLogo from 'figma:asset/1ad85b15198cdb675e83e1093de980f6661c927d.png';
import { ROLE_PERMISSIONS } from '../src//config/permissions';
import { AccessDenied } from './components/AccessDenied';





// function AppContent() {
//   const { currentUser, currentScreen } = useApp();

//   console.log('CURRENT USER:', currentUser);
//   console.log('CURRENT SCREEN:', currentScreen);

//   useEffect(() => {
//     document.title = 'Autocrat Engineers - Scrap Management System';

//     const link =
//       (document.querySelector("link[rel*='icon']") as HTMLLinkElement) ||
//       document.createElement('link');
//     link.type = 'image/png';
//     link.rel = 'icon';
//     link.href = autocratLogo;
//     document.head.appendChild(link);
//   }, []);

//   // Not logged in → Login
//   if (!currentUser) {
//     return <Login />;
//   }

//   // ================= ROLE FLAGS =================
//   const role = currentUser.role;

//   const isOperator = role === 'OPERATOR';
//   const isSupervisor = role === 'SUPERVISOR';
//   const isManager = role === 'MANAGER';

//   // ================= LAYOUT =================
//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <Navigation />

//       <main className={`flex-1 ${isOperator ? 'pt-20 lg:pt-0 p-4 lg:p-8' : 'p-8'}`}>

//         {/* ===== DEFAULT (ALWAYS SAFE) ===== */}
//         {/* {(!currentScreen || currentScreen === 'dashboard') && <Dashboard />} */}

//         {currentScreen === 'dashboard' && <Dashboard />}

//         {/* ===== OPERATOR ===== */}
//         {isOperator && currentScreen === 'my-jobs' && <MyJobs />}
//         {isOperator && currentScreen === 'scrap-entry' && <ScrapEntry />}
//         {isOperator && currentScreen === 'end-pieces' && <EndPieces />}
//         {isOperator && currentScreen === 'create-job' && <CreateCuttingJob />}
//         {isOperator && currentScreen === 'cut-pieces' && <CutPiecesTracking />}

//         {/* ===== SUPERVISOR ===== */}
//         {(isSupervisor || isManager) && currentScreen === 'my-jobs' && <MyJobs />}
//         {(isSupervisor || isManager) && currentScreen === 'scrap-entry' && <ScrapEntry />}
//         {(isSupervisor || isManager) && currentScreen === 'end-pieces' && <EndPieces />}
//         {(isSupervisor || isManager) && currentScreen === 'create-job' && <CreateCuttingJob />}
//         {(isSupervisor || isManager) && currentScreen === 'cut-pieces' && <CutPiecesTracking />}
//         {(isSupervisor || isManager) && currentScreen === 'approval-dashboard' && (
//           <ApprovalDashboard />
//         )}
//         {(isSupervisor || isManager) && currentScreen === 'reports' && <Reports />}

//         {/* ===== MANAGER / ADMIN ===== */}
//         {isManager && currentScreen === 'create-job' && <CreateCuttingJob />}
//         {isManager && currentScreen === 'cut-pieces' && <CutPiecesTracking />}
//         {isManager && currentScreen === 'user-management' && (
//           <UserManagementEnhanced />
//         )}

//       </main>
//     </div>
//   );
// }

  function AppContent() {
  const { currentUser, currentScreen } = useApp();

  // console.log('CURRENT USER:', currentUser);
  // console.log('CURRENT SCREEN:', currentScreen);

  useEffect(() => {
    document.title = 'Autocrat Engineers - Scrap Management System';

    const link =
      (document.querySelector("link[rel*='icon']") as HTMLLinkElement) ||
      document.createElement('link');
    link.type = 'image/png';
    link.rel = 'icon';
    link.href = autocratLogo;
    document.head.appendChild(link);
  }, []);

  // useEffect(() => {
  // const { data: authListener } = supabase.auth.onAuthStateChange(
  //   async (event, session) => {
  //     if (event === 'SIGNED_IN' && session?.user) {
  //       await supabase
  //         .from('users')
  //         .update({ last_login: new Date().toISOString() })
  //         .eq('id', session.user.id);
  //     }
  //   }
  // );

  // // 🔁 Cleanup listener on unmount
  // return () => {
  //   authListener.subscription.unsubscribe();
  // };
  // }, []);


  // 🔐 Not logged in → Login
  if (!currentUser) {
    return <Login />;
  }

  // ================= ROLE PERMISSIONS =================
  const ROLE_PERMISSIONS: Record<string, string[]> = {
    OPERATOR: [
      'dashboard',
      'create-job',
      'my-jobs',
      'scrap-entry',
      'cut-pieces',
      'end-pieces',
    ],

    SUPERVISOR: [
      'dashboard',
      'create-job',
      'my-jobs',
      'scrap-entry',
      'cut-pieces',
      'end-pieces',
      'approval-dashboard',
      'reports',
      'materials',
    ],

    MANAGER: [
      'dashboard',
      'create-job',
      'my-jobs',
      'materials',
      'user-management',
    ],
  };

  //  MANAGER: [
  //     'dashboard',
  //     'create-job',
  //     'my-jobs',
  //     'scrap-entry',
  //     'cut-pieces',
  //     'end-pieces',
  //     'materials',
  //     'reports',
  //     'user-management',
  //     'approval-dashboard'
  //   ],

  const allowedScreens = ROLE_PERMISSIONS[currentUser.role] || [];

  // 🚫 HARD BLOCK: screen not allowed for role
  if (!allowedScreens.includes(currentScreen)) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Navigation />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-red-600 mb-2">Access Denied</h1>
            <p className="text-gray-600">
              You don’t have permission to access this page.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ================= MAIN LAYOUT =================
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navigation />

      <main className="flex-1 p-8">
        {currentScreen === 'dashboard' && <Dashboard />}
        {currentScreen === 'create-job' && <CreateCuttingJob />}
        {currentScreen === 'my-jobs' && <MyJobs />}
        {currentScreen === 'scrap-entry' && <ScrapEntry />}
        {currentScreen === 'cut-pieces' && <CutPiecesTracking />}
        {currentScreen === 'end-pieces' && <EndPieces />}
        {currentScreen === 'approval-dashboard' && <ApprovalDashboard />}
        {currentScreen === 'reports' && <Reports />}
        {currentScreen === 'materials' && <RawMaterialPage />}
        {currentScreen === 'user-management' && <UserManagementEnhanced />}
      </main>
    </div>
  );
}
 

// ================= MATERIALS (TEMP MOCK) =================
function Materials() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-gray-900">Raw Material Master</h1>
        <p className="text-gray-600 mt-1">Manage raw material inventory</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Item Code</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Material</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Grade</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Cost/kg</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockMaterials.map((m: any) => (
                <tr key={m.id}>
                  <td className="px-6 py-4">{m.item_code}</td>
                  <td className="px-6 py-4">{m.material_identification}</td>
                  <td className="px-6 py-4">{m.material_category}</td>
                  <td className="px-6 py-4">{m.material_grade}</td>
                  <td className="px-6 py-4">{m.current_stock_qty}</td>
                  <td className="px-6 py-4">₹{m.cost_per_kg}</td>
                  <td className="px-6 py-4">{m.supplier_name}</td>
                  <td className="px-6 py-4">{m.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ================= ROOT =================
export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
