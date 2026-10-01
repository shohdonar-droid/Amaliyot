import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { Layout } from './components/layout/Layout';
import { ActiveModule } from './components/layout/Sidebar';
import { journalTemplateService } from './services/journalTemplateService';

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

function getModuleFromUrl(): ActiveModule {
  const path = window.location.pathname.replace(/^\//, '').split('/')[0].trim();
  if (VALID_MODULES.includes(path as ActiveModule)) {
    return path as ActiveModule;
  }

  // Backward compatibility fallback for old hash links
  const hash = window.location.hash.replace('#', '').trim();
  if (VALID_MODULES.includes(hash as ActiveModule)) {
    return hash as ActiveModule;
  }

  return 'dashboard';
}

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [activeModule, setActiveModuleState] = useState<ActiveModule>(getModuleFromUrl);

  const setActiveModule = (mod: ActiveModule) => {
    setActiveModuleState(mod);
    const targetPath = mod === 'dashboard' ? '/' : `/${mod}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ module: mod }, '', targetPath);
    }
  };

  useEffect(() => {
    const handleLocationChange = () => {
      const mod = getModuleFromUrl();
      setActiveModuleState(mod);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

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

  return (
    <Layout activeModule={activeModule} onSelectModule={setActiveModule}>
      {renderActiveModule()}
    </Layout>
  );
}

// Force rebuild: 2026-10-01
export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
// Force rebuild: 2026-10-01

