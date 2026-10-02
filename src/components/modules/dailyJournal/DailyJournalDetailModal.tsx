import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Building2,
  Clock,
  UserCheck,
  Star,
  Printer,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Stethoscope,
  HeartPulse,
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  Edit3
} from 'lucide-react';
import { DailyJournal, Student, Practice, PracticePlace, Supervisor, JournalTemplate } from '../../../types';
import { journalTemplateService } from '../../../services/journalTemplateService';
import { Modal } from '../../common/Modal';
import { StatusBadge } from '../../common/Badge';

interface DailyJournalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  journal: DailyJournal | null;
  student?: Student;
  practice?: Practice;
  practicePlace?: PracticePlace;
  supervisor?: Supervisor;
  onEdit?: (journal: DailyJournal) => void;
  onReview?: (journal: DailyJournal) => void;
  onPrint?: (journal: DailyJournal) => void;
  canReview?: boolean;
  canEdit?: boolean;
}

export function DailyJournalDetailModal({
  isOpen,
  onClose,
  journal,
  student,
  practice,
  practicePlace,
  supervisor,
  onEdit,
  onReview,
  onPrint,
  canReview,
  canEdit
}: DailyJournalDetailModalProps) {
  const [template, setTemplate] = useState<JournalTemplate | null>(null);

  useEffect(() => {
    if (journal?.templateId) {
        journalTemplateService.getTemplateById(journal.templateId).then(setTemplate);
    } else {
        setTemplate(null);
    }
  }, [journal?.templateId]);

  if (!journal) return null;

  const statusUpper = journal.status.toUpperCase();
  const isSubmitted = statusUpper === 'SUBMITTED';
  const isSupervisorApproved = statusUpper === 'SUPERVISOR_APPROVED';
  const isFinalApproved = statusUpper === 'FINAL_APPROVED' || statusUpper === 'LOCKED';
  const isRevision = statusUpper === 'REVISION';
  const isPending = statusUpper === 'PENDING';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${student?.fullName || 'Talaba'} — Amaliyot kundaligi`}
      subtitle={`${journal.date} • ${practicePlace?.name || journal.attendanceSnapshot?.practicePlaceName || 'Klinik baza'} (${journal.department})`}
      maxWidth="3xl"
    >
      <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Header Status & Rating Card */}
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isApproved
            ? 'bg-emerald-50/70 border-emerald-200'
            : isRevision
            ? 'bg-amber-50/70 border-amber-200'
            : 'bg-blue-50/70 border-blue-200'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                isApproved
                  ? 'bg-emerald-600 text-white'
                  : isRevision
                  ? 'bg-amber-600 text-white'
                  : 'bg-blue-600 text-white'
              }`}>
                {isApproved ? 'Tasdiqlangan' : isRevision ? 'Qayta ishlashga yuborilgan' : 'Tekshiruvda'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Topshirilgan: {new Date(journal.submittedAt || journal.createdAt || new Date()).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}, {journal.date || journal.journalDate || ''}
              </span>
              {journal.version && journal.version > 1 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-200 text-slate-700 rounded">
                  v{journal.version}
                </span>
              )}
            </div>

            {/* Supervisor feedback preview */}
            {journal.supervisorFeedback && (
              <p className="text-xs text-slate-700 mt-1">
                <strong>Rahbar taqrizi:</strong> "{journal.supervisorFeedback}"
              </p>
            )}

            {isRevision && journal.revisionReason && (
              <p className="text-xs text-amber-900 font-medium">
                <strong>Qayta ishlash sababi:</strong> {journal.revisionReason}
              </p>
            )}

            {journal.reviewedBy && (
              <p className="text-[11px] text-slate-500">
                Tekshiruvchi: {journal.reviewedBy} {journal.reviewedAt ? `(${new Date(journal.reviewedAt).toLocaleDateString('uz-UZ')})` : ''}
              </p>
            )}
          </div>

          {/* Rating Stars if Approved */}
          {isApproved && journal.supervisorRating && (
            <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shadow-2xs shrink-0">
              <span className="text-xs font-bold text-slate-700 mr-1">Baho:</span>
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= (journal.supervisorRating || 0)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              ))}
              <span className="text-xs font-black text-slate-900 ml-1">
                {journal.supervisorRating}/5
              </span>
            </div>
          )}
        </div>

        {/* Section A: Bog'langan amaliyot va davomat ko'rsatkichlari */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Amaliyot kuni:</span>
            <span className="font-bold text-slate-800">{journal.date}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Davomat holati:</span>
            <span className="font-bold text-emerald-700">
              {journal.attendanceSnapshot?.status || 'PRESENT'} ({journal.attendanceSnapshot?.checkInTime || '08:15'} - {journal.attendanceSnapshot?.checkOutTime || '14:30'})
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Bo'lim:</span>
            <span className="font-semibold text-slate-800 truncate block">
              {journal.department}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Mas'ul rahbar:</span>
            <span className="font-semibold text-slate-800 truncate block">
              {supervisor?.fullName || journal.attendanceSnapshot?.supervisorName || 'Amaliyot rahbari'}
            </span>
          </div>
        </div>

        {/* Section B, C, D, E: Bajarilgan ishlar va keyslar */}
        {template && template.id === 'PSYCHOLOGY_DAILY' ? (
            <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-1">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Amaliyot kundaligi (Psixologiya)</span>
                </h4>
                {template.fields.sort((a, b) => a.order - b.order).map(field => (
                    <div key={field.key} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <p className="text-[11px] font-bold text-slate-700 uppercase">{field.label}:</p>
                        <p className="text-xs text-slate-800 font-serif leading-relaxed">
                            {String(journal.activityData?.[field.key] || '---')}
                        </p>
                    </div>
                ))}
            </div>
        ) : (
          <>
            {/* Section B: Bajarilgan ishlar */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Bugun bajarilgan ishlar tavsifi</span>
              </h4>
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {journal.workSummary || 'Bajarilgan ishlar matni kiritilmagan.'}
              </div>
            </div>

            {/* Section C & D: Bemorlar va Bajarilgan Muolajalar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-indigo-600" />
                  <span>Ko'rilgan bemorlar</span>
                </h4>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center font-black text-indigo-600 text-lg shadow-2xs">
                    {journal.patientsExaminedCount}
                    <span className="text-[9px] font-normal text-slate-400 -mt-1">nafar</span>
                  </div>
                  <div className="text-xs text-slate-600">
                    <p className="font-medium text-slate-700">Tashxislar va holatlar:</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {journal.patientDiagnosesSummary || 'Klinik bo\'lim bemorlari umumiy kuratsiyasi.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section D: Muolajalar */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-emerald-600" />
                  <span>Bajarilgan muolajalar ({journal.procedures?.length || journal.proceduresDone?.length || 0})</span>
                </h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {journal.procedures && journal.procedures.length > 0 ? (
                    journal.procedures.map((p, idx) => (
                      <div key={p.id || idx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200 text-xs">
                        <span className="font-medium text-slate-800 truncate mr-2">{p.name}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="px-1.5 py-0.5 font-bold text-[10px] bg-blue-100 text-blue-800 rounded">
                            {p.count} ta
                          </span>
                          <span className="px-1.5 py-0.5 text-[9px] font-medium bg-slate-100 text-slate-600 rounded">
                            {p.participationType}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    journal.proceduresDone?.map((p, idx) => (
                      <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-700">
                        {p}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Section E: Klinik holatlar */}
            {journal.clinicalCases && journal.clinicalCases.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Klinik keyslar tahlili</span>
                </h4>
                <div className="space-y-3">
                  {journal.clinicalCases.map((c, i) => (
                    <div key={c.id || i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between items-center font-bold text-slate-900 border-b border-slate-200 pb-1.5">
                        <span>{c.caseTitle}</span>
                        <span className="text-slate-500 font-normal">{c.patientAgeGender}</span>
                      </div>
                      {c.complaints && (
                        <p className="text-slate-700"><strong className="text-slate-900">Shikoyat va anamnez:</strong> {c.complaints} {c.anamnesis}</p>
                      )}
                      {c.presumptiveDiagnosis && (
                        <p className="text-slate-700"><strong className="text-slate-900">Tashxis:</strong> {c.presumptiveDiagnosis}</p>
                      )}
                      {c.treatmentTactics && (
                        <p className="text-slate-700"><strong className="text-slate-900">Davo taktikasi:</strong> {c.treatmentTactics}</p>
                      )}
                      {c.learnedAspect && (
                        <div className="p-2 bg-blue-50 text-blue-900 rounded-lg text-[11px] font-medium mt-1">
                          💡 <strong>Talabaning o'rgangan jihati:</strong> {c.learnedAspect}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Section F & G: Nazariya va Refleksiya */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Nazariy mavzular */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 text-[11px]">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>O'rganilgan mavzular va protokollar</span>
            </h4>
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
              {journal.topicsLearned || journal.questionsLearned || 'Klinik protokol va qo\'llanmalar.'}
            </p>
          </div>

          {/* O'z-o'zini tahlil */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              O'z-o'zini tahlil qilish (Refleksiya)
            </h4>
            {journal.selfReflection ? (
              <div className="space-y-1 text-slate-700">
                {typeof journal.selfReflection === 'object' ? (
                  <>
                    {(journal.selfReflection as any).whatLearned && (
                      <p><span className="font-medium text-slate-900">O'rgandim:</span> {(journal.selfReflection as any).whatLearned}</p>
                    )}
                    {(journal.selfReflection as any).skillsImproved && (
                      <p><span className="font-medium text-slate-900">Ko'nikma:</span> {(journal.selfReflection as any).skillsImproved}</p>
                    )}
                    {(journal.selfReflection as any).tomorrowFocus && (
                      <p><span className="font-medium text-slate-900">Ertaga:</span> {(journal.selfReflection as any).tomorrowFocus}</p>
                    )}
                  </>
                ) : (
                  <p>{String(journal.selfReflection)}</p>
                )}
              </div>
            ) : (
              <p className="text-slate-500">Refleksiya to'ldirilmagan.</p>
            )}
          </div>
        </div>

        {/* Section H: Fayllar va rasmlar */}
        {journal.attachments && journal.attachments.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-600" />
              <span>Biriktirilgan fayl va tasvirlar</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {journal.attachments.map((att, i) => (
                <div key={att.id || i} className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                  {att.type === 'image' ? (
                    <a href={att.url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg">
                      <img src={att.url} alt={att.name} className="w-full h-24 object-cover hover:scale-105 transition-transform" />
                    </a>
                  ) : (
                    <div className="w-full h-24 flex items-center justify-center bg-blue-100/60 rounded-lg text-blue-700 font-bold">
                      PDF Hujjat
                    </div>
                  )}
                  <p className="text-[11px] font-medium text-slate-700 truncate">{att.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Yopish
          </button>

          <div className="flex items-center gap-2">
            {onPrint && (
              <button
                type="button"
                onClick={() => onPrint(journal)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Chop etish / PDF</span>
              </button>
            )}

            {canEdit && isRevision && onEdit && (
              <button
                type="button"
                onClick={() => onEdit(journal)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-2xs transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Tahrirlash va qayta topshirish</span>
              </button>
            )}

            {canReview && onReview && (
              <button
                type="button"
                onClick={() => onReview(journal)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors"
              >
                <Star className="w-3.5 h-3.5 fill-white" />
                <span>Tekshirish va baholash</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
