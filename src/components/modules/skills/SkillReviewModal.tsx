import React, { useState } from 'react';
import { CheckCircle2, XCircle, Star, AlertCircle, Calendar, User, FileText, Stethoscope } from 'lucide-react';
import { Modal } from '../../common/Modal';
import { SkillLogEntry, Student, Skill, UserRole } from '../../../types';
import { storageService } from '../../../services/storageService';
import { useToast } from '../../../context/ToastContext';

interface SkillReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  log: SkillLogEntry | null;
  currentUserFullName: string;
  currentUserId: string;
  currentUserRole: UserRole;
}

export function SkillReviewModal({
  isOpen,
  onClose,
  onSuccess,
  log,
  currentUserFullName,
  currentUserId,
  currentUserRole
}: SkillReviewModalProps) {
  const { showToast } = useToast();
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>('A\'lo darajada va to\'g\'ri bajarildi.');
  const [rejectReason, setRejectReason] = useState<string>('');
  const [decision, setDecision] = useState<'APPROVE' | 'REVISION'>('APPROVE');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!log) return null;

  const students = storageService.getStudents();
  const student = students.find(s => s.id === log.studentId);
  const skills = storageService.getSkills();
  const skill = skills.find(s => s.id === log.skillId);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (decision === 'REVISION' && !rejectReason.trim()) {
      setError('Qaytarish sababini (revisionReason) ko\'rsatish majburiy.');
      return;
    }

    setSubmitting(true);
    try {
      const res = storageService.reviewSkillLog({
        logId: log.id,
        status: decision === 'APPROVE' ? 'APPROVED' : 'REVISION',
        feedback: decision === 'APPROVE' ? feedback.trim() : rejectReason.trim(),
        rating: decision === 'APPROVE' ? rating : undefined,
        reviewerName: currentUserFullName,
        reviewerId: currentUserId,
        actorUserId: currentUserId,
        actorRole: currentUserRole
      });

      if (!res.success) {
        setError(res.error || 'Tekshiruvni saqlashda xatolik yuz berdi.');
        setSubmitting(false);
        return;
      }

      showToast(
        decision === 'APPROVE' ? 'success' : 'warning',
        decision === 'APPROVE' ? 'Ko\'nikma tasdiqlandi' : 'Ko\'nikma qaytarildi',
        `"${skill?.name || 'Ko\'nikma'}" bo'yicha talaba hisoboti yangilandi.`
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Amaliy ko'nikma hisobotini tekshirish"
      subtitle="Talaba tomonidan kiritilgan manipulyatsiyani baholash va tasdiqlash"
      maxWidth="2xl"
    >
      <form onSubmit={handleReviewSubmit} className="p-6 space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Student & Skill Information Card */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Talaba ma'lumotlari
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                {student?.fullName || 'Talaba'}
              </h4>
              <p className="text-xs text-slate-500">
                ID: {student?.studentId} · Guruh: {student?.groupId} · PINFL: {student?.pinfl}
              </p>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
              log.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
              log.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
              'bg-amber-100 text-amber-800 animate-pulse'
            }`}>
              {log.status === 'APPROVED' ? 'Tasdiqlangan' : log.status === 'REJECTED' ? 'Qaytarilgan' : 'Tekshiruvda (Pending)'}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Ko'nikma:</span>
              <span className="font-semibold text-slate-800 truncate block">
                {skill?.name || log.skillId}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Kategoriya:</span>
              <span className="font-medium text-slate-700 block">
                {skill?.category || 'Klinik'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Sana:</span>
              <span className="font-mono text-slate-800 block">
                {log.date}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Bajarish / Turi:</span>
              <span className="font-bold text-blue-700 block">
                {log.count} marta ({log.participationType})
              </span>
            </div>
          </div>
        </div>

        {/* Patient Info (if any) */}
        {log.patientInfo && (
          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-xs flex items-center justify-between">
            <span className="text-blue-900 font-medium">
              Bemor: {log.patientInfo.age ? `${log.patientInfo.age} yosh, ` : ''}{log.patientInfo.gender || 'Erkak'}
              {log.patientInfo.clinicalCondition ? ` · Tashxis: ${log.patientInfo.clinicalCondition}` : ''}
            </span>
            <span className="text-[11px] text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-200">
              {log.patientInfo.department || 'Bo\'lim'}
            </span>
          </div>
        )}

        {/* Student Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Talabaning amaliyot kundaligi / manipulyatsiya tavsifi:
          </label>
          <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 leading-relaxed font-sans min-h-[60px]">
            {log.notes || 'Izoh yozilmagan'}
          </div>
          {log.dailyJournalId && (
            <span className="text-[11px] text-blue-600 mt-1 inline-block">
              ℹ️ Ushbu muolaja elektron amaliyot kundaligi ({log.dailyJournalId}) orqali bog'langan.
            </span>
          )}
        </div>

        {/* Decision Toggle */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
            Rahbar qarori:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDecision('APPROVE')}
              className={`p-3 rounded-lg border text-left transition-all flex items-center gap-2.5 ${
                decision === 'APPROVE'
                  ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="text-xs font-bold block">Tasdiqlash</span>
                <span className="text-[10px] text-slate-500 block">Hisobga olish va pasportga kiritish</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setDecision('REVISION')}
              className={`p-3 rounded-lg border text-left transition-all flex items-center gap-2.5 ${
                decision === 'REVISION'
                  ? 'border-rose-500 bg-rose-50/70 text-rose-900 ring-2 ring-rose-500/20'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <span className="text-xs font-bold block">Qaytarish (Revision)</span>
                <span className="text-[10px] text-slate-500 block">Qayta ishlash uchun sabab bilan qaytarish</span>
              </div>
            </button>
          </div>
        </div>

        {/* Approval Details: Rating and Feedback */}
        {decision === 'APPROVE' ? (
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Bajarish sifati bo'yicha baho:
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-slate-300 hover:text-amber-400 focus:outline-hidden transition-colors"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 ml-2">
                  {rating === 5 ? '5 - A\'lo' : rating === 4 ? '4 - Yaxshi' : rating === 3 ? '3 - Qoniqarli' : `${rating} ball`}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Rahbar taqrizi va tavsiyasi:
              </label>
              <textarea
                rows={2}
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Talabaning manipulyatsiya bajarish texnikasiga xulosa..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-semibold text-rose-800 mb-1">
              Qaytarish sababi va ko'rsatmalar *
            </label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Qaysi texnika buzilgan, nima sababdan rad etildi va talaba nimalarni qayta bajarishi lozim..."
              className="w-full px-3 py-2 text-xs border border-rose-300 rounded-lg bg-white focus:ring-2 focus:ring-rose-500"
              required
            />
          </div>
        )}

        {/* Buttons */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Yopish
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5 ${
              decision === 'APPROVE'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            {decision === 'APPROVE' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tasdiqlashni saqlash</span>
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5" />
                <span>Qaytarishni yuborish</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
