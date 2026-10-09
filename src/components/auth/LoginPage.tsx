import React, { useState } from 'react';
import {
  GraduationCap,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  ShieldCheck,
  Building2,
  Phone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import { resolveLoginToCandidateEmails } from '../../services/loginGeneratorService';
import { storageService } from '../../services/storageService';

export function LoginPage() {
  const { login, forgotPassword } = useAuth();
  const { showToast } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryIdentifier.trim()) {
      showToast('warning', 'Maydonni to\'ldiring', 'Login yoki email manzilini kiriting.');
      return;
    }

    setIsLoading(true);
    try {
      const emails = resolveLoginToCandidateEmails(recoveryIdentifier);
      if (emails.length === 0) {
        showToast('error', 'Xatolik', 'Foydalanuvchi topilmadi.');
        setIsLoading(false);
        return;
      }

      await forgotPassword(emails[0]);
      setRecoverySuccess(true);
      showToast('success', 'Parolni tiklash xati yuborildi', `Parolni tiklash havolasi ${emails[0]} manziliga yuborildi.`);
      setTimeout(() => {
        setIsForgotModalOpen(false);
        setRecoverySuccess(false);
        setRecoveryIdentifier('');
      }, 2500);
    } catch (err: any) {
      showToast('error', 'Xatolik', err.message || 'Parolni tiklashda xatolik yuz berdi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-6 px-4 sm:px-6 relative overflow-x-hidden">
      {/* Background soft ambient shapes */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-72 bg-gradient-to-b from-blue-100/60 via-slate-100/40 to-transparent pointer-events-none -z-10" />

      {/* Main card container */}
      <div className="w-full max-w-sm sm:max-w-md mx-auto my-auto py-4">
        {/* University branding & Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-600/25 mb-4 border border-blue-400/30 overflow-hidden">
            {storageService.getUniversityLogo() ? (
              <img src={storageService.getUniversityLogo()} alt="University Logo" className="w-full h-full object-cover" />
            ) : (
              <GraduationCap className="w-10 h-10" />
            )}
          </div>

          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-snug max-w-xs mx-auto">
            {storageService.getUniversityName()}
          </p>

          <h1 className="mt-2 text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-tight">
            AMALIYOTNI BOSHQARUV TIZIMI
          </h1>

          <p className="mt-1.5 text-xs sm:text-sm font-medium text-blue-600">
            Talabalar amaliyoti — raqamli nazorat
          </p>
        </div>

        {/* Login Form Box */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/90">
          <form className="space-y-4" onSubmit={handleLogin}>
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* Login input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Login
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Login yoki ID raqami (masalan: T00001)"
                  autoCapitalize="none"
                  autoComplete="username"
                  className="block w-full pl-10 pr-3.5 py-3 text-sm bg-slate-50/80 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white transition-all font-mono placeholder:text-slate-400 placeholder:font-sans"
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Parol
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="block w-full pl-10 pr-11 py-3 text-sm bg-slate-50/80 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white transition-all font-mono placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer touch-manipulation"
                  title={showPassword ? 'Parolni yashirish' : 'Parolni ko\'rsatish'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Checkbox & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none touch-manipulation">
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
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer touch-manipulation"
              >
                Parolni unutdingizmi?
              </button>
            </div>

            {/* Submit button: KIRISH */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 flex items-center justify-center py-3 px-4 rounded-xl shadow-md shadow-blue-600/20 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all cursor-pointer touch-manipulation uppercase tracking-wider"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Tekshirilmoqda...
                  </span>
                ) : (
                  'KIRISH'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-3 text-[11px] text-slate-500">
        © 2026 {storageService.getUniversityName()} · Barcha huquqlar himoyalangan.
      </footer>

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
              So'rov qabul qilindi!
            </h4>
            <p className="text-xs text-slate-600 mt-2">
              Universitet ma'lumotlar bazasida ro'yxatdan o'tgan pochta yoki telefon raqamingizga ko'rsatma yuborildi.
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
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
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
