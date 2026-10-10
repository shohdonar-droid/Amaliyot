import React, { useState } from 'react';
import { GraduationCap, Eye, EyeOff, AlertCircle, CheckCircle2, Lock, User as UserIcon, ShieldCheck } from 'lucide-react';
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
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  const univName = storageService.getUniversityName();
  const univLogo = storageService.getUniversityLogo();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    try {
      const res = await login(username, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Login yoki parol noto‘g‘ri.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Tizimga ulanishda xatolik yuz berdi.');
    }
  };

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
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
    } catch (err: any) {
      showToast('error', 'Xatolik', err.message || 'Parolni tiklashda xatolik yuz berdi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex lg:flex-row flex-col bg-slate-50">
      {/* Left Branding Panel */}
      <div className="lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 text-white flex flex-col justify-between p-8 sm:p-12 lg:p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
        
        {/* Top Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-blue-400 shadow-xl shadow-blue-950/50">
            {univLogo ? (
              <img src={univLogo} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <GraduationCap className="w-7 h-7 text-blue-400" />
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-blue-300 uppercase tracking-widest">
              Oliy ta'lim muassasasi
            </p>
            <p className="text-sm font-bold text-white">
              TMA Chirchiq filiali
            </p>
          </div>
        </div>

        {/* Center Hero */}
        <div className="relative z-10 my-auto py-12 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold tracking-wide">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Xavfsiz elektron ta'lim va amaliyot platformasi</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Amaliyotni boshqaruv tizimi
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {univName}. Talabalar amaliyoti, kundaliklar, GPS/QR davomat, amaliy ko'nikmalar pasporti va baholash jarayonlarini raqamli boshqarish tizimi.
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-slate-400 font-medium">
          &copy; {new Date().getFullYear()} Barcha huquqlar himoyalangan.
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Tizimga kirish
            </h2>
            <p className="text-xs text-slate-500">
              Universitet tomonidan berilgan login va parolingizni kiriting
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Login / Talaba ID / Email
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Masalan: T00001 yoki admin"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Parol
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Parolni unutdingizmi?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Tekshirilmoqda...</span>
                </>
              ) : (
                <span>Tizimga kirish</span>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => {
          setIsForgotModalOpen(false);
          setRecoverySuccess(false);
          setRecoveryIdentifier('');
        }}
        title="Parolni tiklash"
        subtitle="Tizimdagi login yoki talaba ID raqamingizni kiriting"
        maxWidth="sm"
      >
        {recoverySuccess ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Parolni tiklash so'rovi yuborildi</h3>
            <p className="text-xs text-slate-500">
              Agar ko'rsatilgan login tizimda mavjud bo'lsa, parolni tiklash bo'yicha ko'rsatma yuborildi. Iltimos, administrator bilan bog'laning (birlamchi parol: <span className="font-mono font-bold text-slate-700">password123</span>).
            </p>
            <button
              type="button"
              onClick={() => {
                setIsForgotModalOpen(false);
                setRecoverySuccess(false);
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
            >
              Tugatish
            </button>
          </div>
        ) : (
          <form onSubmit={handlePasswordRecovery} className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Login / Talaba ID *
              </label>
              <input
                type="text"
                required
                value={recoveryIdentifier}
                onChange={e => setRecoveryIdentifier(e.target.value)}
                placeholder="Masalan: T00001"
                className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 font-mono"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                {isLoading ? 'Yuborilmoqda...' : 'Tiklash'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
