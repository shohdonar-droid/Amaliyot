import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarRange,
  Building2,
  UserCheck,
  Split,
  CalendarCheck,
  BookOpen,
  Stethoscope,
  Award,
  FileText,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ConfirmDialog } from '../common/ConfirmDialog';

export type ActiveModule = 
  | 'dashboard'
  | 'users'
  | 'students'
  | 'academic'
  | 'practices'
  | 'practice_places'
  | 'supervisors'
  | 'allocation'
  | 'attendance'
  | 'daily_journal'
  | 'skills'
  | 'assessments'
  | 'documents'
  | 'reports'
  | 'notifications'
  | 'audit_logs'
  | 'settings';

interface SidebarProps {
  activeModule: ActiveModule;
  onSelectModule: (module: ActiveModule) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  unreadNotificationsCount?: number;
  onOpenProfile?: () => void;
}

interface NavItem {
  id: ActiveModule;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles?: UserRole[];
  badgeCount?: number;
}

export function Sidebar({
  activeModule,
  onSelectModule,
  isOpenMobile,
  onCloseMobile,
  unreadNotificationsCount = 0,
  onOpenProfile
}: SidebarProps) {
  const { role, canonicalRole, roleConfig, currentUser, logout, isSuperAdmin } = useAuth();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [univName, setUnivName] = useState(() => storageService.getUniversityName());

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setUnivName(storageService.getUniversityName());
    };
    window.addEventListener('system_settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('system_settings_updated', handleSettingsUpdate);
  }, []);

  const allNavItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'users',
      label: 'Foydalanuvchilar va rollar',
      icon: Users,
      allowedRoles: ['SUPER_ADMIN', 'PRACTICE_HEAD', 'super_admin', 'dept_head']
    },
    {
      id: 'students',
      label: 'Talabalar',
      icon: Users,
      allowedRoles: ['SUPER_ADMIN', 'PRACTICE_HEAD', 'PRACTICE_STAFF', 'FACULTY_DEAN', 'PRACTICE_SUPERVISOR', 'CLINIC_RESPONSIBLE', 'super_admin', 'dept_head', 'dept_staff', 'dean', 'supervisor', 'clinic_responsible']
    },
    {
      id: 'academic',
      label: 'Fakultet va guruhlar',
      icon: GraduationCap,
      allowedRoles: ['SUPER_ADMIN', 'PRACTICE_HEAD', 'PRACTICE_STAFF', 'FACULTY_DEAN', 'super_admin', 'dept_head', 'dept_staff', 'dean']
    },
    {
      id: 'practices',
      label: 'Amaliyotlar',
      icon: CalendarRange,
      allowedRoles: ['SUPER_ADMIN', 'PRACTICE_HEAD', 'PRACTICE_STAFF', 'FACULTY_DEAN', 'PRACTICE_SUPERVISOR', 'CLINIC_RESPONSIBLE', 'STUDENT', 'super_admin', 'dept_head', 'dept_staff', 'dean', 'supervisor', 'clinic_responsible', 'student']
    },
    {
      id: 'practice_places',
      label: 'Amaliyot bazalari',
      icon: Building2,
      allowedRoles: ['SUPER_ADMIN', 'PRACTICE_HEAD', 'PRACTICE_STAFF', 'FACULTY_DEAN', 'PRACTICE_SUPERVISOR', 'CLINIC_RESPONSIBLE', 'super_admin', 'dept_head', 'dept_staff', 'dean', 'supervisor', 'clinic_responsible']
    },
    {
      id: 'supervisors',
      label: 'Rahbarlar va mas\'ullar',
      icon: UserCheck,
      allowedRoles: ['SUPER_ADMIN', 'PRACTICE_HEAD', 'PRACTICE_STAFF', 'FACULTY_DEAN', 'super_admin', 'dept_head', 'dept_staff', 'dean']
    },
    {
      id: 'allocation',
      label: 'Taqsimot va bo\'limlar',
      icon: Split,
      allowedRoles: ['SUPER_ADMIN', 'PRACTICE_HEAD', 'PRACTICE_STAFF', 'PRACTICE_SUPERVISOR', 'CLINIC_RESPONSIBLE', 'super_admin', 'dept_head', 'dept_staff', 'supervisor', 'clinic_responsible']
    },
    {
      id: 'attendance',
      label: 'Davomat',
      icon: CalendarCheck,
      allowedRoles: ['SUPER_ADMIN', 'PRACTICE_HEAD', 'PRACTICE_STAFF', 'FACULTY_DEAN', 'PRACTICE_SUPERVISOR', 'CLINIC_RESPONSIBLE', 'STUDENT', 'super_admin', 'dept_head', 'dept_staff', 'dean', 'supervisor', 'clinic_responsible', 'student']
    },
    {
      id: 'daily_journal',
      label: 'Elektron kundalik',
      icon: BookOpen,
      allowedRoles: ['SUPER_ADMIN', 'PRACTICE_HEAD', 'PRACTICE_STAFF', 'FACULTY_DEAN', 'PRACTICE_SUPERVISOR', 'CLINIC_RESPONSIBLE', 'STUDENT', 'super_admin', 'dept_head', 'dept_staff', 'dean', 'supervisor', 'clinic_responsible', 'student']
    },
    {
      id: 'skills',
      label: 'Amaliy ko\'nikmalar',
      icon: Stethoscope,
      allowedRoles: ['SUPER_ADMIN', 'PRACTICE_HEAD', 'PRACTICE_STAFF', 'FACULTY_DEAN', 'PRACTICE_SUPERVISOR', 'CLINIC_RESPONSIBLE', 'STUDENT', 'super_admin', 'dept_head', 'dept_staff', 'dean', 'supervisor', 'clinic_responsible', 'student']
    },
    {
      id: 'assessments',
      label: 'Baholash va attestatsiya',
      icon: Award,
      allowedRoles: ['SUPER_ADMIN', 'PRACTICE_HEAD', 'PRACTICE_STAFF', 'FACULTY_DEAN', 'PRACTICE_SUPERVISOR', 'CLINIC_RESPONSIBLE', 'STUDENT', 'super_admin', 'dept_head', 'dept_staff', 'dean', 'supervisor', 'clinic_responsible', 'student']
    },
    {
      id: 'documents',
      label: 'Hujjatlar va buyruqlar',
      icon: FileText,
      allowedRoles: ['SUPER_ADMIN', 'PRACTICE_HEAD', 'PRACTICE_STAFF', 'FACULTY_DEAN', 'PRACTICE_SUPERVISOR', 'STUDENT', 'super_admin', 'dept_head', 'dept_staff', 'dean', 'supervisor', 'student']
    },
    {
      id: 'reports',
      label: 'Yakuniy hisobotlar',
      icon: BarChart3,
      allowedRoles: ['SUPER_ADMIN', 'PRACTICE_HEAD', 'PRACTICE_STAFF', 'FACULTY_DEAN', 'PRACTICE_SUPERVISOR', 'CLINIC_RESPONSIBLE', 'super_admin', 'dept_head', 'dept_staff', 'dean', 'supervisor', 'clinic_responsible']
    },
    {
      id: 'notifications',
      label: 'Bildirishnomalar',
      icon: Bell,
      badgeCount: unreadNotificationsCount,
      allowedRoles: ['SUPER_ADMIN', 'PRACTICE_HEAD', 'PRACTICE_STAFF', 'FACULTY_DEAN', 'PRACTICE_SUPERVISOR', 'CLINIC_RESPONSIBLE', 'STUDENT', 'super_admin', 'dept_head', 'dept_staff', 'dean', 'supervisor', 'clinic_responsible', 'student']
    },
    {
      id: 'audit_logs',
      label: 'Audit loglari',
      icon: ShieldAlert,
      allowedRoles: ['SUPER_ADMIN', 'PRACTICE_HEAD', 'super_admin', 'dept_head']
    },
    {
      id: 'settings',
      label: 'Sozlamalar',
      icon: Settings,
      allowedRoles: ['SUPER_ADMIN', 'PRACTICE_HEAD', 'super_admin', 'dept_head']
    }
  ];

  const visibleNavItems = allNavItems.filter(item => {
    if (!item.allowedRoles) return true;
    if (isSuperAdmin) return true;
    return item.allowedRoles.includes(role) || item.allowedRoles.includes(canonicalRole);
  });

  const handleNavClick = (mod: ActiveModule) => {
    onSelectModule(mod);
    onCloseMobile();
  };

  return (
    <>
      {isOpenMobile && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-900/30 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs font-bold tracking-tight text-white leading-tight uppercase line-clamp-2">
              {univName}
            </h1>
            <p className="text-[11px] text-blue-400 font-medium tracking-wide truncate">
              Talabalar amaliyoti tizimi
            </p>
          </div>
        </div>

        {/* Current Role Banner */}
        <div className="px-4 py-3 bg-slate-950/50 border-b border-slate-800/80 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Faol rol:
            </p>
            <p className="text-xs font-semibold text-white truncate">
              {roleConfig.title}
            </p>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${roleConfig.badgeColor}`}>
            {canonicalRole}
          </span>
        </div>

        {/* Nav Items List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Asosiy modullar
          </div>

          {visibleNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors group relative ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span className="truncate flex-1 text-left">{item.label}</span>
                {item.badgeCount && item.badgeCount > 0 ? (
                  <span className="ml-auto px-1.5 py-0.5 text-[10px] font-mono font-bold bg-amber-500 text-white rounded-full">
                    {item.badgeCount}
                  </span>
                ) : null}
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-blue-200 shrink-0 ml-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* User Card in Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <button
              type="button"
              onClick={onOpenProfile}
              title="Mening profilimni ko'rish"
              className="flex items-center gap-2.5 min-w-0 flex-1 text-left hover:opacity-85 transition-opacity cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-blue-900/60 border border-blue-700/50 flex items-center justify-center text-xs font-bold text-blue-300 shrink-0">
                {currentUser?.fullName.charAt(0) || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {currentUser?.fullName || 'Foydalanuvchi'}
                </p>
                <p className="text-[11px] text-blue-400 font-medium truncate">
                  Profilni ko'rish &rarr;
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setIsLogoutConfirmOpen(true)}
              title="Tizimdan chiqish"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation */}
      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={async () => {
          setIsLogoutConfirmOpen(false);
          await logout();
        }}
        title="Tizimdan chiqish"
        message="Haqiqatan ham o'z hisobingizdan chiqmoqchimisiz? Tizimdan chiqish uchun qaytadan login va parol kiritishingiz kerak bo'ladi."
        confirmText="Ha, chiqish"
        cancelText="Bekor qilish"
        variant="danger"
      />
    </>
  );
}
