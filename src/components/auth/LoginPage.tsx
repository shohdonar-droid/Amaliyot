import React, { useState } from 'react';
import {
  GraduationCap,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Stethoscope,
  Building2,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';

export function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const { showToast } = useToast();

  const [username, setUsername] = useState('amaliyot_boshliq');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Password recovery modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  const handleGoogleLogin = async () => {
    setErrorMessage('');
    setIsGoogleLoading(true);
    const res = await loginWithGoogle();
    setIsGoogleLoading(false);
    if (res.success) {
      showToast('success', 'Google orqali kirdingiz', 'Tizimga muvaffaqiyatli ulandingiz.');
    } else if (res.error) {
      setErrorMessage(res.error);
      showToast('error', 'Google orqali kirishda xatolik', res.error);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const success = login(username, password);
      setIsLoading(false);
      if (success) {
        showToast('success', 'Xush kelibsiz!', 'Tizimga muvaffaqiyatli kirdingiz.');
      } else {
        setErrorMessage('Login yoki parol noto\'g\'ri kiritildi. Iltimos qaytadan urinib ko\'ring.');
        showToast('error', 'Kirishda xatolik', 'Foydalanuvchi ma\'lumotlari tasdiqlanmadi.');
      }
    }, 400);
  };

  const handleQuickDemoLogin = (demoUser: string) => {
    setUsername(demoUser);
    setPassword('password123');
    login(demoUser, 'password123');
    showToast('success', 'Demo foydalanuvchi tanlandi', `${demoUser} sifatida tizimga kirdingiz.`);
  };

  const handlePasswordRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryIdentifier.trim()) {
      showToast('warning', 'Maydonni to\'ldiring', 'Login yoki telefon raqamingizni kiriting.');
      return;
    }
    setRecoverySuccess(true);
    showToast('info', 'Parol yuborildi', 'Yangi vaqtinchalik parol telefon raqamingizga SMS orqali jo\'natildi.');
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
          {/* Google Sign-In Button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-slate-300 rounded-lg shadow-2xs hover:bg-slate-50 hover:border-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-sm text-slate-700 disabled:opacity-60 cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isGoogleLoading ? 'Google orqali ulanmoqda...' : 'Google orqali kirish'}</span>
            </button>

            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-medium tracking-wider">
                  yoki login bilan kiring
                </span>
              </div>
            </div>
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
                Login / Foydalanuvchi nomi
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
                  placeholder="Masalan: amaliyot_boshliq"
                  className="block w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white transition-colors"
                />
              </div>
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
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
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
                className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                Parolni unutdingizmi?
              </button>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Kirish tekshirilmoqda...' : 'Tizimga kirish'}
              </button>
            </div>
          </form>

          {/* Quick Demo Logins Helper */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 text-center mb-3">
              Tezkor kirish (Sinov rollari)
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('amaliyot_boshliq')}
                className="p-2 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-blue-800 font-medium text-left transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">Amaliyot boshlig'i</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('dekan_davolash')}
                className="p-2 rounded-lg border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/70 text-indigo-800 font-medium text-left transition-colors flex items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">Fakultet / Dekan</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('rahbar_sobirov')}
                className="p-2 rounded-lg border border-teal-200 bg-teal-50/60 hover:bg-teal-100/70 text-teal-800 font-medium text-left transition-colors flex items-center gap-1.5"
              >
                <Stethoscope className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span className="truncate">Amaliyot rahbari</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('klinik_karimov')}
                className="p-2 rounded-lg border border-amber-200 bg-amber-50/60 hover:bg-amber-100/70 text-amber-800 font-medium text-left transition-colors flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">Klinik mas'ul</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('student_olimov')}
                className="p-2 col-span-2 rounded-lg border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-800 font-medium text-center transition-colors flex items-center justify-center gap-1.5"
              >
                <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Talaba kabinetiga kirish (Olimov S.)</span>
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
              Yangi parol jo'natildi!
            </h4>
            <p className="text-xs text-slate-600 mt-2">
              Universitet ma'lumotlar bazasida ro'yxatdan o'tgan telefon raqamingizga bir martalik kirish paroli yuborildi.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePasswordRecovery} className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Tizimda ro'yxatdan o'tgan Login, JSHSHIR yoki telefon raqamingizni kiriting. Universitet dekanati orqali tasdiqlangan telefoningizga yangi parol yuboriladi.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Login, JSHSHIR yoki Telefon
              </label>
              <input
                type="text"
                required
                value={recoveryIdentifier}
                onChange={e => setRecoveryIdentifier(e.target.value)}
                placeholder="amaliyot_boshliq yoki +998901234567"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
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
