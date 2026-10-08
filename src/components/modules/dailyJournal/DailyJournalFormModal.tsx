import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Building2,
  UserCheck,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Trash2,
  FileText,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Info,
  Sparkles,
  Lock,
  Stethoscope,
  HeartPulse,
  BookOpen
} from 'lucide-react';
import { DailyJournal, JournalProcedure, ClinicalCaseItem, JournalAttachment, ProcedureParticipationType, Attendance, PracticeAssignment, JournalTemplate } from '../../../types';
import { storageService } from '../../../services/storageService';
import { dailyJournalService } from '../../../services/dailyJournalService';
import { journalTemplateService } from '../../../services/journalTemplateService';
import { PsychologyJournalForm } from './PsychologyJournalForm';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { Modal } from '../../common/Modal';

interface DailyJournalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialJournal?: DailyJournal | null;
  targetDate?: string;
}

const COMMON_PROCEDURES = [
  'Arterial qon bosimini Korotkov usulida o\'lchash',
  '12 ta ulanishda EKG yozish va tahlil qilish',
  'Vena ichiga dori yuborish va tomchi dorilar tizimini ulash',
  'Muskul ichiga inyeksiya qilish',
  'Teri osti inyeksiyasini bajarish',
  'Aseptik bog\'lam qo\'yish va bog\'lovni almashtirish',
  'Pulsoksimetriya va tana haroratini monitoring qilish',
  'Glyukometr yordamida qondagi qand miqdorini aniqlash',
  'Qon guruhini va rezus omilni standart zardoblar bilan aniqlash',
  'Nafas olish soni va pulsni aniqlash hamda qayd etish',
  'Ko\'krak qafasi a\'zolari auskultatsiyasi va perkussiyasi',
  'Qorin bo\'shlig\'i a\'zolari yuzaki va chuqur palpatsiyasi',
  'Oshqozonni yuvish va nazogastral zond qo\'yish',
  'Siydik pufagini Foley kateteri bilan kateterizatsiya qilish',
  'Yurak-o\'pka reanimatsiyasi (BLS algoritmi)',
  'Boshqa muolaja'
];

export function DailyJournalFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialJournal,
  targetDate
}: DailyJournalFormModalProps) {
  const { currentUser, role } = useAuth();
  const { showToast } = useToast();

  const students = storageService.getStudents();
  const practices = storageService.getPractices();
  const practicePlaces = storageService.getPracticePlaces();
  const supervisors = storageService.getSupervisors();
  const assignments = storageService.getPracticeAssignments();
  const allAttendance = storageService.getAttendance();

  // Determine current student & practice with robust fallbacks
  const currentStudent = (students && students.find(s => s.userId === currentUser?.uid || s.id === currentUser?.studentId)) || students?.[0] || { id: 'std-1', fullName: 'Talaba', groupId: 'grp-401' };
  const studentAssignment = (assignments && assignments.find((a: PracticeAssignment) => a?.studentId === currentStudent?.id)) || assignments?.[0] || { id: 'asg-1', practiceId: practices?.[0]?.id || 'prac-1', practicePlaceId: practicePlaces?.[0]?.id || 'place-1', supervisorId: supervisors?.[0]?.id || 'sup-1', departmentId: 'pdept-1', department: 'Terapiya', startDate: '2026-09-01', endDate: '2026-10-15' };
  const activePractice = practices?.find(p => p.id === studentAssignment?.practiceId) || practices?.[0] || { id: 'prac-1', name: 'Klinik amaliyot', academicYear: '2025-2026' };
  const assignedPlace = practicePlaces?.find(p => p.id === studentAssignment?.practicePlaceId) || practicePlaces?.[0] || { id: 'place-1', name: 'Klinika' };
  const assignedSupervisor = supervisors?.find(s => s.id === studentAssignment?.supervisorId) || supervisors?.[0] || { id: 'sup-1', fullName: 'Rahbar' };

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(
    initialJournal?.date || targetDate || todayStr
  );

  useEffect(() => {
    async function loadTemplate() {
      if (initialJournal?.templateId) {
        const t = await journalTemplateService.getTemplateById(initialJournal.templateId);
        setTemplate(t);
        setActivityData(initialJournal.activityData || {});
      } else if (studentAssignment) {
        const templateId = await journalTemplateService.getJournalTemplateForAssignment(studentAssignment);
        if (templateId) {
            const t = await journalTemplateService.getTemplateById(templateId);
            setTemplate(t);
        }
      }
    }
    loadTemplate();
  }, [initialJournal, studentAssignment]);

  // Validation state
  const [eligibility, setEligibility] = useState<{
    eligible: boolean;
    reason?: string;
    attendance?: Attendance;
  }>({ eligible: true });

  // Form Fields
  const [workSummary, setWorkSummary] = useState('');
  const [patientsCount, setPatientsCount] = useState<number>(3);
  const [patientDiagnoses, setPatientDiagnoses] = useState('');
  
  // Procedures
  const [procedures, setProcedures] = useState<JournalProcedure[]>([
    {
      id: 'prc-init-1',
      name: 'Arterial qon bosimini Korotkov usulida o\'lchash',
      count: 3,
      participationType: 'Mustaqil'
    }
  ]);

  // Clinical Cases
  const [clinicalCases, setClinicalCases] = useState<ClinicalCaseItem[]>([]);
  const [isAddingCase, setIsAddingCase] = useState(false);
  const [newCase, setNewCase] = useState<ClinicalCaseItem>({
    id: '',
    caseTitle: '',
    patientAgeGender: '',
    complaints: '',
    anamnesis: '',
    examination: '',
    presumptiveDiagnosis: '',
    treatmentTactics: '',
    learnedAspect: ''
  });

  // Topics & Reflection
  const [topicsLearned, setTopicsLearned] = useState('');
  const [whatLearned, setWhatLearned] = useState('');
  const [skillsImproved, setSkillsImproved] = useState('');
  const [tomorrowFocus, setTomorrowFocus] = useState('');

  // Attachments
  const [attachments, setAttachments] = useState<JournalAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Template/Dynamic fields
  const [template, setTemplate] = useState<JournalTemplate | null>(null);
  const [activityData, setActivityData] = useState<Record<string, unknown>>({});

  // Load existing journal when editing or revision
  useEffect(() => {
    if (initialJournal) {
      setSelectedDate(initialJournal.date || initialJournal.journalDate || new Date().toISOString().split('T')[0]);
      setWorkSummary(initialJournal.workSummary || '');
      setPatientsCount(initialJournal.patientsExaminedCount || 0);
      setPatientDiagnoses(initialJournal.patientDiagnosesSummary || '');
      
      if (initialJournal.procedures && initialJournal.procedures.length > 0) {
        setProcedures(initialJournal.procedures);
      } else if (initialJournal.proceduresDone && initialJournal.proceduresDone.length > 0) {
        setProcedures(
          initialJournal.proceduresDone.map((p, idx) => ({
            id: `prc-${idx}`,
            name: p,
            count: 1,
            participationType: 'Mustaqil'
          }))
        );
      }

      if (initialJournal.clinicalCases && initialJournal.clinicalCases.length > 0) {
        setClinicalCases(initialJournal.clinicalCases);
      } else if (initialJournal.clinicalCasesSummary) {
        setClinicalCases([
          {
            id: 'cc-legacy',
            caseTitle: 'Klinik holat',
            patientAgeGender: 'Noma\'lum',
            complaints: '',
            anamnesis: '',
            examination: '',
            presumptiveDiagnosis: initialJournal.clinicalCasesSummary,
            treatmentTactics: '',
            learnedAspect: ''
          }
        ]);
      }

      const topics = initialJournal.topicsLearned || initialJournal.questionsLearned || '';
      setTopicsLearned(
        typeof topics === 'string' 
          ? topics 
          : (Array.isArray(topics) ? topics.join(', ') : String(topics))
      );
      if (initialJournal.selfReflection) {
        const ref = initialJournal.selfReflection;
        if (typeof ref === 'object' && ref !== null) {
          setWhatLearned((ref as any).whatLearned || '');
          setSkillsImproved((ref as any).skillsImproved || '');
          setTomorrowFocus((ref as any).tomorrowFocus || '');
        } else {
          setWhatLearned(String(ref));
        }
      }

      setAttachments(initialJournal.attachments || []);
    } else {
      // Default reset
      setWorkSummary('');
      setPatientsCount(3);
      setPatientDiagnoses('');
      setProcedures([
        {
          id: `prc-${Date.now()}`,
          name: 'Arterial qon bosimini Korotkov usulida o\'lchash',
          count: 3,
          participationType: 'Mustaqil'
        }
      ]);
      setClinicalCases([]);
      setTopicsLearned('');
      setWhatLearned('');
      setSkillsImproved('');
      setTomorrowFocus('');
      setAttachments([]);
    }
  }, [initialJournal, isOpen]);

  // Check eligibility whenever date or practice changes
  useEffect(() => {
    if (!isOpen || !currentStudent || !activePractice) return;

    const check = storageService.validateJournalEligibility(
      currentStudent.id,
      activePractice.id,
      selectedDate,
      initialJournal?.id
    );

    setEligibility({
      eligible: check.eligible,
      reason: check.reason,
      attendance: check.attendance
    });
  }, [selectedDate, currentStudent, activePractice, isOpen, initialJournal]);

  // Handler: Add Procedure
  const handleAddProcedure = () => {
    const newProc: JournalProcedure = {
      id: `prc-${Date.now()}`,
      name: COMMON_PROCEDURES[0],
      count: 1,
      participationType: 'Mustaqil'
    };
    setProcedures([...procedures, newProc]);
  };

  const handleUpdateProcedure = (index: number, field: keyof JournalProcedure, value: any) => {
    const updated = [...procedures];
    updated[index] = { ...updated[index], [field]: value };
    setProcedures(updated);
  };

  const handleRemoveProcedure = (index: number) => {
    setProcedures(procedures.filter((_, i) => i !== index));
  };

  // Handler: Save Clinical Case
  const handleSaveCase = () => {
    if (!newCase.caseTitle.trim()) {
      showToast('warning', 'Holat nomi kiritilmadi', 'Iltimos, klinik holat nomini kiriting.');
      return;
    }
    const item: ClinicalCaseItem = {
      ...newCase,
      id: `cc-${Date.now()}`
    };
    setClinicalCases([...clinicalCases, item]);
    setIsAddingCase(false);
    setNewCase({
      id: '',
      caseTitle: '',
      patientAgeGender: '',
      complaints: '',
      anamnesis: '',
      examination: '',
      presumptiveDiagnosis: '',
      treatmentTactics: '',
      learnedAspect: ''
    });
  };

  // Handler: File Upload Simulation (with security & size checks)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const validFiles: JournalAttachment[] = [];

    Array.from(files).forEach((file, index) => {
      // Size check: max 10MB
      if (file.size > 10 * 1024 * 1024) {
        showToast('error', 'Fayl juda katta', `${file.name} hajmi 10 MB dan oshmasligi kerak.`);
        return;
      }

      // Format check
      const isImg = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';
      if (!isImg && !isPdf) {
        showToast('error', 'Format mos kelmadi', `${file.name} faqat rasm yoki PDF bo'lishi kerak.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const fileUrl = event.target?.result as string || '';
        const attachment: JournalAttachment = {
          id: `att-file-${Date.now()}-${index}`,
          name: file.name,
          url: fileUrl,
          type: isImg ? 'image' : 'file',
          sizeBytes: file.size,
          sizeFormatted: `${(file.size / 1024).toFixed(0)} KB`,
          uploadedAt: new Date().toISOString()
        };
        setAttachments(prev => [...prev, attachment]);
      };
      reader.readAsDataURL(file);
    });

    setTimeout(() => {
      setIsUploading(false);
      showToast('success', 'Fayl biriktirildi', 'Hujjat va rasmlar muvaffaqiyatli saqlandi.');
    }, 600);
  };

  const isLocked = Boolean(
    initialJournal && (
      initialJournal.isLocked ||
      initialJournal.status === 'LOCKED' ||
      initialJournal.status === 'FINAL_APPROVED' ||
      initialJournal.status === 'SUPERVISOR_APPROVED' ||
      initialJournal.status === 'FINAL_PENDING'
    )
  );

  // Handler: Save Draft or Submit
  const handleSave = async (isDraft: boolean) => {
    if (isLocked) {
      showToast('error', 'Qulflangan', 'Ushbu kundalik tasdiqlangan va qulflangan, tahrirlash mumkin emas.');
      return;
    }

    if (!isDraft && !eligibility.eligible && !(initialJournal && (initialJournal.status === 'REVISION' || initialJournal.status === 'revision'))) {
      showToast('error', 'Kundalik to\'ldirish taqiqlangan', eligibility.reason || 'Talablar bajarilmadi.');
      return;
    }

    if (!isDraft && workSummary.trim().length < 25) {
      showToast('error', 'Matn juda qisqa', 'Bugun bajargan ishlaringiz kamida 25 ta belgidan iborat bo\'lishi shart ("Amaliyot o\'tadim" kabi qisqa soxta yozuv qabul qilinmaydi).');
      return;
    }

    const targetStatus = isDraft ? 'DRAFT' : 'SUBMITTED';

    const payload: DailyJournal = {
      id: initialJournal?.id || `dj-${Date.now()}-${currentStudent.id}`,
      studentId: currentStudent.id,
      practiceId: activePractice.id,
      assignmentId: studentAssignment.id,
      practicePlaceId: assignedPlace.id,
      departmentId: studentAssignment.departmentId || 'pdept-1',
      department: studentAssignment.department || 'Terapiya',
      supervisorId: assignedSupervisor.id,
      attendanceId: eligibility.attendance?.id || initialJournal?.attendanceId || 'att-cur',
      date: selectedDate,
      workSummary: workSummary.trim(),
      patientsExaminedCount: Number(patientsCount) || 0,
      patientDiagnosesSummary: patientDiagnoses.trim(),
      procedures: procedures,
      proceduresDone: procedures.map(p => `${p.name} (${p.count} ta, ${p.participationType})`),
      clinicalCases: clinicalCases,
      clinicalCasesSummary: clinicalCases.length > 0 ? clinicalCases.map(c => c.caseTitle).join('; ') : '',
      topicsLearned: topicsLearned.trim(),
      questionsLearned: topicsLearned.trim(),
      selfReflection: {
        whatLearned: whatLearned.trim(),
        skillsImproved: skillsImproved.trim(),
        tomorrowFocus: tomorrowFocus.trim()
      },
      attachments: attachments,
      photoURLs: attachments.filter(a => a.type === 'image').map(a => a.url),
      status: targetStatus,
      submittedAt: isDraft ? undefined : new Date().toISOString(),
      version: (initialJournal?.version || 0) + 1,
      templateId: template?.id,
      activityData: template?.id === 'PSYCHOLOGY_DAILY' ? activityData : undefined
    };

    // 1. Sync to dailyJournalService (Firestore / Cloud)
    try {
      if (!isDraft && initialJournal?.id) {
        await dailyJournalService.submitJournal(initialJournal.id, currentUser?.uid || currentStudent.id);
      }
    } catch (fsErr) {
      console.warn('Firestore journal submit error:', fsErr);
    }

    // 2. Sync to storageService
    const res = storageService.submitDailyJournal(
      payload,
      currentUser?.id || currentStudent.id,
      'STUDENT'
    );

    if (!res.success) {
      showToast('error', 'Xatolik yuz berdi', res.error || 'Kundalikni saqlash imkoni bo\'lmadi.');
      return;
    }

    if (isDraft) {
      showToast('info', 'Qoralama saqlandi', 'Kundalik qoralama (DRAFT) sifatida saqlandi. Xohlagan vaqtda davom ettirishingiz mumkin.');
    } else {
      showToast('success', 'Kundalik topshirildi', 'Amaliyot kundaligi muvaffaqiyatli topshirildi va rahbar tekshiruviga yuborildi.');
    }

    onSuccess();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave(false);
  };

  // Student's available attendances for quick date picking
  const studentAttendances = allAttendance
    .filter(a => a.studentId === currentStudent?.id && a.practiceId === activePractice?.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialJournal?.status === 'REVISION' || initialJournal?.status === 'revision' ? "Kundalikni tahrirlash va qayta topshirish" : "Elektron amaliyot kundaligini to'ldirish"}
      subtitle={`${activePractice?.name} • ${assignedPlace?.name} (${studentAssignment?.department})`}
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Locked alert if already supervisor approved or locked */}
        {isLocked && (
          <div className="p-4 bg-slate-900 border border-slate-800 text-white rounded-xl flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs">
              <strong className="block text-amber-300 font-bold mb-0.5">
                Kundalik tasdiqlangan va qulflangan ({initialJournal?.status})
              </strong>
              <p className="text-slate-300">
                Ushbu kundalik allaqachon rahbar yoki amaliyot bo'limi tomonidan tasdiqlangan. Undagi ma'lumotlarni o'zgartirish taqiqlanadi.
              </p>
            </div>
          </div>
        )}

        {/* Revision Alert if Resubmitting */}
        {(initialJournal?.status === 'REVISION' || initialJournal?.status === 'revision') && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Rahbar tomonidan qayta ishlashga yuborilgan
              </h4>
              <p className="text-xs text-amber-800">
                <strong>Qayta ishlash sababi / Izoh:</strong> "{initialJournal.revisionReason || initialJournal.supervisorFeedback || 'Kamchiliklarni to\'g\'rilab qayta topshiring'}"
              </p>
              <p className="text-[11px] text-amber-700">
                Tekshiruvchi: {initialJournal.reviewedBy || 'Amaliyot rahbari'}
              </p>
            </div>
          </div>
        )}

        {/* Section A: BUGUNGI AMALIYOT VA DAVOMAT TEKSHIRUVI */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                A. Amaliyot kuni va davomat bog'liqligi
              </h3>
            </div>
            <span className="text-[11px] font-medium text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
              Avtomatik tekshiruv
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Kundalik sanasi
              </label>
              <select
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                disabled={Boolean(initialJournal)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 font-medium disabled:bg-slate-100"
              >
                {studentAttendances.map(att => (
                  <option key={att.id} value={att.date}>
                    {att.date} — {att.status === 'PRESENT' ? 'Kelgan (PRESENT)' : att.status === 'LATE' ? 'Kechikkan (LATE)' : att.status === 'EXCUSED' ? 'Uzrli (EXCUSED)' : 'Kelmagan (ABSENT)'}
                  </option>
                ))}
                {!studentAttendances.some(a => a.date === selectedDate) && (
                  <option value={selectedDate}>{selectedDate} (Tanlangan sana)</option>
                )}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Faqat tasdiqlangan davomatli kunlar uchun kundalik to'ldiriladi.
              </p>
            </div>

            {/* Read-only Linked Attendance Info */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Davomat statusi:</span>
                {eligibility.attendance ? (
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                    eligibility.attendance.status === 'PRESENT'
                      ? 'bg-emerald-100 text-emerald-800'
                      : eligibility.attendance.status === 'LATE'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {eligibility.attendance.status}
                  </span>
                ) : (
                  <span className="text-rose-600 font-semibold text-[11px]">Qayd etilmagan</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Kelish vaqti:</span>
                <span className="font-medium text-slate-800 font-mono">
                  {eligibility.attendance?.checkInTime || '—'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Ketish vaqti:</span>
                <span className="font-medium text-slate-800 font-mono">
                  {eligibility.attendance?.checkOutTime || '14:30'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Klinika / Bo'lim:</span>
                <span className="font-medium text-slate-800 truncate max-w-[160px]">
                  {assignedPlace.name} / {studentAssignment.department}
                </span>
              </div>
            </div>
          </div>

          {/* Validation Warning / Error Banner */}
          {!eligibility.eligible && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-800">
                <p className="font-bold">Kundalik to'ldirish taqiqlanadi:</p>
                <p className="mt-0.5">{eligibility.reason}</p>
              </div>
            </div>
          )}

          {eligibility.eligible && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Davomat tasdiqlangan ({eligibility.attendance?.status}). Ushbu sana uchun kundalik to'ldirishga to'liq ruxsat berildi.
              </span>
            </div>
          )}
        </div>

        {/* Section B: BUGUN BAJARILGAN ISHLAR */}
        {(!template || template.id !== 'PSYCHOLOGY_DAILY') ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>B. Bugun bajarilgan ishlar (Batafsil matn)</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className={`text-[11px] font-mono ${
                workSummary.trim().length >= 25 ? 'text-emerald-600 font-semibold' : 'text-slate-400'
              }`}>
                {workSummary.trim().length} / min 25 belgi
              </span>
            </div>
            <textarea
              rows={4}
              value={workSummary}
              onChange={e => setWorkSummary(e.target.value)}
              disabled={!eligibility.eligible}
              placeholder="Bugun bajargan ishlaringizni batafsil yozing... Masalan: Terapiya bo'limida ertalabki vrachlar konferensiyasida qatnashdim. Palatada bemorlarning shikoyatlarini o'rgandim, qon bosimini o'lchadim, anamnez yig'ishda va EKG tahlilida ishtirok etdim..."
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 leading-relaxed disabled:bg-slate-100"
            />
            {workSummary.trim().length > 0 && workSummary.trim().length < 25 && (
              <p className="text-[11px] text-amber-600 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                Iltimos, amaliyotda bajargan ishlaringizni to'liqroq yozing ("Amaliyot o'tadim" kabi qisqa soxta yozuv qabul qilinmaydi).
              </p>
            )}
          </div>
        ) : (
           <PsychologyJournalForm
              template={template}
              data={activityData}
              disabled={!eligibility.eligible}
              onChange={(key, value) => setActivityData(prev => ({ ...prev, [key]: value }))}
           />
        )}

        {/* Section C: KO'RILGAN BEMORLAR */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-indigo-100 text-indigo-700 rounded-md">
              <HeartPulse className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              C. Ko'rilgan bemorlar
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Ko'rilgan bemorlar soni
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={patientsCount}
                onChange={e => setPatientsCount(Math.max(0, Number(e.target.value)))}
                disabled={!eligibility.eligible}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 font-bold text-slate-800"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Asosiy patologiyalar va tashxislar
              </label>
              <input
                type="text"
                value={patientDiagnoses}
                onChange={e => setPatientDiagnoses(e.target.value)}
                disabled={!eligibility.eligible}
                placeholder="Masalan: Gipertoniya II bosqich (2 nafar), Pnevmoniya (1 nafar)..."
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section D: BAJARILGAN MUOLAJALAR */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-emerald-100 text-emerald-700 rounded-md">
                <Stethoscope className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                D. Bajarilgan muolajalar va manipulyatsiyalar
              </h3>
            </div>
            <button
              type="button"
              onClick={handleAddProcedure}
              disabled={!eligibility.eligible}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Muolaja qo'shish</span>
            </button>
          </div>

          <div className="space-y-2">
            {procedures.map((proc, index) => (
              <div
                key={proc.id || index}
                className="flex flex-col sm:flex-row items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <div className="flex-1 w-full sm:w-auto">
                  <input
                    type="text"
                    list="common-procedures-list"
                    value={proc.name}
                    onChange={e => handleUpdateProcedure(index, 'name', e.target.value)}
                    placeholder="Muolaja nomini tanlang yoki yozing"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[11px] text-slate-500">Soni:</span>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={proc.count}
                      onChange={e => handleUpdateProcedure(index, 'count', Math.max(1, Number(e.target.value)))}
                      className="w-14 px-2 py-1 text-xs border border-slate-300 rounded-md text-center font-bold bg-white"
                    />
                  </div>

                  <select
                    value={proc.participationType}
                    onChange={e => handleUpdateProcedure(index, 'participationType', e.target.value as ProcedureParticipationType)}
                    className="px-2 py-1 text-xs border border-slate-300 rounded-md bg-white shrink-0 font-medium"
                  >
                    <option value="Mustaqil">Mustaqil</option>
                    <option value="Rahbar nazoratida">Rahbar nazoratida</option>
                    <option value="Kuzatuvchi">Kuzatuvchi</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleRemoveProcedure(index)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors shrink-0"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <datalist id="common-procedures-list">
              {COMMON_PROCEDURES.map((p, i) => (
                <option key={i} value={p} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Section E: KLINIK HOLATLAR */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-amber-100 text-amber-700 rounded-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                E. Klinik holatlar (Keys tahlili)
              </h3>
            </div>
            {!isAddingCase && (
              <button
                type="button"
                onClick={() => setIsAddingCase(true)}
                disabled={!eligibility.eligible}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Klinik holat qo'shish</span>
              </button>
            )}
          </div>

          {/* Medical Confidentiality Notice */}
          <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-[11px] text-blue-900">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Tibbiy maxfiylik kafolati:</strong> Bemorning shaxsiy ma'lumotlari (F.I.Sh., pasport, telefon) maxfiy saqlanadi. Faqat anonimlashtirilgan klinik ma'lumotlar kiritiladi.
            </span>
          </div>

          {/* Existing Clinical Cases List */}
          {clinicalCases.length > 0 && (
            <div className="space-y-2">
              {clinicalCases.map((c, i) => (
                <div key={c.id || i} className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>{i + 1}. {c.caseTitle} ({c.patientAgeGender || 'Yosh/jins ko\'rsatilmagan'})</span>
                    <button
                      type="button"
                      onClick={() => setClinicalCases(clinicalCases.filter((_, idx) => idx !== i))}
                      className="text-rose-500 hover:text-rose-700 text-xs"
                    >
                      O'chirish
                    </button>
                  </div>
                  <p className="text-slate-600"><span className="font-medium text-slate-700">Tashxis:</span> {c.presumptiveDiagnosis}</p>
                  <p className="text-slate-600"><span className="font-medium text-slate-700">Taktika:</span> {c.treatmentTactics}</p>
                  {c.learnedAspect && (
                    <p className="text-blue-700 bg-blue-50/50 p-1.5 rounded mt-1">
                      <span className="font-semibold">O'rganilgan jihat:</span> {c.learnedAspect}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Adding New Case Form */}
          {isAddingCase && (
            <div className="p-3.5 bg-white border border-blue-200 rounded-xl space-y-3 animate-in fade-in">
              <h4 className="text-xs font-bold text-blue-900 uppercase">Yangi klinik keys qo'shish</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Holat nomi *</label>
                  <input
                    type="text"
                    value={newCase.caseTitle}
                    onChange={e => setNewCase({ ...newCase, caseTitle: e.target.value })}
                    placeholder="Masalan: Gipertonik kriz asoratsiz"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Bemorning yoshi va jinsi</label>
                  <input
                    type="text"
                    value={newCase.patientAgeGender}
                    onChange={e => setNewCase({ ...newCase, patientAgeGender: e.target.value })}
                    placeholder="Masalan: 58 yosh, Erkak"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Bemor shikoyatlari va anamnez</label>
                <textarea
                  rows={2}
                  value={newCase.complaints}
                  onChange={e => setNewCase({ ...newCase, complaints: e.target.value })}
                  placeholder="Ensa sohasida og'riq, qon bosimi oshishi..."
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Taxminiy / Asosiy tashxis</label>
                  <input
                    type="text"
                    value={newCase.presumptiveDiagnosis}
                    onChange={e => setNewCase({ ...newCase, presumptiveDiagnosis: e.target.value })}
                    placeholder="Gipertoniya II bosqich..."
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Davolash / Klinik taktika</label>
                  <input
                    type="text"
                    value={newCase.treatmentTactics}
                    onChange={e => setNewCase({ ...newCase, treatmentTactics: e.target.value })}
                    placeholder="Kaptopril 25 mg sublingual..."
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Talabaning o'rgangan jihati</label>
                <input
                  type="text"
                  value={newCase.learnedAspect}
                  onChange={e => setNewCase({ ...newCase, learnedAspect: e.target.value })}
                  placeholder="Kriz holatida qon bosimini bosqichma-bosqich pasaytirish..."
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingCase(false)}
                  className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={handleSaveCase}
                  className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Keysni qo'shish
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Section F: O'RGANILGAN MAVZULAR */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>F. Bugun o'rganilgan nazariy mavzular va protokollar</span>
          </label>
          <textarea
            rows={2}
            value={topicsLearned}
            onChange={e => setTopicsLearned(e.target.value)}
            disabled={!eligibility.eligible}
            placeholder="Masalan: Arterial gipertenziya milliy klinik protokoli, kriz diferensial diagnostikasi..."
            className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
          />
        </div>

        {/* Section G: O'Z-O'ZINI TAHLIL QILISH */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            G. O'z-o'zini tahlil qilish (Refleksiya)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Bugun nimalarni o'rgandim?
              </label>
              <textarea
                rows={2}
                value={whatLearned}
                onChange={e => setWhatLearned(e.target.value)}
                disabled={!eligibility.eligible}
                placeholder="Yangi klinik qirralar..."
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Qaysi ko'nikmam yaxshilandi?
              </label>
              <textarea
                rows={2}
                value={skillsImproved}
                onChange={e => setSkillsImproved(e.target.value)}
                disabled={!eligibility.eligible}
                placeholder="Qon bosimi, EKG..."
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Ertaga nimalarga e'tibor beraman?
              </label>
              <textarea
                rows={2}
                value={tomorrowFocus}
                onChange={e => setTomorrowFocus(e.target.value)}
                disabled={!eligibility.eligible}
                placeholder="Ertangi maqsadlarim..."
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section H: RASM VA FAYL BIRIKTIRISH (Section 6) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-600" />
              <span>H. Amaliyotga oid rasm va fayllar (Max 10 MB)</span>
            </h3>
            <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Yuklanmoqda...' : 'Fayl biriktirish'}</span>
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                disabled={!eligibility.eligible || isUploading}
                className="hidden"
              />
            </label>
          </div>

          {/* Attached Files Grid */}
          {attachments.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {attachments.map((att, idx) => (
                <div key={att.id || idx} className="relative group p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  {att.type === 'image' ? (
                    <img src={att.url} alt={att.name} className="w-full h-20 object-cover rounded-md" />
                  ) : (
                    <div className="w-full h-20 flex flex-col items-center justify-center bg-blue-50 text-blue-700 rounded-md">
                      <FileText className="w-8 h-8" />
                      <span className="text-[10px] mt-1 font-mono uppercase">PDF</span>
                    </div>
                  )}
                  <p className="text-[11px] font-medium text-slate-700 truncate mt-1">{att.name}</p>
                  <p className="text-[10px] text-slate-400">{att.sizeFormatted}</p>
                  <button
                    type="button"
                    onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {isLocked ? "Yopish" : "Bekor qilish"}
          </button>

          {!isLocked && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleSave(true);
                }}
                disabled={!eligibility.eligible && !(initialJournal && (initialJournal.status === 'REVISION' || initialJournal.status === 'revision'))}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
              >
                Qoralama sifatida saqlash (DRAFT)
              </button>

              <button
                type="submit"
                disabled={!eligibility.eligible && !(initialJournal && (initialJournal.status === 'REVISION' || initialJournal.status === 'revision'))}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {initialJournal?.status === 'REVISION' || initialJournal?.status === 'revision'
                    ? "Tahrirlab qayta topshirish (SUBMIT)"
                    : "Rahbarga topshirish (SUBMIT)"}
                </span>
              </button>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
