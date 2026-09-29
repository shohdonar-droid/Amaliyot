import React, { useState, useEffect } from 'react';
import {
  X,
  Award,
  CheckCircle2,
  AlertTriangle,
  CalendarCheck,
  BookOpen,
  Stethoscope,
  GraduationCap,
  RotateCcw,
  Printer,
  ChevronRight,
  ShieldAlert,
  Clock,
  Sparkles,
  FileCheck2,
  Building2,
  UserCheck,
  RefreshCw,
  Info
} from 'lucide-react';
import { Student, Practice, Assessment, FinalExam } from '../../../types';
import { storageService } from '../../../services/storageService';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

interface StudentAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  practiceId: string;
  onAssessmentUpdated: () => void;
  onOpenExamGrading?: (exam: FinalExam) => void;
  onOpenRetake?: (assessment: Assessment) => void;
  onOpenCertificate?: (student: Student, assessment: Assessment) => void;
}

export const StudentAssessmentModal: React.FC<StudentAssessmentModalProps> = ({
  isOpen,
  onClose,
  student,
  practiceId,
  onAssessmentUpdated,
  onOpenExamGrading,
  onOpenRetake,
  onOpenCertificate
}) => {
  const { currentUser, role } = useAuth();
  const { showToast } = useToast();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'journal' | 'skills' | 'exam'>('overview');
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    if (student && practiceId) {
      loadAssessment();
    }
  }, [student, practiceId]);

  const loadAssessment = () => {
    if (!student) return;
    const current = storageService.calculateStudentAssessment(student.id, practiceId);
    setAssessment(current);
    setFeedback(current.feedback || '');
  };

  if (!isOpen || !student) return null;

  const practices = storageService.getPractices();
  const practice = practices.find(p => p.id === practiceId) || practices[0];
  const assignments = storageService.getPracticeAssignments();
  const assignment = assignments.find(a => a.studentId === student.id && a.practiceId === practiceId);
  const places = storageService.getPracticePlaces();
  const practicePlace = places.find(p => p.id === assignment?.practicePlaceId);
  const supervisors = storageService.getSupervisors();
  const supervisor = supervisors.find(s => s.id === assignment?.supervisorId);
  const settings = storageService.getAssessmentSettings();

  const attData = storageService.calculateStudentAttendanceScore(student.id, practiceId);
  const jnlData = storageService.calculateStudentJournalScore(student.id, practiceId);
  const sklData = storageService.calculateStudentSkillsScore(student.id, practiceId);
  const exmData = storageService.calculateStudentFinalExamScore(student.id, practiceId);

  const isSupervisorOrAdmin = ['SUPER_ADMIN', 'PRACTICE_HEAD', 'PRACTICE_STAFF', 'FACULTY_DEAN', 'PRACTICE_SUPERVISOR', 'CLINIC_RESPONSIBLE'].includes(role || '');
  const canApprove = ['SUPER_ADMIN', 'PRACTICE_HEAD', 'FACULTY_DEAN', 'PRACTICE_SUPERVISOR'].includes(role || '');

  const totalScore = assessment?.totalScore ?? (attData.score + jnlData.score + sklData.score + exmData.score);
  const grade = assessment?.grade || (totalScore >= settings.grade5Min ? '5' : totalScore >= settings.grade4Min ? '4' : totalScore >= settings.grade3Min ? '3' : '2');

  const gradeText = 
    grade === '5' ? "5 (A'lo)" :
    grade === '4' ? "4 (Yaxshi)" :
    grade === '3' ? "3 (Qoniqarli)" : "2 (Qoniqarsiz / Qayta topshirish)";

  const gradeColor = 
    grade === '5' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
    grade === '4' ? 'bg-blue-50 text-blue-700 border-blue-200' :
    grade === '3' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200';

  const handleRecalculate = () => {
    const updated = storageService.calculateAndSaveAssessment(
      student.id,
      practiceId,
      currentUser?.id || 'sys',
      role || 'PRACTICE_SUPERVISOR'
    );
    setAssessment(updated);
    setFeedback(updated.feedback || '');
    showToast('info', 'Yangilandi', 'Ballar tizimdagi barcha ma\'lumotlar bilan qayta hisoblandi.');
    onAssessmentUpdated();
  };

  const handleApprove = () => {
    if (!assessment) return;
    setIsApproving(true);
    try {
      const res = storageService.approveAssessment(
        assessment.id,
        currentUser?.id || 'sup-1',
        currentUser?.fullName || 'Komissiya raisi',
        currentUser?.id || 'sys',
        role || 'PRACTICE_SUPERVISOR'
      );

      if (res.success && res.assessment) {
        setAssessment(res.assessment);
        showToast('success', 'Attestatsiya tasdiqlandi!', `Talabaning yakuniy bahosi: ${res.assessment.totalScore} ball (${res.assessment.grade}).`);
        onAssessmentUpdated();
      } else {
        showToast('error', 'Tasdiqlab bo\'lmadi', res.error || 'Talablar to\'liq bajarilmagan.');
      }
    } finally {
      setIsApproving(false);
    }
  };

  const handleSaveFeedback = () => {
    if (!assessment) return;
    const updated: Assessment = {
      ...assessment,
      feedback,
      updatedAt: new Date().toISOString()
    };
    storageService.saveAssessment(updated, currentUser?.id || 'sys', role || 'PRACTICE_SUPERVISOR');
    setAssessment(updated);
    showToast('success', 'Saqlandi', 'Taqriz va izohlar muvaffaqiyatli saqlandi.');
    onAssessmentUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 shadow-inner">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Amaliyot yakuniy attestatsiyasi</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  100 ballik tizim
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {student.fullName} • {student.group} • {practice?.name || 'Klinik amaliyot'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRecalculate}
              title="Jonli ma'lumotlarni qayta hisoblash"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs px-2.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Qayta hisoblash</span>
            </button>
            {onOpenCertificate && assessment && (
              <button
                onClick={() => onOpenCertificate(student, assessment)}
                className="p-1.5 rounded-lg text-amber-300 hover:text-amber-100 hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs px-2.5 border border-amber-400/30"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Varaqani chiqarish</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hero Score Ribbon */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex flex-col items-center justify-center font-bold shadow-xs">
              <span className="text-lg leading-tight font-mono">{totalScore}</span>
              <span className="text-[9px] uppercase tracking-wider text-blue-200">/ 100</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${gradeColor}`}>
                  Baho: {gradeText}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                  assessment?.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                  assessment?.status === 'RETAKE_REQUIRED' ? 'bg-rose-100 text-rose-800' :
                  assessment?.status === 'WAITING_FOR_EXAM' ? 'bg-amber-100 text-amber-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {assessment?.status === 'APPROVED' ? 'Tasdiqlangan' :
                   assessment?.status === 'RETAKE_REQUIRED' ? 'Qayta topshirish' :
                   assessment?.status === 'WAITING_FOR_EXAM' ? 'Imtihon kutilmoqda' :
                   'Baholash kutilmoqda'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Klinik baza: <strong className="text-slate-700">{practicePlace?.name || 'Shifoxona'}</strong> ({assignment?.department || 'Bo\'lim'}) • Rahbar: <strong className="text-slate-700">{supervisor?.fullName || 'Tayinlanmagan'}</strong>
              </p>
            </div>
          </div>

          {/* Quick breakdown mini cards */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-white p-2 rounded-lg border border-slate-200 min-w-[70px]">
              <div className="text-[10px] text-slate-500 font-medium">Davomat</div>
              <div className="text-xs font-bold text-slate-900 font-mono mt-0.5">
                {attData.score}<span className="text-[10px] text-slate-400">/{settings.attendanceMaxScore}</span>
              </div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200 min-w-[70px]">
              <div className="text-[10px] text-slate-500 font-medium">Kundalik</div>
              <div className="text-xs font-bold text-slate-900 font-mono mt-0.5">
                {jnlData.score}<span className="text-[10px] text-slate-400">/{settings.journalMaxScore}</span>
              </div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200 min-w-[70px]">
              <div className="text-[10px] text-slate-500 font-medium">Ko'nikmalar</div>
              <div className="text-xs font-bold text-slate-900 font-mono mt-0.5">
                {sklData.score}<span className="text-[10px] text-slate-400">/{settings.skillsMaxScore}</span>
              </div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200 min-w-[70px]">
              <div className="text-[10px] text-slate-500 font-medium">Imtihon</div>
              <div className="text-xs font-bold text-indigo-700 font-mono mt-0.5">
                {exmData.score}<span className="text-[10px] text-indigo-400">/{settings.finalExamMaxScore}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 gap-6 text-xs font-semibold bg-white shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Umumiy xulosa & 4 ta blok
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'attendance' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            A. Davomat ({attData.score}/{settings.attendanceMaxScore})
          </button>
          <button
            onClick={() => setActiveTab('journal')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'journal' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            B. Kundalik ({jnlData.score}/{settings.journalMaxScore})
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'skills' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            C. Ko'nikmalar ({sklData.score}/{settings.skillsMaxScore})
          </button>
          <button
            onClick={() => setActiveTab('exam')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'exam' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            D. Imtihon ({exmData.score}/{settings.finalExamMaxScore})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Warnings if mandatory skills missing */}
              {sklData.unmasteredMandatorySkills.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800">
                    <p className="font-bold">Diqqat: Minimal me'yori bajarilmagan majburiy ko'nikmalar mavjud!</p>
                    <p className="mt-0.5 text-amber-700">
                      Ushbu ko'nikmalar talaba tomonidan to'liq o'zlashtirilishi shart: {sklData.unmasteredMandatorySkills.join(', ')}.
                    </p>
                  </div>
                </div>
              )}

              {/* 4 Blocks Detail Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Block A: Davomat */}
                <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <CalendarCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">A. Davomat ko'rsatkichi</h4>
                        <p className="text-[10px] text-slate-500">Maksimal: {settings.attendanceMaxScore} ball</p>
                      </div>
                    </div>
                    <span className="text-base font-bold font-mono text-emerald-700">
                      {attData.score} <span className="text-xs text-slate-400 font-normal">/ {settings.attendanceMaxScore}</span>
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs pt-1 border-t border-slate-200/60">
                    <div className="flex justify-between text-slate-600">
                      <span>Kelgan kunlar (Hozir + Kechikkan):</span>
                      <strong className="text-slate-900 font-mono">{attData.presentCount + attData.lateCount} kun</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Sababli / Sababsiz qoldirilgan:</span>
                      <span className="font-mono text-slate-700">{attData.excusedCount} sababli, {attData.absentCount} sababsiz</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Davomat foizi:</span>
                      <strong className="text-emerald-700 font-mono">{attData.percentage}%</strong>
                    </div>
                  </div>
                </div>

                {/* Block B: Kundalik */}
                <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">B. Elektron kundalik</h4>
                        <p className="text-[10px] text-slate-500">Maksimal: {settings.journalMaxScore} ball</p>
                      </div>
                    </div>
                    <span className="text-base font-bold font-mono text-blue-700">
                      {jnlData.score} <span className="text-xs text-slate-400 font-normal">/ {settings.journalMaxScore}</span>
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs pt-1 border-t border-slate-200/60">
                    <div className="flex justify-between text-slate-600">
                      <span>Tasdiqlangan kundaliklar:</span>
                      <strong className="text-emerald-700 font-mono">{jnlData.approvedCount} ta</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Qaytarilgan / Qoralama:</span>
                      <span className="font-mono text-amber-700">{jnlData.revisionCount} ta qaytarilgan</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>O'rtacha rahbar bahosi:</span>
                      <strong className="text-blue-700 font-mono">{jnlData.avgRating} / 5.0 ⭐</strong>
                    </div>
                  </div>
                </div>

                {/* Block C: Ko'nikmalar */}
                <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                        <Stethoscope className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">C. Amaliy ko'nikmalar</h4>
                        <p className="text-[10px] text-slate-500">Maksimal: {settings.skillsMaxScore} ball</p>
                      </div>
                    </div>
                    <span className="text-base font-bold font-mono text-purple-700">
                      {sklData.score} <span className="text-xs text-slate-400 font-normal">/ {settings.skillsMaxScore}</span>
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs pt-1 border-t border-slate-200/60">
                    <div className="flex justify-between text-slate-600">
                      <span>Bajarilgan ko'nikmalar soni:</span>
                      <strong className="text-slate-900 font-mono">{sklData.completedSkills} / {sklData.totalSkills} ta</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Minimal me'yor bajarilishi:</span>
                      <strong className="text-purple-700 font-mono">{sklData.skillProgressPercent}%</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Bajarilmagan majburiy:</span>
                      <span className={`font-mono ${sklData.unmasteredMandatorySkills.length > 0 ? 'text-rose-600 font-bold' : 'text-emerald-700'}`}>
                        {sklData.unmasteredMandatorySkills.length} ta
                      </span>
                    </div>
                  </div>
                </div>

                {/* Block D: Yakuniy imtihon */}
                <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">D. Yakuniy imtihon</h4>
                        <p className="text-[10px] text-slate-500">Maksimal: {settings.finalExamMaxScore} ball</p>
                      </div>
                    </div>
                    <span className="text-base font-bold font-mono text-indigo-700">
                      {exmData.score} <span className="text-xs text-slate-400 font-normal">/ {settings.finalExamMaxScore}</span>
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs pt-1 border-t border-slate-200/60">
                    <div className="flex justify-between text-slate-600">
                      <span>Imtihon holati:</span>
                      <span className={`font-semibold ${
                        exmData.status === 'COMPLETED' ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        {exmData.status === 'COMPLETED' ? 'Topshirildi' : 'Kutilmoqda / Belgilangan'}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>5 ta mezon yig'indisi:</span>
                      <span className="font-mono text-slate-900">{exmData.score} ball ({exmData.exam?.percentage || 0}%)</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Baholagan komissiya:</span>
                      <span className="text-slate-700 truncate max-w-[170px]">{exmData.exam?.gradedBy || 'Tayinlanmagan'}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Validation Checklist before Approval */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-blue-600" />
                  Attestatsiyani tasdiqlash uchun talablar tekshiruvi (4 ta mezon)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className={`p-2.5 rounded-lg border flex items-center gap-2.5 ${
                    attData.totalDays > 0 && (attData.presentCount + attData.lateCount) > 0
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50/70 border-rose-200 text-rose-800'
                  }`}>
                    {attData.totalDays > 0 ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                    <span>1. Davomat kiritilgan va tekshirilgan</span>
                  </div>

                  <div className={`p-2.5 rounded-lg border flex items-center gap-2.5 ${
                    jnlData.approvedCount > 0
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50/70 border-rose-200 text-rose-800'
                  }`}>
                    {jnlData.approvedCount > 0 ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                    <span>2. Kundaliklar tasdiqlangan (kamida 1 ta)</span>
                  </div>

                  <div className={`p-2.5 rounded-lg border flex items-center gap-2.5 ${
                    sklData.completedSkills > 0 || sklData.skillProgressPercent >= 50
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50/70 border-rose-200 text-rose-800'
                  }`}>
                    {(sklData.completedSkills > 0 || sklData.skillProgressPercent >= 50) ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                    <span>3. Ko'nikmalar me'yori bajarilgan (kamida 50%)</span>
                  </div>

                  <div className={`p-2.5 rounded-lg border flex items-center gap-2.5 ${
                    exmData.status === 'COMPLETED'
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50/70 border-rose-200 text-rose-800'
                  }`}>
                    {exmData.status === 'COMPLETED' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                    <span>4. Yakuniy imtihon o'tkazilgan va baholangan</span>
                  </div>
                </div>
              </div>

              {/* Commission Feedback & Notes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    Amaliyot rahbari / Attestatsiya komissiyasi xulosasi va tavsiyalari:
                  </label>
                  {isSupervisorOrAdmin && (
                    <button
                      type="button"
                      onClick={handleSaveFeedback}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Izohni saqlash
                    </button>
                  )}
                </div>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="Talabaning klinik faoliyati, deontologik odobi va amaliy ko'nikmalarni o'zlashtirish darajasi bo'yicha xulosa..."
                  className="w-full px-3 py-2 text-xs border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

            </div>
          )}

          {/* TAB 2: ATTENDANCE DETAILS */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-emerald-900">Davomat ballini hisoblash formulasi</h4>
                  <span className="font-mono text-sm font-bold text-emerald-800">{attData.score} / {settings.attendanceMaxScore} ball</span>
                </div>
                <p className="text-xs text-emerald-700 mt-1">
                  Formula: (Hozir bo'lgan + Kechikkan kunlar) / Rejalashtirilgan amaliyot kunlari × {settings.attendanceMaxScore} ball.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-white border rounded-xl text-center">
                  <div className="text-slate-500 text-[11px]">Hozir (Present)</div>
                  <div className="text-base font-bold text-emerald-600 font-mono mt-0.5">{attData.presentCount} kun</div>
                </div>
                <div className="p-3 bg-white border rounded-xl text-center">
                  <div className="text-slate-500 text-[11px]">Kechikkan (Late)</div>
                  <div className="text-base font-bold text-amber-600 font-mono mt-0.5">{attData.lateCount} kun</div>
                </div>
                <div className="p-3 bg-white border rounded-xl text-center">
                  <div className="text-slate-500 text-[11px]">Sababli (Excused)</div>
                  <div className="text-base font-bold text-blue-600 font-mono mt-0.5">{attData.excusedCount} kun</div>
                </div>
                <div className="p-3 bg-white border rounded-xl text-center">
                  <div className="text-slate-500 text-[11px]">Sababsiz (Absent)</div>
                  <div className="text-base font-bold text-rose-600 font-mono mt-0.5">{attData.absentCount} kun</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DAILY JOURNAL DETAILS */}
          {activeTab === 'journal' && (
            <div className="space-y-4">
              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-blue-900">Elektron kundalik hisob-kitobi</h4>
                  <span className="font-mono text-sm font-bold text-blue-800">{jnlData.score} / {settings.journalMaxScore} ball</span>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  Talabaning tasdiqlangan amaliyot kundaliklari va rahbar tomonidan qo'yilgan sifat reytingi (1-5 yulduz) inobatga olinadi.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-white border rounded-xl text-center">
                  <div className="text-slate-500 text-[11px]">Jami topshirilgan</div>
                  <div className="text-base font-bold text-slate-800 font-mono mt-0.5">{jnlData.submittedCount} ta</div>
                </div>
                <div className="p-3 bg-white border rounded-xl text-center">
                  <div className="text-slate-500 text-[11px]">Tasdiqlangan (APPROVED)</div>
                  <div className="text-base font-bold text-emerald-600 font-mono mt-0.5">{jnlData.approvedCount} ta</div>
                </div>
                <div className="p-3 bg-white border rounded-xl text-center">
                  <div className="text-slate-500 text-[11px]">Qaytarilgan (REVISION)</div>
                  <div className="text-base font-bold text-amber-600 font-mono mt-0.5">{jnlData.revisionCount} ta</div>
                </div>
                <div className="p-3 bg-white border rounded-xl text-center">
                  <div className="text-slate-500 text-[11px]">O'rtacha sifat reytingi</div>
                  <div className="text-base font-bold text-blue-600 font-mono mt-0.5">{jnlData.avgRating} / 5.0 ⭐</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SKILLS LOGBOOK DETAILS */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-purple-900">Amaliy ko'nikmalar pasporti balli</h4>
                  <span className="font-mono text-sm font-bold text-purple-800">{sklData.score} / {settings.skillsMaxScore} ball</span>
                </div>
                <p className="text-xs text-purple-700 mt-1">
                  Formula: Tasdiqlangan amaliy ko'nikmalar minimal me'yori bajarilish foizi ({sklData.skillProgressPercent}%) / 100 × {settings.skillsMaxScore} ball.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white border rounded-xl text-center">
                  <div className="text-slate-500 text-[11px]">Katalogdagi ko'nikmalar</div>
                  <div className="text-base font-bold text-slate-800 font-mono mt-0.5">{sklData.totalSkills} ta</div>
                </div>
                <div className="p-3 bg-white border rounded-xl text-center">
                  <div className="text-slate-500 text-[11px]">Minimal me'yor to'lgan</div>
                  <div className="text-base font-bold text-emerald-600 font-mono mt-0.5">{sklData.completedSkills} ta</div>
                </div>
                <div className="p-3 bg-white border rounded-xl text-center">
                  <div className="text-slate-500 text-[11px]">Ko'nikmalar bajarilishi</div>
                  <div className="text-base font-bold text-purple-600 font-mono mt-0.5">{sklData.skillProgressPercent}%</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FINAL EXAM DETAILS */}
          {activeTab === 'exam' && (
            <div className="space-y-4">
              <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-indigo-900">Yakuniy amaliyot imtihoni (5 ta mezon)</h4>
                  <p className="text-xs text-indigo-700 mt-0.5">
                    Imtihon sanasi: {exmData.exam?.examDate || 'Belgilanmagan'} • Joyi: {exmData.exam?.placeName || 'Klinik baza'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-indigo-800">{exmData.score} / {settings.finalExamMaxScore} ball</span>
                  {onOpenExamGrading && exmData.exam && isSupervisorOrAdmin && (
                    <button
                      onClick={() => onOpenExamGrading(exmData.exam!)}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-xs"
                    >
                      Baholash
                    </button>
                  )}
                </div>
              </div>

              {exmData.exam ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white border rounded-xl flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-slate-800">1. Nazariy bilim</div>
                        <div className="text-[10px] text-slate-500">Klinik patologiya va diagnostika</div>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        {exmData.exam.theoryScore} / {settings.examCriteriaWeights.theoryMax}
                      </span>
                    </div>

                    <div className="p-3 bg-white border rounded-xl flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-slate-800">2. Amaliy manipulyatsiya</div>
                        <div className="text-[10px] text-slate-500">Ko'nikmani mustaqil ko'rsatish</div>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        {exmData.exam.practicalScore} / {settings.examCriteriaWeights.practicalMax}
                      </span>
                    </div>

                    <div className="p-3 bg-white border rounded-xl flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-slate-800">3. Klinik vaziyat (Case)</div>
                        <div className="text-[10px] text-slate-500">Differensial tashxis va taktika</div>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        {exmData.exam.clinicalCaseScore} / {settings.examCriteriaWeights.clinicalCaseMax}
                      </span>
                    </div>

                    <div className="p-3 bg-white border rounded-xl flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-slate-800">4. Kasbiy muomala va etika</div>
                        <div className="text-[10px] text-slate-500">Bemor va jamoa bilan muloqot</div>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        {exmData.exam.professionalismScore} / {settings.examCriteriaWeights.professionalismMax}
                      </span>
                    </div>

                    <div className="p-3 bg-white border rounded-xl flex justify-between items-center sm:col-span-2">
                      <div>
                        <div className="font-semibold text-slate-800">5. Xavfsizlik, aseptika va deontologiya</div>
                        <div className="text-[10px] text-slate-500">Infeksiya nazorati va tibbiy maxfiylik</div>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        {exmData.exam.safetyScore} / {settings.examCriteriaWeights.safetyMax}
                      </span>
                    </div>
                  </div>

                  {exmData.exam.comments && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <span className="font-semibold text-slate-700">Imtihonchi izohi: </span>
                      <span className="text-slate-600">{exmData.exam.comments}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  Ushbu talabaga hali yakuniy imtihon o'tkazilmagan.
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>Status:</span>
            <strong className="text-slate-800">{assessment?.status || 'Kutilmoqda'}</strong>
            {assessment?.approvedBy && (
              <span className="text-[11px] text-emerald-700">
                (Tasdiqladi: {assessment.approvedBy})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Retake Button */}
            {isSupervisorOrAdmin && onOpenRetake && assessment && (
              <button
                type="button"
                onClick={() => onOpenRetake(assessment)}
                className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Qayta topshirishga yuborish</span>
              </button>
            )}

            {/* Approve Button */}
            {canApprove && assessment?.status !== 'APPROVED' && (
              <button
                type="button"
                disabled={isApproving}
                onClick={handleApprove}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Attestatsiyani tasdiqlash</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
            >
              Yopish
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
