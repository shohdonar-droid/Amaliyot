import React from 'react';
import {
  Home,
  BookOpen,
  CalendarCheck,
  Stethoscope,
  User,
  Users,
  Menu,
  CalendarRange,
  BarChart3,
  Split
} from 'lucide-react';
import { ActiveModule } from './Sidebar';
import { useAuth } from '../../context/AuthContext';

interface BottomNavigationProps {
  activeModule: ActiveModule;
  onSelectModule: (module: ActiveModule) => void;
  onOpenMenu: () => void;
  onOpenProfile: () => void;
}

interface BottomNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  isActive: boolean;
}

export function BottomNavigation({
  activeModule,
  onSelectModule,
  onOpenMenu,
  onOpenProfile
}: BottomNavigationProps) {
  const { role, canonicalRole, currentUser } = useAuth();
  const userRoleStr = (currentUser?.role || role || '').toUpperCase();
  const isStudent = canonicalRole === 'STUDENT' || userRoleStr === 'STUDENT' || userRoleStr === 'TALABA';
  const isSupervisor = canonicalRole === 'PRACTICE_SUPERVISOR' || userRoleStr === 'PRACTICE_SUPERVISOR' || userRoleStr === 'SUPERVISOR';
  const isClinic = canonicalRole === 'CLINIC_RESPONSIBLE' || userRoleStr === 'CLINIC_RESPONSIBLE' || userRoleStr === 'CLINIC';
  const isSuperAdmin = canonicalRole === 'SUPER_ADMIN' || userRoleStr === 'SUPER_ADMIN';

  let items: BottomNavItem[] = [];

  if (isStudent) {
    items = [
      {
        id: 'dashboard',
        label: 'Bosh sahifa',
        icon: Home,
        action: () => onSelectModule('dashboard'),
        isActive: activeModule === 'dashboard'
      },
      {
        id: 'daily_journal',
        label: 'Kundalik',
        icon: BookOpen,
        action: () => onSelectModule('daily_journal'),
        isActive: activeModule === 'daily_journal'
      },
      {
        id: 'attendance',
        label: 'Davomat',
        icon: CalendarCheck,
        action: () => onSelectModule('attendance'),
        isActive: activeModule === 'attendance'
      },
      {
        id: 'skills',
        label: 'Ko‘nikmalar',
        icon: Stethoscope,
        action: () => onSelectModule('skills'),
        isActive: activeModule === 'skills'
      },
      {
        id: 'profile',
        label: 'Profil',
        icon: User,
        action: onOpenProfile,
        isActive: false
      }
    ];
  } else if (isSupervisor) {
    items = [
      {
        id: 'dashboard',
        label: 'Bosh sahifa',
        icon: Home,
        action: () => onSelectModule('dashboard'),
        isActive: activeModule === 'dashboard'
      },
      {
        id: 'students',
        label: 'Talabalar',
        icon: Users,
        action: () => onSelectModule('students'),
        isActive: activeModule === 'students'
      },
      {
        id: 'attendance',
        label: 'Davomat',
        icon: CalendarCheck,
        action: () => onSelectModule('attendance'),
        isActive: activeModule === 'attendance'
      },
      {
        id: 'daily_journal',
        label: 'Kundalik',
        icon: BookOpen,
        action: () => onSelectModule('daily_journal'),
        isActive: activeModule === 'daily_journal'
      },
      {
        id: 'menu',
        label: 'Menyu',
        icon: Menu,
        action: onOpenMenu,
        isActive: false
      }
    ];
  } else if (isClinic) {
    items = [
      {
        id: 'dashboard',
        label: 'Bosh sahifa',
        icon: Home,
        action: () => onSelectModule('dashboard'),
        isActive: activeModule === 'dashboard'
      },
      {
        id: 'students',
        label: 'Talabalar',
        icon: Users,
        action: () => onSelectModule('students'),
        isActive: activeModule === 'students'
      },
      {
        id: 'attendance',
        label: 'Davomat',
        icon: CalendarCheck,
        action: () => onSelectModule('attendance'),
        isActive: activeModule === 'attendance'
      },
      {
        id: 'allocation',
        label: 'Taqsimot',
        icon: Split,
        action: () => onSelectModule('allocation'),
        isActive: activeModule === 'allocation'
      },
      {
        id: 'menu',
        label: 'Menyu',
        icon: Menu,
        action: onOpenMenu,
        isActive: false
      }
    ];
  } else if (isSuperAdmin) {
    items = [
      {
        id: 'dashboard',
        label: 'Bosh sahifa',
        icon: Home,
        action: () => onSelectModule('dashboard'),
        isActive: activeModule === 'dashboard'
      },
      {
        id: 'practices',
        label: 'Amaliyot',
        icon: CalendarRange,
        action: () => onSelectModule('practices'),
        isActive: activeModule === 'practices'
      },
      {
        id: 'students',
        label: 'Talabalar',
        icon: Users,
        action: () => onSelectModule('students'),
        isActive: activeModule === 'students'
      },
      {
        id: 'reports',
        label: 'Hisobot',
        icon: BarChart3,
        action: () => onSelectModule('reports'),
        isActive: activeModule === 'reports'
      },
      {
        id: 'menu',
        label: 'Menyu',
        icon: Menu,
        action: onOpenMenu,
        isActive: false
      }
    ];
  } else {
    // Practice Head, Staff, Faculty Dean
    items = [
      {
        id: 'dashboard',
        label: 'Bosh sahifa',
        icon: Home,
        action: () => onSelectModule('dashboard'),
        isActive: activeModule === 'dashboard'
      },
      {
        id: 'students',
        label: 'Talabalar',
        icon: Users,
        action: () => onSelectModule('students'),
        isActive: activeModule === 'students'
      },
      {
        id: 'practices',
        label: 'Amaliyot',
        icon: CalendarRange,
        action: () => onSelectModule('practices'),
        isActive: activeModule === 'practices'
      },
      {
        id: 'attendance',
        label: 'Davomat',
        icon: CalendarCheck,
        action: () => onSelectModule('attendance'),
        isActive: activeModule === 'attendance'
      },
      {
        id: 'menu',
        label: 'Menyu',
        icon: Menu,
        action: onOpenMenu,
        isActive: false
      }
    ];
  }

  return (
    <nav
      aria-label="Mobil pastki navigatsiya"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe transition-all"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 px-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.action}
              className={`flex flex-col items-center justify-center gap-1 transition-all duration-150 active:scale-95 cursor-pointer touch-manipulation select-none ${
                item.isActive
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div
                className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all ${
                  item.isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.isActive && (
                  <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </div>
              <span className="text-[10px] leading-none tracking-tight truncate max-w-[68px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
