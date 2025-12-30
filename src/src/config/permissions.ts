export type Screen =
  | 'dashboard'
  | 'create-job'
  | 'my-jobs'
  | 'scrap-entry'
  | 'cut-pieces'
  | 'end-pieces'
  | 'approval-dashboard'
  | 'reports'
  | 'materials'
  | 'user-management';

export const ROLE_PERMISSIONS: Record<string, Screen[]> = {
  OPERATOR: [
    'dashboard',
    'create-job',
    'my-jobs',
    'scrap-entry',
    'cut-pieces',
    'end-pieces',
    'user-management'
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
    'cut-pieces',
    'materials',
    'reports',
    'user-management',
  ],
};
