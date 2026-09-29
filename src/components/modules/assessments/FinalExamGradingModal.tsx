import React, { useState, useEffect } from 'react';
import {
  X,
  GraduationCap,
  Award,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { FinalExam, Student, Practice } from '../../../types';
import { storageService } from '../../../services/storageService';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

interface FinalExamGradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: FinalExam | null;
  onExamGraded: () => void;
}

export const FinalExamGradingModal: React.FC<FinalExamGradingModalProps> = ({
  isOpen,
  onClose,
  exam,
  onExamGraded
}) => {
  const { currentUser, role } = useAuth();
  const { showToast } = useToast();

  const settings = storageService.getAssessmentSettings();
  const weights = settings.examCriteriaWeights;

  const [theory, setTheory] = useState<number>(exam?.theoryScore || 5);
  const [practical, setPractical] = useState<number>(exam?.practicalScore || 7);
  const [clinicalCase, setClinicalCase] = useState<number>(exam?.clinicalCaseScore || 7);
  const [professionalism, setProfessionalism] = useState<number>(exam?.professionalismScore || 4);
  const [safety, setSafety] = useState<number>(exam?.safetyScore || 4);
  const [comments, setComments] = useState<string>(exam?.comments || '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (exam) {
      setTheory(exam.theoryScore || Math.round(weights.theoryMax * 0.8));
      setPractical(exam.practicalScore || Math.round(weights.practicalMax * 0.85));
      setClinicalCase(exam.clinicalCaseScore || Math.round(weights.clinicalCaseMax * 0.85));
      setProfessionalism(exam.professionalismScore || weights.professionalismMax);
      setSafety(exam.safetyScore || weights.safetyMax);
      setComments(exam.comments || 'Amaliy ko\'nikmalar va klinik keyslar to\'g\'ri tahlil qilindi.');
    }
  }, [exam]);

  if (!isOpen || !exam) return null;

  const students = storageService.getStudents();
  const student = students.find(s => s.id === exam.studentId);
  const practices = storageService.getPractices();
  const practice = practices.find(p => p.id === exam.practiceId);

  const totalScore = Math.min(
    settings.finalExamMaxScore,
    Number(theory) + Number(practical) + Number(clinicalCase) + Number(professionalism) + Number(safety)
  );
  const percentage = Math.round((totalScore / settings.finalExamMaxScore) * 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = storageService.gradeFinalExam(
        exam.id,
        {
          theoryScore: Number(theory),
          practicalScore: Number(practical),
          clinicalCaseScore: Number(clinicalCase),
          professionalismScore: Number(professionalism),
          safetyScore: Number(safety),
          comments,
          examinerName: currentUser?.fullName || 'Imtihon komissiyasi'
        },
        currentUser?.id || 'sys',
        role || 'PRACTICE_SUPERVISOR'
      );

      if (res.success) {
        showToast(
          'success',
          'Imtihon baholandi',
          `Talabaga ${totalScore} / ${settings.finalExamMaxScore} ball (${percentage}%) qo'yildi.`
        );
        onExamGraded();
        onClose();
      } else {
        showToast('error', 'Xatolik', res.error || 'Baholashda xatolik yuz berdi.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
              <GraduationCap className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Yakuniy imtihon natijasini kiritish</h3>
              <p className="text-xs text-slate-300">
                {student?.fullName || 'Talaba'} • {student?.group} • {practice?.name || 'Amaliyot'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Total Score Hero */}
        <div className="bg-indigo-50/70 border-b border-indigo-100 px-6 py-3.5 flex items-center justify-between shrink-0">
          <div>
            <span className="text-xs font-semibold text-indigo-950">Imtihon umumiy bali:</span>
            <div className="text-xs text-indigo-700">5 ta klinik mezon yig'indisi</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-mono text-indigo-900">{totalScore}</span>
            <span className="text-xs text-indigo-600 font-mono">/ {settings.finalExamMaxScore} ({percentage}%)</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          
          {/* Criterion 1 */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <label className="font-bold text-slate-900">1. Nazariy bilim</label>
                <p className="text-[11px] text-slate-500">Klinik etiologiya, patogenez va zamonaviy diagnostika usullari</p>
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                <input
                  type="number"
                  min={0}
                  max={weights.theoryMax}
                  step={0.5}
                  required
                  value={theory}
                  onChange={e => setTheory(Math.max(0, Math.min(weights.theoryMax, Number(e.target.value))))}
                  className="w-16 px-2 py-1 text-center font-bold border rounded-lg bg-white"
                />
                <span className="text-slate-400">/ {weights.theoryMax}</span>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={weights.theoryMax}
              step={0.5}
              value={theory}
              onChange={e => setTheory(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Criterion 2 */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <label className="font-bold text-slate-900">2. Amaliy manipulyatsiya bajarish</label>
                <p className="text-[11px] text-slate-500">Ko'nikmani mustaqil va to'g'ri texnika bilan ko'rsata olishi</p>
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                <input
                  type="number"
                  min={0}
                  max={weights.practicalMax}
                  step={0.5}
                  required
                  value={practical}
                  onChange={e => setPractical(Math.max(0, Math.min(weights.practicalMax, Number(e.target.value))))}
                  className="w-16 px-2 py-1 text-center font-bold border rounded-lg bg-white"
                />
                <span className="text-slate-400">/ {weights.practicalMax}</span>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={weights.practicalMax}
              step={0.5}
              value={practical}
              onChange={e => setPractical(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Criterion 3 */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <label className="font-bold text-slate-900">3. Klinik vaziyat (Clinical Case)</label>
                <p className="text-[11px] text-slate-500">Differensial tashxis, laborator tahlillar talqini va davolash rejasi</p>
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                <input
                  type="number"
                  min={0}
                  max={weights.clinicalCaseMax}
                  step={0.5}
                  required
                  value={clinicalCase}
                  onChange={e => setClinicalCase(Math.max(0, Math.min(weights.clinicalCaseMax, Number(e.target.value))))}
                  className="w-16 px-2 py-1 text-center font-bold border rounded-lg bg-white"
                />
                <span className="text-slate-400">/ {weights.clinicalCaseMax}</span>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={weights.clinicalCaseMax}
              step={0.5}
              value={clinicalCase}
              onChange={e => setClinicalCase(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Criterion 4 */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <label className="font-bold text-slate-900">4. Kasbiy muomala va etika</label>
                <p className="text-[11px] text-slate-500">Bemor, uning yaqinlari va tibbiy jamoa bilan madaniy munosabat</p>
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                <input
                  type="number"
                  min={0}
                  max={weights.professionalismMax}
                  step={0.5}
                  required
                  value={professionalism}
                  onChange={e => setProfessionalism(Math.max(0, Math.min(weights.professionalismMax, Number(e.target.value))))}
                  className="w-16 px-2 py-1 text-center font-bold border rounded-lg bg-white"
                />
                <span className="text-slate-400">/ {weights.professionalismMax}</span>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={weights.professionalismMax}
              step={0.5}
              value={professionalism}
              onChange={e => setProfessionalism(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Criterion 5 */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <label className="font-bold text-slate-900">5. Xavfsizlik, aseptika va deontologiya</label>
                <p className="text-[11px] text-slate-500">Sanitariya-epidemiologiya qoidalari, tibbiy sir va xavfsizlik</p>
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                <input
                  type="number"
                  min={0}
                  max={weights.safetyMax}
                  step={0.5}
                  required
                  value={safety}
                  onChange={e => setSafety(Math.max(0, Math.min(weights.safetyMax, Number(e.target.value))))}
                  className="w-16 px-2 py-1 text-center font-bold border rounded-lg bg-white"
                />
                <span className="text-slate-400">/ {weights.safetyMax}</span>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={weights.safetyMax}
              step={0.5}
              value={safety}
              onChange={e => setSafety(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Comments */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Imtihonchi xulosasi va taqrizi</label>
            <textarea
              rows={2}
              value={comments}
              onChange={e => setComments(e.target.value)}
              placeholder="Talabaning javobiga berilgan baho va kamchiliklar..."
              className="w-full px-3 py-2 border rounded-xl"
            />
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
              className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Saqlanmoqda...' : 'Bahoni tasdiqlash'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
