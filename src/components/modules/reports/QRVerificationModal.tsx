import React, { useState } from 'react';
import {
  X,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  Building,
  Calendar,
  Award,
  FileCheck,
  Lock
} from 'lucide-react';
import { storageService } from '../../../services/storageService';

interface QRVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
}

export const QRVerificationModal: React.FC<QRVerificationModalProps> = ({
  isOpen,
  onClose,
  initialCode = ''
}) => {
  const [code, setCode] = useState(initialCode);
  const [searched, setSearched] = useState(Boolean(initialCode));
  const [result, setResult] = useState<any>(
    initialCode ? storageService.getVerificationData(initialCode) : null
  );

  if (!isOpen) return null;

  const handleVerify = (codeToVerify: string) => {
    const res = storageService.getVerificationData(codeToVerify);
    setResult(res);
    setSearched(true);
  };

  const sampleCodes = ['TMA-VRF-84920', 'TMA-VRF-51203', 'TMA-VRF-39011'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <QrCode className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <h3 className="text-base font-bold">QR Kod Haqiqiyligini Tekshirish</h3>
              <p className="text-xs text-sky-100">Rasmiy vedomost va attestatsiya verifikatsiyasi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Verifikatsiya kodi yoki QR havolasi
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleVerify(code)}
                  placeholder="Masalan: TMA-VRF-84920"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
              <button
                type="button"
                onClick={() => handleVerify(code)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                Tekshirish
              </button>
            </div>

            {/* Quick samples */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-slate-500">Mavjud namunalar:</span>
              {sampleCodes.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setCode(c);
                    handleVerify(c);
                  }}
                  className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded border border-slate-200 transition-colors"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Medical Privacy Notice */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-[11px] text-amber-800 leading-relaxed">
              <span className="font-semibold">Tibbiy maxfiylik kafolati:</span> QR verifikatsiya oynasi faqat rasmiy vedomost haqiqiyligi, umumiy o‘zlashtirish va imzolarni tasdiqlaydi. Bemorlarning shaxsiy tibbiy ma'lumotlari xavfsizlik maqsadida ko'rsatilmaydi.
            </div>
          </div>

          {/* Results Display */}
          {searched && (
            <div className="pt-2">
              {result?.isValid ? (
                <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-6 h-6 text-emerald-600" />
                      <div>
                        <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
                          Haqiqiy Rasmiy Hujjat
                        </span>
                        <span className="text-[11px] text-emerald-700 font-mono">
                          Kod: {code.trim()}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                      Tasdiqlangan
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-emerald-100/60">
                      <span className="text-slate-500">Hujjat raqami:</span>
                      <span className="font-semibold text-slate-800 font-mono">{result.vedomost.number}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-emerald-100/60">
                      <span className="text-slate-500">Hujjat nomi:</span>
                      <span className="font-semibold text-slate-800 text-right max-w-[260px] truncate">{result.vedomost.title}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-emerald-100/60">
                      <span className="text-slate-500">Muassasa:</span>
                      <span className="font-semibold text-slate-800">{result.vedomost.faculty}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-emerald-100/60">
                      <span className="text-slate-500">Amaliyot:</span>
                      <span className="font-semibold text-slate-800">{result.vedomost.practice}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-emerald-100/60">
                      <span className="text-slate-500">Attestatsiya komissiyasi:</span>
                      <span className="font-semibold text-slate-800">{result.vedomost.commission}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-emerald-100/60">
                      <span className="text-slate-500">Komissiya raisi:</span>
                      <span className="font-semibold text-slate-800">{result.vedomost.chairperson}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-emerald-100/60">
                      <span className="text-slate-500">Sana:</span>
                      <span className="font-semibold text-slate-800">{result.vedomost.issueDate}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                      <div className="bg-white p-2 rounded-lg border border-emerald-100">
                        <span className="text-[10px] text-slate-500 block">Talabalar</span>
                        <span className="text-sm font-bold text-slate-900">{result.vedomost.totalStudents}</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-emerald-100">
                        <span className="text-[10px] text-slate-500 block">O‘zlashtirish</span>
                        <span className="text-sm font-bold text-blue-700">{result.vedomost.masteryPercentage}%</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-emerald-100">
                        <span className="text-[10px] text-slate-500 block">Sifat</span>
                        <span className="text-sm font-bold text-emerald-700">{result.vedomost.qualityPercentage}%</span>
                      </div>
                    </div>

                    {result.vedomost.signedBy && (
                      <div className="pt-2 text-[11px] text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Rahbar imzosi: <b>{result.vedomost.signedBy}</b></span>
                      </div>
                    )}
                    {result.vedomost.approvedBy && (
                      <div className="text-[11px] text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Dekan tasdig'i: <b>{result.vedomost.approvedBy}</b></span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border border-rose-200 bg-rose-50/50 rounded-xl p-4 text-center space-y-2">
                  <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
                  <h4 className="text-xs font-bold text-rose-900">Verifikatsiya muvaffaqiyatsiz</h4>
                  <p className="text-xs text-rose-700">
                    {result?.message || 'Kiritilgan kod bo‘yicha tizimda rasmiy hujjat topilmadi.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
