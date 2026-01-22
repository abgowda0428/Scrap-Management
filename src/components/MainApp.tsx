import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Login } from './auth/Login';
import { Layout } from './layout/Layout';
import { DashboardOperator } from './dashboards/DashboardOperator';
import { DashboardSupervisor } from './dashboards/DashboardSupervisor';
import { DashboardManager } from './dashboards/DashboardManager';
import CuttingJobList from './components/jobs/CuttingJobList';


import { CuttingJobForm } from './jobs/CuttingJobForm';
import { CuttingOperationEntry } from './operations/CuttingOperationEntry';
import { EndPieceInventory } from './endpieces/EndPieceInventory';
import { ScrapReports } from './reports/ScrapReports';
import { RawMaterialList } from './materials/RawMaterialList';
import { UserManagement } from './admin/UserManagement';

export type Screen = 
  | 'dashboard' 
  | 'jobs' 
  | 'create-job' 
  | 'edit-job'
  | 'cutting-operation'
  | 'endpieces' 
  | 'reports' 
  | 'materials'
  | 'users';

export function MainApp() {
  const { currentUser } = useApp();
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  if (!currentUser) {
    return <Login />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        if (currentUser.role === 'OPERATOR') {
          return <DashboardOperator onNavigate={setCurrentScreen} />;
        } else if (currentUser.role === 'SUPERVISOR') {
          return <DashboardSupervisor onNavigate={setCurrentScreen} />;
        } else {
          return <DashboardManager onNavigate={setCurrentScreen} />;
        }
      
      case 'jobs':
        return <CuttingJobList onNavigate={setCurrentScreen} onSelectJob={setSelectedJobId} />;
        
      
      case 'create-job':
        return <CuttingJobForm onNavigate={setCurrentScreen} />;
      
      case 'edit-job':
        return <CuttingJobForm jobId={selectedJobId || undefined} onNavigate={setCurrentScreen} />;
      
      case 'cutting-operation':
        return <CuttingOperationEntry jobId={selectedJobId || ''} onNavigate={setCurrentScreen} />;
      
      case 'endpieces':
        return <EndPieceInventory />;
      
      case 'reports':
        return <ScrapReports />;
      
      case 'materials':
        return <RawMaterialList />;
      
      case 'users':
        return <UserManagement />;
      
      default:
        return <DashboardOperator onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <Layout currentScreen={currentScreen} onNavigate={setCurrentScreen}>
      {renderScreen()}
    </Layout>
  );
}
