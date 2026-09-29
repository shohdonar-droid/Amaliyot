import React, { useState } from 'react';
import {
  X,
  RotateCcw,
  Calendar,
  AlertTriangle,
  UserCheck,
  Clock
} from 'lucide-react';
import { Assessment, Student } from '../../../types';
import { storageService } from '../../../services/storageService';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

interface RetakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: Assessment | null;
  onRetakeRequested: () => void;
}

export const RetakeModal: React.FC<RetakeModalProps> = ({
  isOpen,
  onClose,
  assessment,
  onRetakeRequested
}) => {
  const { currentUser, role } = useAuth();
  const { showToast } = useToast();

  const [reason, setReason] = useState<string>(
    'Klinik manipulyatsiyalarni bajarish texnikasida va keyslar tahlilida yetarli bilim ko\'rsatilmadi.'
  );
  const [nextExamDate, setNextExamDate] = useState<string>(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [examinerId, setExaminerId] = useState<string>('sup-1');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !assessment) return null;

  const students = storageService.getStudents();
  const student = students.find(s => s.id === assessment.studentId);
  const supervisors = storageService.getSupervisors();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      showToast('error', 'Xatolik', 'Qayta topshirish sababini ko\'rsating.');
      return;
    }
    if (!nextExamDate) {
      showToast('error', 'Xatolik', 'Yangi imtihon sanasini tanlang.');
      return;
    }

    setSubmitting(true);
    try {
      const res = storageService.requestRetake(
        assessment.id,
        {
          reason,
          nextExamDate,
          examinerId,
          reviewerName: currentUser?.fullName || 'Amaliyot komissiyasi'
        },
        currentUser?.id || 'sys',
        role || 'PRACTICE_SUPERVISOR'
      );

      if (res.success) {
        showToast(
          'warning',
          'Qayta topshirishga yuborildi',
          `Talabaga ${nextExamDate} sanasiga yangi imtihon belgilandi va xabarnoma jo'natildi.`
        );
        onRetakeRequested();
        onClose();
      } else {
        showToast('error', 'Xatolik', res.error || 'Qayta topshirishni qayd etib bo\'lmadi.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-900 to-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
              <RotateCcw className="w-5 h-5 text-rose-300" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Qayta topshirishga yo'naltirish</h3>
              <p className="text-xs text-rose-200">{student?.fullName} ({student?.group})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current score banner */}
        <div className="bg-rose-50 border-b border-rose-100 p-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-rose-800">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Hozirgi yakuniy ball:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-rose-700 text-sm">
              {assessment.totalScore} / 100
            </span>
            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-rose-200 text-rose-800">
              Baho: {assessment.grade}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Qayta topshirish sababi va kamchiliklar tavsifi *
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Masalan: Klinik amaliyot mezonlari bo'yicha yetarli ball to'play olmadi..."
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Yangi imtihon sanasi *
              </label>
              <input
                type="date"
                required
                value={nextExamDate}
                onChange={e => setNextExamDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                Biriktirilgan imtihonchi
              </label>
              <select
                value={examinerId}
                onChange={e => setExaminerId(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl font-medium bg-white"
              >
                {supervisors.map(s => (
                  <option key={s.id} value={s.id}>{s.fullName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 space-y-1">
            <p className="font-semibold">Amalga oshiriladigan harakatlar:</p>
            <p>1. Talabaning attestatsiya statusi "Qayta topshirish" (RETAKE_REQUIRED) ga o'zgartiriladi.</p>
            <p>2. Oldingi urinish arxiv tarixiga (history) saqlanadi.</p>
            <p>3. Talabaga yangi imtihon sanasi haqida avtomatik ogohlantirish yuboriladi.</p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Yuborilmoqda...' : 'Qayta topshirishga yuborish'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
