import React, { useState, useEffect, useCallback } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { Layout } from './components/layout/Layout';
import { ActiveModule } from './components/layout/Sidebar';
import { journalTemplateService } from './services/journalTemplateService';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { UserRole } from './types';

// Modules
import { DashboardModule } from './components/modules/dashboard/DashboardModule';
import { StudentsModule } from './components/modules/students/StudentsModule';
import { AcademicStructureModule } from './components/modules/academic/AcademicStructureModule';
import { PracticesModule } from './components/modules/practices/PracticesModule';
import { PracticePlacesModule } from './components/modules/practicePlaces/PracticePlacesModule';
import { SupervisorsModule } from './components/modules/supervisors/SupervisorsModule';
import { AllocationModule } from './components/modules/allocation/AllocationModule';
import { AttendanceModule } from './components/modules/attendance/AttendanceModule';
import { DailyJournalModule } from './components/modules/dailyJournal/DailyJournalModule';
import { SkillsModule } from './components/modules/skills/SkillsModule';
import { UsersModule } from './components/modules/users/UsersModule';
import { AssessmentsModule } from './components/modules/assessments/AssessmentsModule';
import { DocumentsModule } from './components/modules/documents/DocumentsModule';
import { ReportsModule } from './components/modules/reports/ReportsModule';
import { NotificationsModule } from './components/modules/notifications/NotificationsModule';
import { AuditLogsModule } from './components/modules/auditLogs/AuditLogsModule';
import { SettingsModule } from './components/modules/settings/SettingsModule';

const VALID_MODULES: ActiveModule[] = [
  'dashboard', 'users', 'students', 'academic', 'practices', 'practice_places',
  'supervisors', 'allocation', 'attendance', 'daily_journal', 'skills',
  'assessments', 'documents', 'reports', 'notifications', 'audit_logs', 'settings'
];

// Strict role restrictions for admin modules
const RESTRICTED_MODULES: Partial<Record<ActiveModule, UserRole[]>> = {
  users: ['SUPER_ADMIN', 'PRACTICE_HEAD', 'super_admin', 'dept_head'],
  academic: ['SUPER_ADMIN', 'PRACTICE_HEAD', 'PRACTICE_STAFF', 'FACULTY_DEAN', 'super_admin', 'dept_head', 'dept_staff', 'dean'],
  audit_logs: ['SUPER_ADMIN', 'PRACTICE_HEAD', 'super_admin', 'dept_head'],
  settings: ['SUPER_ADMIN', 'PRACTICE_HEAD', 'super_admin', 'dept_head']
};

function getModuleFromUrl(): ActiveModule {
  const path = window.location.pathname.replace(/^\//, '').split('/')[0].trim();
  if (VALID_MODULES.includes(path as ActiveModule)) {
    return path as ActiveModule;
  }

  // Backward compatibility fallback for hash links
  const hash = window.location.hash.replace('#', '').trim();
  if (VALID_MODULES.includes(hash as ActiveModule)) {
    return hash as ActiveModule;
  }

  return 'dashboard';
}

function getStoredModuleAndStack(): { module: ActiveModule; stack: ActiveModule[] } {
  try {
    const storedMod = sessionStorage.getItem('amaliyot_active_module') as ActiveModule;
    const storedStack = sessionStorage.getItem('amaliyot_history_stack');
    const urlMod = getModuleFromUrl();

    let module: ActiveModule = urlMod;
    if (storedMod && VALID_MODULES.includes(storedMod)) {
      module = storedMod;
    }

    let stack: ActiveModule[] = [module];
    if (storedStack) {
      const parsed = JSON.parse(storedStack);
      if (Array.isArray(parsed) && parsed.every(m => VALID_MODULES.includes(m))) {
        stack = parsed;
      }
    }
    if (!stack.includes(module)) {
      stack.push(module);
    }
    return { module, stack };
  } catch {
    const mod = getModuleFromUrl();
    return { module: mod, stack: [mod] };
  }
}

function AppContent() {
  const { isAuthenticated, loading, canonicalRole, role, isSuperAdmin } = useAuth();
  const initial = getStoredModuleAndStack();
  const [activeModule, setActiveModuleState] = useState<ActiveModule>(initial.module);
  const [historyStack, setHistoryStack] = useState<ActiveModule[]>(initial.stack);

  // Persist state to sessionStorage on change and before unload
  useEffect(() => {
    try {
      sessionStorage.setItem('amaliyot_active_module', activeModule);
      sessionStorage.setItem('amaliyot_history_stack', JSON.stringify(historyStack));
    } catch (e) {
      console.error('Failed to save session state', e);
    }
  }, [activeModule, historyStack]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        sessionStorage.setItem('amaliyot_active_module', activeModule);
        sessionStorage.setItem('amaliyot_history_stack', JSON.stringify(historyStack));
      } catch {}
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [activeModule, historyStack]);

  // Handle service worker updates / controller change without losing state
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleControllerChange = () => {
        try {
          sessionStorage.setItem('amaliyot_active_module', activeModule);
          sessionStorage.setItem('amaliyot_history_stack', JSON.stringify(historyStack));
        } catch {}
      };
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      };
    }
  }, [activeModule, historyStack]);

  // Navigate to a module, updating in-memory history and browser URL
  const setActiveModule = useCallback((mod: ActiveModule) => {
    setActiveModuleState(mod);
    setHistoryStack(prev => {
      if (prev[prev.length - 1] === mod) return prev;
      return [...prev, mod];
    });

    const targetPath = mod === 'dashboard' ? '/' : `/${mod}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ module: mod, app: 'amaliyot' }, '', targetPath);
    }
  }, []);

  // Back button handler: smoothly returns to the previous module in memory
  const handleGoBack = useCallback(() => {
    if (historyStack.length > 1) {
      const nextStack = [...historyStack];
      nextStack.pop(); // Remove current module
      const prevMod = nextStack[nextStack.length - 1];
      setHistoryStack(nextStack);
      setActiveModuleState(prevMod);
      const targetPath = prevMod === 'dashboard' ? '/' : `/${prevMod}`;
      window.history.pushState({ module: prevMod, app: 'amaliyot' }, '', targetPath);
    } else if (activeModule !== 'dashboard') {
      setActiveModule('dashboard');
    }
  }, [historyStack, activeModule, setActiveModule]);

  // Handle browser Back / Forward buttons without exiting the site
  useEffect(() => {
    const handleLocationChange = (event?: Event) => {
      const popEvent = event as PopStateEvent | undefined;
      const modFromState = popEvent?.state?.module;
      const mod = (modFromState && VALID_MODULES.includes(modFromState))
        ? modFromState
        : getModuleFromUrl();

      setActiveModuleState(mod);
      setHistoryStack(prev => {
        if (prev.length > 1 && prev[prev.length - 2] === mod) {
          return prev.slice(0, -1);
        }
        return [...prev, mod];
      });
    };

    // Ensure initial entry has state
    const initialMod = activeModule;
    const initialPath = initialMod === 'dashboard' ? '/' : `/${initialMod}`;
    window.history.replaceState({ module: initialMod, app: 'amaliyot' }, '', initialPath);

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Ensure role permission guard: if current role cannot access module, redirect to dashboard
  useEffect(() => {
    if (!isAuthenticated) return;
    const allowedRoles = RESTRICTED_MODULES[activeModule];
    if (allowedRoles && !isSuperAdmin) {
      const hasAccess = allowedRoles.includes(role) || allowedRoles.includes(canonicalRole);
      if (!hasAccess) {
        setActiveModule('dashboard');
      }
    }
  }, [activeModule, role, canonicalRole, isSuperAdmin, isAuthenticated, setActiveModule]);

  // Seed journal template on startup
  useEffect(() => {
    journalTemplateService.seedPsixologiyaTemplate().catch(console.error);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Tizim yuklanmoqda...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardModule onNavigate={setActiveModule} />;
      case 'users':
        return <UsersModule />;
      case 'students':
        return <StudentsModule />;
      case 'academic':
        return <AcademicStructureModule />;
      case 'practices':
        return <PracticesModule />;
      case 'practice_places':
        return <PracticePlacesModule />;
      case 'supervisors':
        return <SupervisorsModule />;
      case 'allocation':
        return <AllocationModule />;
      case 'attendance':
        return <AttendanceModule />;
      case 'daily_journal':
        return <DailyJournalModule />;
      case 'skills':
        return <SkillsModule />;
      case 'assessments':
        return <AssessmentsModule />;
      case 'documents':
        return <DocumentsModule />;
      case 'reports':
        return <ReportsModule />;
      case 'notifications':
        return <NotificationsModule onNavigate={setActiveModule} />;
      case 'audit_logs':
        return <AuditLogsModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <DashboardModule onNavigate={setActiveModule} />;
    }
  };

  const canGoBack = historyStack.length > 1 || activeModule !== 'dashboard';

  return (
    <Layout
      activeModule={activeModule}
      onSelectModule={setActiveModule}
      canGoBack={canGoBack}
      onGoBack={handleGoBack}
    >
      <ErrorBoundary onReset={() => setActiveModule('dashboard')}>
        {renderActiveModule()}
      </ErrorBoundary>
    </Layout>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
