import React, { useState } from 'react';
import {
  Settings,
  RotateCcw,
  Save,
  Shield,
  Building,
  Clock,
  Database,
  Cloud,
  Layers,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Activity,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  UserPlus,
  Users,
  Search,
  Key,
  Trash2
} from 'lucide-react';
import { storageService, AppEnvironmentMode } from '../../../services/storageService';
import { useToast } from '../../../context/ToastContext';
import { useAuth, ROLE_CONFIGS } from '../../../context/AuthContext';
import { User, UserRole } from '../../../types';
import { Modal } from '../../common/Modal';
import { ConfirmDialog } from '../../common/ConfirmDialog';
import { StatusBadge } from '../../common/Badge';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';

export function SettingsModule() {
  const { showToast } = useToast();
  const { role, canonicalRole, isSuperAdmin } = useAuth();

  const [mode, setMode] = useState<AppEnvironmentMode>(() => storageService.getEnvironmentMode());
  const [univName, setUnivName] = useState('Toshkent Tibbiyot Akademiyasi');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [semester, setSemester] = useState('Kuzgi');
  const [qrRadius, setQrRadius] = useState(150);
  const [journalDeadline, setJournalDeadline] = useState('23:59');

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // User Management State
  const [usersList, setUsersList] = useState<User[]>(() => storageService.getUsers());
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // System Health & Data Quality data
  const systemHealth = storageService.getSystemHealthStatus();
  const dataQualityIssues = storageService.getDataQualityIssues();

  // Role creation rules:
  // Super Admin -> can create ALL roles (including PRACTICE_HEAD)
  // Amaliyot bo'limi boshlig'i -> can create all roles EXCEPT SUPER_ADMIN and PRACTICE_HEAD
  const isSuperAdminUser = isSuperAdmin || canonicalRole === 'SUPER_ADMIN';
  const isPracticeHeadUser = canonicalRole === 'PRACTICE_HEAD';

  const ALL_ROLES: { key: UserRole; title: string; badge: string }[] = [
    { key: 'SUPER_ADMIN', title: 'Super Admin', badge: 'bg-purple-100 text-purple-800' },
    { key: 'PRACTICE_HEAD', title: 'Amaliyot bo\'limi boshlig\'i', badge: 'bg-blue-100 text-blue-800' },
    { key: 'PRACTICE_STAFF', title: 'Amaliyot bo\'limi xodimi', badge: 'bg-sky-100 text-sky-800' },
    { key: 'FACULTY_DEAN', title: 'Fakultet / Dekan', badge: 'bg-indigo-100 text-indigo-800' },
    { key: 'PRACTICE_SUPERVISOR', title: 'Amaliyot rahbari', badge: 'bg-teal-100 text-teal-800' },
    { key: 'CLINIC_RESPONSIBLE', title: 'Klinik / Shifoxona mas\'uli', badge: 'bg-amber-100 text-amber-800' },
    { key: 'STUDENT', title: 'Talaba', badge: 'bg-emerald-100 text-emerald-800' }
  ];

  const assignableRoles = ALL_ROLES.filter(r => {
    if (isSuperAdminUser) {
      return true; // Super admin can create all roles including PRACTICE_HEAD
    }
    if (isPracticeHeadUser) {
      // Amaliyot bo'limi boshlig'i cannot create SUPER_ADMIN or PRACTICE_HEAD
      return r.key !== 'SUPER_ADMIN' && r.key !== 'PRACTICE_HEAD';
    }
    return r.key !== 'SUPER_ADMIN' && r.key !== 'PRACTICE_HEAD';
  });

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const selectedRole = formData.get('role') as UserRole;
    const loginInput = (formData.get('login') as string).trim();
    const fullNameInput = (formData.get('fullName') as string).trim();
    const emailInput = (formData.get('email') as string).trim();
    const phoneInput = (formData.get('phone') as string).trim();

    // Security check
    if (!isSuperAdminUser && (selectedRole === 'SUPER_ADMIN' || selectedRole === 'PRACTICE_HEAD')) {
      showToast('error', 'Ruxsat etilmadi', 'Siz ushbu rolga yangi foydalanuvchi yarata olmaysiz.');
      return;
    }

    const newUid = `usr-${Date.now()}`;
    const newUser: User = {
      id: newUid,
      uid: newUid,
      login: loginInput,
      fullName: fullNameInput,
      role: selectedRole,
      email: emailInput || `${loginInput}@tma.uz`,
      phone: phoneInput,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save locally
    storageService.saveUser(newUser);

    // Save to Firestore if connected
    if (db) {
      try {
        await setDoc(doc(db, 'users', newUid), newUser);
      } catch (err) {
        console.warn('Firestore user save warning:', err);
      }
    }

    setUsersList(storageService.getUsers());
    setIsUserModalOpen(false);
    showToast('success', 'Foydalanuvchi yaratildi', `${fullNameInput} (${selectedRole}) tizimga qo'shildi.`);
  };

  const handleDeleteUserConfirm = () => {
    if (!userToDelete) return;
    storageService.deleteUser(userToDelete.id);
    setUsersList(storageService.getUsers());
    showToast('info', 'Foydalanuvchi o\'chirildi', `${userToDelete.fullName} olib tashlandi.`);
    setUserToDelete(null);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.setEnvironmentMode(mode);
    showToast('success', 'Sozlamalar saqlandi', `Tizim ${mode} rejimida yangilandi.`);
  };

  const handleResetData = () => {
    storageService.clearDatabase();
    showToast('info', 'Tizim 0 holatiga keltirildi', 'Barcha demo talabalar, klinik bazalar va statistikalar to\'liq o\'chirildi.');
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  const filteredUsers = usersList.filter(u => {
    if (!userSearchQuery.trim()) return true;
    const q = userSearchQuery.toLowerCase();
    return u.fullName.toLowerCase().includes(q) || u.login.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Tizim sozlamalari, foydalanuvchilar va ma'lumotlar sifati
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Foydalanuvchi rollari boshqaruvi, parametrlar reglamenti hamda System Health nazorati
        </p>
      </div>

      {/* SECTION 25: ADMIN SYSTEM HEALTH DASHBOARD */}
      <div className="p-5 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl shadow-lg border border-blue-900/50 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-600/30 border border-emerald-400/30 text-emerald-300">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Tizim Salomatligi (System Health Dashboard)</h3>
              <p className="text-xs text-slate-300">Firebase, Auth, Firestore, Storage va asosiy xizmatlar holati</p>
            </div>
          </div>
          <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${
            systemHealth.every(s => s.status === 'ONLINE')
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
              : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
          }`}>
            <span className={`w-2 h-2 rounded-full ${systemHealth.every(s => s.status === 'ONLINE') ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            {systemHealth.filter(s => s.status === 'ONLINE').length}/{systemHealth.length} Xizmatlar Faol
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
          {systemHealth.map((item, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">{item.service}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{item.details}</p>
              </div>
              <div className="text-right">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  item.status === 'ONLINE'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : item.status === 'WARNING'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}>
                  {item.status}
                </span>
                <span className="text-[9px] font-mono text-slate-400 block mt-0.5">{item.latencyMs} ms</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 26: ADMIN DATA QUALITY CENTER */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Ma'lumotlar Sifati Markazi (Data Quality Center)</h3>
              <p className="text-xs text-slate-500">Talabalar, amaliyotlar va baholar o'rtasidagi yaxlitlik tekshiruvi</p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
            {dataQualityIssues.length} ta yozuv
          </span>
        </div>

        <div className="space-y-2">
          {dataQualityIssues.map((dq) => (
            <div
              key={dq.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                dq.severity === 'Critical'
                  ? 'bg-rose-50/50 border-rose-200 text-rose-900'
                  : dq.severity === 'Warning'
                  ? 'bg-amber-50/50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50/40 border-emerald-200 text-emerald-900'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {dq.severity === 'Critical' ? (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                ) : dq.severity === 'Warning' ? (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">{dq.category}</span>
                    <span
                      className={`px-2 py-0.2 text-[10px] font-bold rounded ${
                        dq.severity === 'Critical'
                          ? 'bg-rose-100 text-rose-800'
                          : dq.severity === 'Warning'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {dq.severity}
                    </span>
                  </div>
                  <p className="text-xs mt-1 opacity-90">{dq.description}</p>
                </div>
              </div>

              <div className="text-right font-mono font-bold text-sm shrink-0">
                {dq.count > 0 ? `${dq.count} ta` : 'OK'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-5">
        {/* Environment Mode Selection */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            <span>Ma'lumotlar bazasi ishchi rejimi (Environment Mode)</span>
          </h3>

          <p className="text-xs text-slate-600">
            Tizim demo/sinov ma'lumotlari bilan ishlab turishi yoki real ishlab chiqarish (Production) uchun toza ma'lumotlar bazasida ishlashi mumkin.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              mode === 'DEVELOPMENT'
                ? 'border-blue-600 bg-blue-50/40 text-blue-950 shadow-2xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs uppercase tracking-wider text-blue-700">Development (Demo)</span>
                <input
                  type="radio"
                  name="envMode"
                  value="DEVELOPMENT"
                  checked={mode === 'DEVELOPMENT'}
                  onChange={() => setMode('DEVELOPMENT')}
                  className="w-4 h-4 text-blue-600"
                />
              </div>
              <p className="text-xs text-slate-600">
                Klinik shifoxonalar, talabalar va amaliyot buyruqlari demo ma'lumotlari bilan to'ldirilgan holatda ishlaydi.
              </p>
            </label>

            <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              mode === 'PRODUCTION'
                ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950 shadow-2xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs uppercase tracking-wider text-emerald-700">Production (Haqiqiy baza)</span>
                <input
                  type="radio"
                  name="envMode"
                  value="PRODUCTION"
                  checked={mode === 'PRODUCTION'}
                  onChange={() => setMode('PRODUCTION')}
                  className="w-4 h-4 text-emerald-600"
                />
              </div>
              <p className="text-xs text-slate-600">
                Toza cloud database rejimi. Faqat rasmiy rektorat buyruqlari va tasdiqlangan foydalanuvchilar qabul qilinadi.
              </p>
            </label>
          </div>
        </div>

        {/* University Info Card */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            <span>Universitet parametrlari</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">OTM to'liq nomi</label>
              <input
                type="text"
                value={univName}
                onChange={e => setUnivName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Faol o'quv yili</label>
              <input
                type="text"
                value={academicYear}
                onChange={e => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>
          </div>
        </div>

        {/* Practice Rules Card */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Davomat va kundalik qoidalari</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                QR Davomat geolokatsiya radiusi (metr)
              </label>
              <input
                type="number"
                value={qrRadius}
                onChange={e => setQrRadius(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Klinik baza koordinatasidan talaba ruxsat etilgan masofasi
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kundalik topshirish muddati (soat)
              </label>
              <input
                type="time"
                value={journalDeadline}
                onChange={e => setJournalDeadline(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Ushbu vaqtdan keyin kundalik topshirilmasa, tizim ogohlantirish beradi
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Sozlamalarni saqlash</span>
          </button>
        </div>
      </form>

      {/* USER MANAGEMENT SECTION: ROLE CREATION PERMISSIONS */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Foydalanuvchilar va Rollar boshqaruvi</h3>
              <p className="text-xs text-slate-500">
                Tizim foydalanuvchilarini biriktirish va rollar bo'yicha ruxsatnomalar
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsUserModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Yangi foydalanuvchi yaratish</span>
          </button>
        </div>

        {/* Search & Stats */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={userSearchQuery}
              onChange={e => setUserSearchQuery(e.target.value)}
              placeholder="Ism yoki login bo'yicha qidirish..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600"
            />
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Jami: <span className="font-bold text-slate-800">{filteredUsers.length}</span> ta
          </p>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Foydalanuvchi</th>
                <th className="p-3">Login</th>
                <th className="p-3">Rol / Mansab</th>
                <th className="p-3">Holat</th>
                <th className="p-3 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    Foydalanuvchilar topilmadi
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => {
                  const rCfg = ROLE_CONFIGS[u.role] || ROLE_CONFIGS['PRACTICE_HEAD'];
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-semibold text-slate-900">{u.fullName}</td>
                      <td className="p-3 font-mono text-slate-600">{u.login}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded font-mono font-medium text-[10px] ${rCfg.badgeColor}`}>
                          {rCfg.title}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">
                          {u.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => setUserToDelete(u)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Danger Zone: Reset Data */}
      <div className="p-5 bg-red-50/50 rounded-xl border border-red-200 space-y-3">
        <h4 className="text-sm font-bold text-red-900 flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-red-600" />
          <span>Tizimni 0 (Nol) holatiga keltirish va demo ma'lumotlarni to'liq o'chirish</span>
        </h4>
        <p className="text-xs text-red-700 leading-relaxed">
          Ushbu tugma bosilganda tizimdagi barcha demo talabalar, klinik amaliyot joylari (tashkilotlar), amaliyot buyruqlari, davomatlar va statistikalar butunlay o'chiriladi hamda real amaliy jarayonlarni boshlash uchun toza "0 holati" yaratiladi. Super Admin hisobi saqlanadi.
        </p>
        <button
          type="button"
          onClick={() => setIsResetConfirmOpen(true)}
          className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          Tizimni 0 holatiga keltirish (Demo ma'lumotlarni o'chirish)
        </button>
      </div>

      {/* CREATE USER MODAL */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title="Yangi foydalanuvchi biriktirish"
        subtitle="Sizning huquqlaringiz bo'yicha ruxsat etilgan rollar ro'yxati"
        maxWidth="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1 uppercase tracking-wider">
              Tizim Roli (Role) *
            </label>
            <select
              name="role"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 font-semibold text-slate-900 bg-white"
            >
              {assignableRoles.map(r => (
                <option key={r.key} value={r.key}>
                  {r.title} ({r.key})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              {isSuperAdminUser
                ? '⭐️ Super Admin Barcha rollarni (shu jumladan Amaliyot bo\'limi boshlig\'i) yarata oladi.'
                : 'ℹ️ Amaliyot bo\'limi boshlig\'i Super Admin va Amaliyot bo\'limi boshlig\'i rolidan tashqari barcha rollarni yarata oladi.'}
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 uppercase tracking-wider">
              FDI / F.I.SH (To'liq Ismi) *
            </label>
            <input
              type="text"
              name="fullName"
              required
              placeholder="Masalan: Ergashev Odil Qosimovich"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                Login (Identifier) *
              </label>
              <input
                type="text"
                name="login"
                required
                placeholder="Ergashev_Odil yoki T00001"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                Telefon
              </label>
              <input
                type="text"
                name="phone"
                placeholder="+998 90 123 45 67"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 uppercase tracking-wider">
              E-mail Pochta
            </label>
            <input
              type="email"
              name="email"
              placeholder="ergashev@tma.uz"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsUserModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Saqlash va yaratish</span>
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetData}
        title="Bazani qayta tiklash"
        message="Haqiqatan ham barcha o'zgarishlarni bekor qilib, dastlabki demo holatga qaytarmoqchimisiz?"
        confirmLabel="Qayta tiklash"
        cancelLabel="Bekor qilish"
        isDestructive
      />

      <ConfirmDialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteUserConfirm}
        title="Foydalanuvchini o'chirish"
        message={`Haqiqatan ham "${userToDelete?.fullName}" foydalanuvchisini o'chirmoqchimisiz?`}
        confirmLabel="O'chirish"
        cancelLabel="Bekor qilish"
        isDestructive
      />
    </div>
  );
}
