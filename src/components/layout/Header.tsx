import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  User,
  Shield,
  CheckCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useAuth, ROLE_CONFIGS } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ActiveModule } from './Sidebar';

interface HeaderProps {
  activeModule: ActiveModule;
  onOpenMobileSidebar: () => void;
  unreadCount?: number;
  onOpenNotifications?: () => void;
}

export function Header({
  activeModule,
  onOpenMobileSidebar,
  unreadCount = 0,
  onOpenNotifications
}: HeaderProps) {
  const { currentUser, role, isSuperAdmin, switchRole, logout } = useAuth();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const moduleTitles: Record<ActiveModule, { title: string; subtitle: string }> = {
    dashboard: { title: 'Boshqaruv paneli', subtitle: 'Amaliyot jarayonining umumiy statistikasi va monitoringi' },
    students: { title: 'Talabalar ro\'yxati', subtitle: 'Barcha talabalar, ularning guruhlari va amaliyot holati' },
    academic: { title: 'Akademik tuzilma', subtitle: 'Fakultetlar, yo\'nalishlar, kurslar va guruhlar boshqaruvi' },
    practices: { title: 'Amaliyotlar', subtitle: 'O\'quv, malakaviy va klinik amaliyotlar buyruqlari' },
    practice_places: { title: 'Amaliyot joylari', subtitle: 'Klinik bazalar, shifoxonalar va poliklinikalar' },
    supervisors: { title: 'Rahbarlar va mas\'ullar', subtitle: 'Universitet amaliyot rahbarlari va klinik mentorlar' },
    allocation: { title: 'Taqsimlash moduli', subtitle: 'Talabalarni shifoxonalar va bo\'limlarga biriktirish' },
    attendance: { title: 'Davomat tizimi', subtitle: 'Kundalik keldi-ketdi, QR qaydnomalar va hisobotlar' },
    daily_journal: { title: 'Elektron kundalik', subtitle: 'Bemorlar kuratsiyasi, bajarilgan muolajalar va rahbar tasdig\'i' },
    skills: { title: 'Amaliy ko\'nikmalar pasporti', subtitle: 'Talabalarning klinik manipulyatsiyalarni o\'zlashtirish darajasi' },
    assessments: { title: 'Baholash va attestatsiya', subtitle: 'Oraliq va yakuniy ballar, nazorat mezonlari' },
    documents: { title: 'Hujjatlar va buyruqlar', subtitle: 'Rektor buyruqlari, shartnomalar va yo\'llanmalar' },
    reports: { title: 'Tahliliy hisobotlar', subtitle: 'Universitet va vazirlik uchun statistik ko\'rsatkichlar' },
    notifications: { title: 'Bildirishnomalar', subtitle: 'Tizim ogohlantirishlari va xabarlar' },
    audit_logs: { title: 'Audit loglari va xavfsizlik', subtitle: 'Barcha ma\'lumotlar o\'zgarishlari va kirish harakatlari qaydnomasi' },
    settings: { title: 'Tizim sozlamalari', subtitle: 'Amaliyot parametrlarini sozlash va ma\'lumotlar arxivi' }
  };

  const currentMeta = moduleTitles[activeModule] || { title: 'Amaliyot tizimi', subtitle: 'Tibbiyot universiteti' };

  const handleRoleSelect = (r: UserRole) => {
    switchRole(r);
    setIsRoleDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Zone 1: Mobile toggle & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          title="Menyu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Amaliyot bo'limi</span>
            <span aria-hidden="true">/</span>
            <span className="font-semibold text-slate-800 truncate">{currentMeta.title}</span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block truncate">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Zone 2: Middle Academic Context */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/70 border border-slate-200 text-xs font-medium text-slate-600">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>2025-2026 o'quv yili</span>
        <span aria-hidden="true">·</span>
        <span className="text-slate-500">Kuzgi semestr</span>
      </div>

      {/* Zone 3: Interactive Role Switcher & User Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Role Switcher Pill/Dropdown */}
        {isSuperAdmin && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors text-xs"
              title="Foydalanuvchi profiliga o'tish"
            >
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-medium text-slate-700 hidden sm:inline">Profil:</span>
              <span className="font-semibold text-blue-700 max-w-[130px] truncate">
                {currentUser?.fullName || role}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isRoleDropdownOpen && (
              <div 
                className="absolute right-0 mt-1 w-72 rounded-xl border border-slate-200 bg-white shadow-xl py-1.5 z-50 text-xs"
                onClick={e => e.stopPropagation()}
              >
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="font-semibold text-slate-900">Foydalanuvchi tanlash</p>
                </div>

                {storageService.getUsers().filter(u => u.role !== 'STUDENT').map(user => {
                  const cfg = ROLE_CONFIGS[user.role] || ROLE_CONFIGS['PRACTICE_HEAD'];
                  const isSelected = currentUser?.id === user.id;
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => { switchRole(user.id); setIsRoleDropdownOpen(false); }}
                      className={`w-full px-3 py-2 text-left flex items-start justify-between gap-2 hover:bg-slate-50 transition-colors ${
                        isSelected ? 'bg-blue-50/70 text-blue-700 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{user.fullName}</p>
                        <p className="text-[10px] text-slate-400 truncate">{cfg.title}</p>
                      </div>
                      {isSelected && <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Notifications button */}
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          title="Bildirishnomalar"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
          )}
        </button>

        {/* User initials */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
            {currentUser?.fullName.charAt(0) || 'U'}
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
              {currentUser?.fullName.split(' ')[0]}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {ROLE_CONFIGS[role]?.title}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
