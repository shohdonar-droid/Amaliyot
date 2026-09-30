import React, { useState } from 'react';
import {
  GraduationCap,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  Building2,
  Users,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';

export function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [username, setUsername] = useState('T00001');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password recovery modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await login(username, password);
      setIsLoading(false);
      if (res.success) {
        showToast('success', 'Xush kelibsiz!', 'Tizimga muvaffaqiyatli kirdingiz.');
      } else {
        setErrorMessage(res.error || 'Login yoki parol noto\'g\'ri kiritildi. Iltimos qaytadan urinib ko\'ring.');
        showToast('error', 'Kirishda xatolik', 'Foydalanuvchi ma\'lumotlari tasdiqlanmadi.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Tizimga ulanishda xatolik yuz berdi.');
    }
  };

  const handleQuickDemoLogin = async (demoUser: string) => {
    setUsername(demoUser);
    setPassword('password123');
    setIsLoading(true);
    const res = await login(demoUser, 'password123');
    setIsLoading(false);
    if (res.success) {
      showToast('success', 'Tezkor kirish', `${demoUser} sifatida tizimga kirdingiz.`);
    }
  };

  const handlePasswordRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryIdentifier.trim()) {
      showToast('warning', 'Maydonni to\'ldiring', 'Login yoki HEMIS ID raqamingizni kiriting.');
      return;
    }
    setRecoverySuccess(true);
    showToast('info', 'Parol so\'rovi qabul qilindi', 'Dekanat orqali parolni tiklash so\'rovi jo\'natildi.');
    setTimeout(() => {
      setIsForgotModalOpen(false);
      setRecoverySuccess(false);
      setRecoveryIdentifier('');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20 mb-4 border border-blue-400/30">
          <GraduationCap className="w-9 h-9" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white uppercase">
          Tibbiyot Universiteti
        </h2>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-blue-400">
          TALABALAR AMALIYOTI ELEKTRON TIZIMI
        </h1>
        <p className="mt-2 text-xs text-slate-400">
          Klinik amaliyot, elektron kundalik va davomat boshqaruv portali
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-200">
          <div className="mb-6 text-center">
            <h3 className="text-lg font-bold text-slate-900">Tizimga kirish</h3>
            <p className="text-xs text-slate-500 mt-1">
              Shaxsiy Login va Parolingizni kiriting
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Login / Foydalanuvchi identifikatori
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Masalan: T00001 yoki Ergashev_Odil"
                  className="block w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white transition-colors font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Talabalar uchun: <span className="font-semibold text-slate-600">T00001</span> formati
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Parol
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white transition-colors font-mono"
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

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>Meni eslab qol</span>
              </label>

              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              >
                Parolni unutdingizmi?
              </button>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isLoading ? 'Kirish tekshirilmoqda...' : 'Kirish'}
              </button>
            </div>
          </form>

          {/* Quick Test / Demo Logins Helper */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 text-center mb-3">
              Sinov rollari (Login + Parol)
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('T00001')}
                className="p-2 col-span-2 rounded-lg border border-emerald-300 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 font-semibold text-center transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Talaba login: <strong>T00001</strong> (Olimov S.)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('Ergashev_Odil')}
                className="p-2 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-blue-800 font-medium text-left transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">Amaliyot boshlig'i (Ergashev_Odil)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('Karimov_Bahodir')}
                className="p-2 rounded-lg border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/70 text-indigo-800 font-medium text-left transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">Dekan (Karimov_Bahodir)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('Aliyev_Anvar')}
                className="p-2 rounded-lg border border-teal-200 bg-teal-50/60 hover:bg-teal-100/70 text-teal-800 font-medium text-left transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Stethoscope className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span className="truncate">Rahbar (Aliyev_Anvar)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('Rasulova_Madina')}
                className="p-2 rounded-lg border border-amber-200 bg-amber-50/60 hover:bg-amber-100/70 text-amber-800 font-medium text-left transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">Klinik mas'ul (Rasulova_Madina)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="p-2 col-span-2 rounded-lg border border-purple-200 bg-purple-50/60 hover:bg-purple-100/70 text-purple-800 font-medium text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Super Admin (admin)</span>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          © 2026 Tibbiyot Universiteti. Barcha huquqlar himoyalangan.
        </p>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Parolni tiklash"
        subtitle="Amaliyot tizimidagi hisobingizga kirishni qayta tiklash"
        maxWidth="md"
      >
        {recoverySuccess ? (
          <div className="p-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-slate-900">
              So'rov yuborildi!
            </h4>
            <p className="text-xs text-slate-600 mt-2">
              Universitet ma'lumotlar bazasida ro'yxatdan o'tgan raqamingizga bir martalik kirish paroli yuborildi.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePasswordRecovery} className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Tizimda ro'yxatdan o'tgan Login (masalan: T00001 yoki Ergashev_Odil) yoki HEMIS ID raqamingizni kiriting.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Login yoki HEMIS ID
              </label>
              <input
                type="text"
                required
                value={recoveryIdentifier}
                onChange={e => setRecoveryIdentifier(e.target.value)}
                placeholder="T00001 yoki 12345678"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
              >
                Parolni tiklash
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
