import React, { useState } from 'react';
import { GraduationCap, Eye, EyeOff, AlertCircle, CheckCircle2, Lock, User as UserIcon, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import { resolveLoginToCandidateEmails } from '../../services/loginGeneratorService';
import { storageService } from '../../services/storageService';

export function LoginPage() {
  const { login, forgotPassword, switchRole } = useAuth();
  const { showToast } = useToast();

  const [username, setUsername] = useState('T00001');
  const [password, setPassword] = useState('password123');
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

  const handleRoleQuickSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    try {
      switchRole(val);
      showToast('success', 'Rol almashtirildi', `Tezkor rejim: ${val}`);
    } catch (err: any) {
      showToast('error', 'Xatolik', 'Rolni almashtirishda xatolik');
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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-blue-900 text-white flex flex-col justify-between p-4 sm:p-8 relative overflow-x-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#3b82f6_1.5px,transparent_1.5px)] [background-size:20px_20px] pointer-events-none" />

      <div className="max-w-md w-full mx-auto my-auto py-8 space-y-6 relative z-10">
        {/* Top Header & Logo */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-white/10 backdrop-blur-md border-2 border-white/25 flex items-center justify-center text-blue-400 shadow-2xl shadow-blue-950/80">
            {univLogo ? (
              <img src={univLogo} alt="Logo" className="w-full h-full object-cover rounded-full" />
            ) : (
              <GraduationCap className="w-10 h-10 text-blue-300" />
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Amaliyotni boshqaruv tizimi
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-blue-200 tracking-wide uppercase px-2">
              {univName}
            </p>
          </div>
        </div>

        {/* Elevated Form Card */}
        <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-blue-950/50 border border-slate-100 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Login
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="T00001 yoki admin"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-mono font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Parol
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-mono font-medium"
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
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Kirilmoqda...</span>
                </>
              ) : (
                <span>Kirish</span>
              )}
            </button>
          </form>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(true)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Parolni unutdingizmi?
            </button>
          </div>

          {/* Role Switcher Section (as seen in reference mockup) */}
          <div className="pt-4 border-t border-slate-100 space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Rollarni almashtirish (Tezkor demo)
            </label>
            <select
              onChange={handleRoleQuickSwitch}
              defaultValue=""
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="" disabled>Rolni tanlang...</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="PRACTICE_HEAD">Amaliyot bo‘limi boshlig‘i</option>
              <option value="PRACTICE_STAFF">Amaliyot bo‘limi xodimi</option>
              <option value="FACULTY_DEAN">Fakultet dekani</option>
              <option value="PRACTICE_SUPERVISOR">Amaliyot rahbari</option>
              <option value="CLINIC_RESPONSIBLE">Klinika / Shifoxona mas’uli</option>
              <option value="STUDENT">Talaba (T00001)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center text-[11px] text-slate-400 font-medium py-4">
        &copy; {new Date().getFullYear()} TOSHKENT DAVLAT TIBBIYOT UNIVERSITETI CHIRCHIQ FILIALI. Barcha huquqlar himoyalangan.
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
