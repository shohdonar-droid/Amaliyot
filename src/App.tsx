import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { Layout } from './components/layout/Layout';
import { ActiveModule } from './components/layout/Sidebar';

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
import { AssessmentsModule } from './components/modules/assessments/AssessmentsModule';
import { DocumentsModule } from './components/modules/documents/DocumentsModule';
import { ReportsModule } from './components/modules/reports/ReportsModule';
import { NotificationsModule } from './components/modules/notifications/NotificationsModule';
import { AuditLogsModule } from './components/modules/auditLogs/AuditLogsModule';
import { SettingsModule } from './components/modules/settings/SettingsModule';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');

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

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
