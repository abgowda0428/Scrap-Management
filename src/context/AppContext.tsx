// import React, { createContext, useContext, useState, ReactNode } from 'react';
// import { User, UserRole } from '../types';

// interface AppContextType {
//   currentUser: User | null;
//   setCurrentUser: (user: User | null) => void;
//   currentScreen: string;
//   setCurrentScreen: (screen: string) => void;
// }

// const AppContext = createContext<AppContextType | undefined>(undefined);

// export function AppProvider({ children }: { children: ReactNode }) {
//   const [currentUser, setCurrentUser] = useState<User | null>(null);
//   const [currentScreen, setCurrentScreen] = useState<string>('login');

//   return (
//     <AppContext.Provider
//       value={{
//         currentUser,
//         setCurrentUser,
//         currentScreen,
//         setCurrentScreen,
//       }}
//     >
//       {children}
//     </AppContext.Provider>
//   );
// }

// export function useApp() {
//   const context = useContext(AppContext);
//   if (context === undefined) {
//     throw new Error('useApp must be used within an AppProvider');
//   }
//   return context;
// }



import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react';
import { User } from '../types';

/* ================= TYPES ================= */

type Screen =
  | 'login'
  | 'dashboard'
  | 'my-jobs'
  | 'scrap-entry'
  | 'cut-pieces'
  | 'approval-dashboard'
  | 'reports'
  | 'materials'
  | 'user-management';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
}

/* ================= CONTEXT ================= */

const AppContext = createContext<AppContextType | undefined>(undefined);

/* ================= PROVIDER ================= */

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUserState, setCurrentUserState] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');

  /**
   * 🔐 ENTERPRISE USER SETTER
   * - Normalizes role
   * - Blocks invalid roles
   * - Prevents UI leaks
   */
  const setCurrentUser = (user: User | null) => {
    if (!user) {
      setCurrentUserState(null);
      setCurrentScreen('login');
      return;
    }

    const normalizedRole = user.role?.toUpperCase();

    if (
      normalizedRole !== 'OPERATOR' &&
      normalizedRole !== 'SUPERVISOR' &&
      normalizedRole !== 'MANAGER'
    ) {
      console.error('❌ Invalid role detected:', user.role);
      setCurrentUserState(null);
      setCurrentScreen('login');
      return;
    }

    setCurrentUserState({
      ...user,
      role: normalizedRole,
    });

    // Always land on dashboard after login
    setCurrentScreen('dashboard');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser: currentUserState,
        setCurrentUser,
        currentScreen,
        setCurrentScreen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
