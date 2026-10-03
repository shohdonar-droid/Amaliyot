import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  Star,
  MessageSquare,
  ShieldCheck,
  UserCheck,
  Calendar,
  Building2,
  Stethoscope
} from 'lucide-react';
import { DailyJournal, Student } from '../../../types';
import { storageService } from '../../../services/storageService';
import { dailyJournalService } from '../../../services/dailyJournalService';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { Modal } from '../../common/Modal';

interface DailyJournalReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  journal: DailyJournal | null;
  student?: Student;
  initialDecision?: 'APPROVED' | 'REVISION';
}

export function DailyJournalReviewModal({
  isOpen,
  onClose,
  onSuccess,
  journal,
  student,
  initialDecision = 'APPROVED'
}: DailyJournalReviewModalProps) {
  const { currentUser, role } = useAuth();
  const { showToast } = useToast();

  const [decision, setDecision] = useState<'APPROVED' | 'REVISION'>(initialDecision);
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>('Klinik tahlil to\'g\'ri yozilgan. Bemorlar bilan muloqot va amaliy ko\'nikmalar hisobga olindi.');
  const [revisionReason, setRevisionReason] = useState<string>('');
  const [hoverRating, setHoverRating] = useState<number>(0);

  useEffect(() => {
    if (initialDecision) {
      setDecision(initialDecision);
    }
  }, [initialDecision, isOpen]);

  if (!journal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (decision === 'REVISION' && !revisionReason.trim()) {
      showToast('error', 'Sabab kiritilmadi', 'Qayta ishlashga yuborish uchun talabaga kamchiliklar sababini tushuntiring (Majburiy).');
      return;
    }

    // 1. Sync to dailyJournalService (Firestore / Cloud)
    try {
      if (decision === 'APPROVED') {
        await dailyJournalService.approveJournal(
          journal.id,
          currentUser?.uid || currentUser?.id || 'supervisor',
          feedback.trim()
        );
      } else {
        await dailyJournalService.returnJournal(
          journal.id,
          currentUser?.uid || currentUser?.id || 'supervisor',
          revisionReason.trim()
        );
      }
    } catch (fsErr) {
      console.warn('Firestore review sync error:', fsErr);
    }

    // 2. Sync to storageService (Local state & notifications & skills credit)
    const res = storageService.reviewDailyJournal({
      journalId: journal.id,
      status: decision,
      rating: decision === 'APPROVED' ? rating : undefined,
      feedback: feedback.trim(),
      revisionReason: decision === 'REVISION' ? revisionReason.trim() : undefined,
      reviewerName: currentUser?.fullName || 'Amaliyot rahbari',
      reviewerId: currentUser?.uid || currentUser?.id,
      actorUserId: currentUser?.id || 'system',
      actorRole: role || 'PRACTICE_SUPERVISOR'
    });

    if (!res.success) {
      showToast('error', 'Xatolik', res.error || 'Baholashni saqlab bo\'lmadi.');
      return;
    }

    showToast(
      decision === 'APPROVED' ? 'success' : 'warning',
      decision === 'APPROVED' ? 'Kundalik tasdiqlandi' : 'Qayta ishlashga yuborildi',
      decision === 'APPROVED'
        ? `Baho: ${rating}/5 qo'yildi. Talabaga xabar yuborildi.`
        : 'Talabaga kamchiliklarni to\'g\'rilash bo\'yicha bildirishnoma yuborildi.'
    );

    onSuccess();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Amaliyot kundaligini tekshirish va baholash"
      subtitle={`${student?.fullName || 'Talaba'} • ${journal.date} (${journal.department})`}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Student & Journal Snapshot */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between font-bold text-slate-800">
            <span>{student?.fullName}</span>
            <span className="text-blue-700 font-mono">{journal.date}</span>
          </div>
          <p className="text-slate-600 line-clamp-2">
            <span className="font-semibold text-slate-700">Bajarilgan ishlar:</span> {journal.workSummary}
          </p>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1 border-t border-slate-200">
            <span>Bemorlar: <strong>{journal.patientsExaminedCount} nafar</strong></span>
            <span>•</span>
            <span>Muolajalar: <strong>{journal.procedures?.length || journal.proceduresDone?.length || 0} ta</strong></span>
            <span>•</span>
            <span>Keyslar: <strong>{journal.clinicalCases?.length || 0} ta</strong></span>
          </div>
        </div>

        {/* Review Decision: APPROVED or REVISION */}
        <div>
          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
            Tekshiruv xulosasi (Qaror)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setDecision('APPROVED');
                if (!feedback.trim()) setFeedback('Klinik tahlil to\'g\'ri yozilgan. Bemorlar bilan muloqot va amaliy ko\'nikmalar hisobga olindi.');
              }}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                decision === 'APPROVED'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-400/30'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Tasdiqlash (Qabul qilish)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDecision('REVISION');
                if (!revisionReason.trim()) setRevisionReason('Bajarilgan muolajalar va klinik holat tafsilotlarini to\'liqroq yoritib, qayta topshiring.');
              }}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                decision === 'REVISION'
                  ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-400/30'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Qayta ishlashga yuborish</span>
            </button>
          </div>
        </div>

        {/* Rating Stars (If APPROVED) */}
        {decision === 'APPROVED' && (
          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Rahbar bahosi (1 dan 5 gacha)
              </label>
              <span className="text-xs font-black text-emerald-800">
                {rating === 5 ? "5 — A'lo" : rating === 4 ? "4 — Yaxshi" : rating === 3 ? "3 — Qoniqarli" : `${rating} ball`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1.5 focus:outline-hidden hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Revision Reason (If REVISION) */}
        {decision === 'REVISION' && (
          <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
            <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider">
              Qayta ishlash sababi va talablar (Majburiy) *
            </label>
            <textarea
              rows={3}
              value={revisionReason}
              onChange={e => setRevisionReason(e.target.value)}
              placeholder="Talabaga qaysi joylarni to'g'rilash kerakligini batafsil yozing... Masalan: Bajarilgan muolajalar soni va tekshiruv natijalarini to'liqroq yoritib bering."
              className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 leading-relaxed"
            />
          </div>
        )}

        {/* Feedback / Comments */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span>Rahbar taqrizi va metodik tavsiyalari</span>
          </label>
          <textarea
            rows={3}
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="Kundalik bo'yicha umumiy xulosa va amaliyotchi talabaga tavsiyalar..."
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 leading-relaxed"
          />
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Bekor qilish
          </button>

          <button
            type="submit"
            className={`flex items-center gap-2 px-5 py-2 text-xs font-bold text-white rounded-lg shadow-sm transition-all ${
              decision === 'APPROVED'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>
              {decision === 'APPROVED' ? "Tasdiqlash va bahoni saqlash" : "Qayta ishlashga yuborish"}
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
