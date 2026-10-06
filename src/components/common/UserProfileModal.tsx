import React, { useState } from 'react';
import {
  User as UserIcon,
  Shield,
  Key,
  LogOut,
  Mail,
  Phone,
  GraduationCap,
  Building,
  CheckCircle,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth, ROLE_CONFIGS } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from './Modal';
import { ConfirmDialog } from './ConfirmDialog';
import { storageService } from '../../services/storageService';
import { userService } from '../../services/userService';
import { UserRole } from '../../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleSwitched?: () => void;
}

export function UserProfileModal({ isOpen, onClose, onRoleSwitched }: UserProfileModalProps) {
  const { currentUser, role, canonicalRole, isSuperAdmin, switchRole, logout } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'info' | 'password' | 'switch_role'>('info');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // Student specific data if applicable
  const studentData = role === 'STUDENT' && currentUser
    ? storageService.getStudents().find(s => s.userId === currentUser.id || s.id === currentUser.studentId || s.login === currentUser.login)
    : null;

  const facultyData = studentData?.facultyId ? storageService.getFaculties().find(f => f.id === studentData.facultyId) : null;
  const groupData = studentData?.groupId ? storageService.getGroups().find(g => g.id === studentData.groupId) : null;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('warning', 'Yaroqsiz parol', 'Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('error', 'Mos kelmadi', 'Kiritilgan yangi parollar bir-biriga mos kelmadi.');
      return;
    }

    if (!currentUser?.id) return;

    setIsUpdatingPassword(true);
    try {
      await userService.updateUser(currentUser.id, { password: newPassword });
      showToast('success', 'Parol yangilandi', 'Yangi parolingiz muvaffaqiyatli saqlandi.');
      setNewPassword('');
      setConfirmPassword('');
      setActiveTab('info');
    } catch (err: any) {
      showToast('error', 'Xatolik', 'Parolni saqlashda xatolik: ' + (err.message || ''));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSelectRolePersona = (userId: string) => {
    switchRole(userId);
    showToast('success', 'Profil almashtirildi', 'Tanlangan foydalanuvchi profiliga o\'tildi.');
    if (onRoleSwitched) onRoleSwitched();
    onClose();
  };

  const handleResetSuperAdmin = () => {
    switchRole('RESET_SUPER_ADMIN');
    showToast('info', 'Super Admin', 'Asosiy Super Admin profiliga qaytdingiz.');
    if (onRoleSwitched) onRoleSwitched();
    onClose();
  };

  const handleConfirmLogout = async () => {
    setIsLogoutConfirmOpen(false);
    onClose();
    await logout();
  };

  const roleTitle = ROLE_CONFIGS[role]?.title || role;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Foydalanuvchi profili"
        subtitle="Shaxsiy ma'lumotlar va hisob sozlamalari"
        maxWidth="lg"
      >
        <div className="space-y-5">
          {/* Top User Header Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-400/40 flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-500/20 shrink-0">
              {(currentUser?.fullName || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-white truncate leading-tight">
                {currentUser?.fullName || 'Foydalanuvchi'}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/30 text-blue-300 border border-blue-400/30">
                  {roleTitle}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Login: <strong className="text-white">{currentUser?.login || currentUser?.username}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 gap-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'info'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Shaxsiy ma'lumotlar
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('password')}
              className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'password'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Parolni o'zgartirish
            </button>
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('switch_role')}
                className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'switch_role'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-purple-600" />
                <span>Profilga o'tish (Admin)</span>
              </button>
            )}
          </div>

          {/* Tab 1: Info */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">F.I.SH</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{currentUser?.fullName}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tizimdagi rol</p>
                  <p className="font-semibold text-blue-700 mt-0.5">{roleTitle}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Login</p>
                  <p className="font-mono font-bold text-slate-800 mt-0.5">{currentUser?.login || '-'}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email manzil</p>
                  <p className="font-medium text-slate-700 mt-0.5 truncate">{currentUser?.email || '-'}</p>
                </div>

                {currentUser?.phone && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Telefon raqam</p>
                    <p className="font-medium text-slate-700 mt-0.5">{currentUser.phone}</p>
                  </div>
                )}

                {/* If Student: Extra HEMIS details */}
                {studentData && (
                  <>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">HEMIS Talaba ID</p>
                      <p className="font-mono font-bold text-blue-700 mt-0.5">{studentData.hemisStudentId}</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Universitet Talaba ID</p>
                      <p className="font-mono font-bold text-slate-800 mt-0.5">{studentData.studentId}</p>
                    </div>

                    {facultyData && (
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fakultet</p>
                        <p className="font-semibold text-slate-800 mt-0.5">{facultyData.name}</p>
                      </div>
                    )}

                    {groupData && (
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Guruh</p>
                        <p className="font-semibold text-slate-800 mt-0.5">{groupData.name}</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsLogoutConfirmOpen(true)}
                  className="px-3 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Tizimdan chiqish</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  Yopish
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Password Change */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 leading-relaxed">
                Hisobingiz xavfsizligi uchun kuchli parol tanlang. Yangi parol kamida 6 ta belgidan iborat bo'lishi shart.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Yangi parol *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Yangi parolni tasdiqlang *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('info')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isUpdatingPassword ? "Saqlanmoqda..." : "Parolni saqlash"}
                </button>
              </div>
            </form>
          )}

          {/* Tab 3: Super Admin Persona Switcher */}
          {activeTab === 'switch_role' && isSuperAdmin && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 leading-relaxed">
                Super Admin sifatida boshqa foydalanuvchilar (dekan, mas'ul, rahbar yoki talaba) profiliga kirib, ularning ko'rinishida tizimni tekshirishingiz mumkin:
              </p>

              <button
                type="button"
                onClick={handleResetSuperAdmin}
                className="w-full p-2.5 text-left flex items-center gap-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold border border-purple-200 rounded-xl transition-colors cursor-pointer text-xs"
              >
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Asosiy Super Admin profiliga qaytish</span>
              </button>

              <div className="max-h-60 overflow-y-auto space-y-1 pr-1 border border-slate-200 rounded-xl p-1 bg-slate-50/50">
                {storageService.getUsers().map(u => {
                  const cfg = ROLE_CONFIGS[u.role] || ROLE_CONFIGS['PRACTICE_HEAD'];
                  const isSelected = currentUser?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectRolePersona(u.id)}
                      className={`w-full p-2.5 text-left flex items-start justify-between gap-2 rounded-lg transition-colors cursor-pointer text-xs ${
                        isSelected ? 'bg-blue-100/70 text-blue-800 font-semibold border border-blue-200' : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200/60'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{u.fullName}</p>
                        <p className="text-[11px] text-slate-500 font-normal truncate mt-0.5">
                          {cfg.title} · Login: <span className="font-mono text-slate-700">{u.login}</span>
                        </p>
                      </div>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      ) : (
                        <span className="text-[10px] text-blue-600 font-semibold shrink-0 mt-1">O'tish &rarr;</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Tizimdan chiqish"
        message="Haqiqatan ham o'z hisobingizdan chiqmoqchimisiz? Tizimdan chiqish uchun qaytadan login va parol kiritishingiz kerak bo'ladi."
        confirmText="Ha, chiqish"
        cancelText="Bekor qilish"
        variant="danger"
      />
    </>
  );
}
