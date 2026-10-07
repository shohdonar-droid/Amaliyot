import React from 'react';
import {
  X,
  Printer,
  Award,
  CalendarCheck,
  BookOpen,
  Stethoscope,
  GraduationCap,
  QrCode,
  CheckCircle2,
  Building2,
  UserCheck
} from 'lucide-react';
import { Student, Assessment, Practice } from '../../../types';
import { storageService } from '../../../services/storageService';

interface StudentIndividualCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  assessment: Assessment | null;
}

export const StudentIndividualCertificateModal: React.FC<StudentIndividualCertificateModalProps> = ({
  isOpen,
  onClose,
  student,
  assessment
}) => {
  if (!isOpen || !student || !assessment) return null;

  const practices = storageService.getPractices();
  const practice = practices.find(p => p.id === assessment.practiceId) || practices[0];
  const assignments = storageService.getPracticeAssignments();
  const assignment = assignments.find(a => a.studentId === student.id && a.practiceId === practice?.id);
  const places = storageService.getPracticePlaces();
  const practicePlace = places.find(p => p.id === assignment?.practicePlaceId);
  const supervisors = storageService.getSupervisors();
  const supervisor = supervisors.find(s => s.id === assignment?.supervisorId);
  const settings = storageService.getAssessmentSettings();

  const attData = storageService.calculateStudentAttendanceScore(student.id, practice?.id);
  const jnlData = storageService.calculateStudentJournalScore(student.id, practice?.id);
  const sklData = storageService.calculateStudentSkillsScore(student.id, practice?.id);
  const exmData = storageService.calculateStudentFinalExamScore(student.id, practice?.id);

  const totalScore = assessment.totalScore;
  const grade = assessment.grade;
  const gradeWord = 
    grade === '5' ? "5 (A'LO)" :
    grade === '4' ? "4 (YAXSHI)" :
    grade === '3' ? "3 (QONIQARLI)" : "2 (QONIQARSIZ)";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Controls Bar */}
        <div className="bg-slate-900 px-6 py-3.5 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-sm">Talaba amaliyot attestatsiya varaqasi</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Chop etish (Print / PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Page */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 bg-white text-slate-900 font-sans print:p-0 print:overflow-visible">
          
          {/* Certificate Border Box */}
          <div className="border-4 border-double border-slate-800 p-6 sm:p-8 rounded-xl relative space-y-6">
            
            {/* Header */}
            <div className="text-center space-y-1 pb-4 border-b-2 border-slate-800">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                O'ZBEKISTON RESPUBLIKASI SOG'LIQNI SAQLASH VAZIRLIGI
              </p>
              <h2 className="text-base sm:text-lg font-black uppercase text-slate-900 tracking-wider">
                {storageService.getUniversityName().toUpperCase()}
              </h2>
              <p className="text-xs font-semibold text-slate-600">
                O'quv-uslubiy boshqarma va Klinik amaliyot bo'limi
              </p>
              <div className="pt-2">
                <span className="inline-block px-4 py-1 bg-slate-900 text-white text-xs sm:text-sm font-extrabold uppercase tracking-widest rounded">
                  TALABANING AMALIYOT ATTESTATSIYA VARAQASI
                </span>
              </div>
            </div>

            {/* Student Info */}
            <div className="grid grid-cols-2 gap-4 text-xs py-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <p className="text-slate-500 text-[11px]">Talaba F.I.Sh.:</p>
                <p className="font-bold text-sm text-slate-900">{student.fullName}</p>
                <p className="text-[10px] text-slate-500 font-mono">Talaba ID: {student.studentId}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[11px]">Guruh va Fakultet:</p>
                <p className="font-bold text-sm text-slate-900">{student.group} ({student.course}-kurs)</p>
                <p className="text-[11px] text-slate-600">{student.faculty}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[11px]">Amaliyot dasturi:</p>
                <p className="font-semibold text-slate-900">{practice?.name} ({practice?.code})</p>
                <p className="text-[10px] text-slate-500">Muddati: {practice?.startDate} — {practice?.endDate}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[11px]">Klinik baza va Rahbar:</p>
                <p className="font-semibold text-slate-900">{practicePlace?.name || 'Klinika'}</p>
                <p className="text-[11px] text-slate-600">{supervisor?.fullName || 'Rahbar'}</p>
              </div>
            </div>

            {/* 4 Block Score Matrix */}
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
                Attestatsiya mezonlari bo'yicha to'plangan ballar (100 ballik tizim):
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="text-[11px] font-semibold text-emerald-800">A. Davomat</div>
                  <div className="text-lg font-black font-mono text-emerald-700 mt-1">
                    {attData.score} <span className="text-xs text-emerald-500">/{settings.attendanceMaxScore}</span>
                  </div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">
                    {attData.percentage}% ishtirok ({attData.presentCount} kun)
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="text-[11px] font-semibold text-blue-800">B. Kundalik</div>
                  <div className="text-lg font-black font-mono text-blue-700 mt-1">
                    {jnlData.score} <span className="text-xs text-blue-500">/{settings.journalMaxScore}</span>
                  </div>
                  <div className="text-[10px] text-blue-600 mt-0.5">
                    {jnlData.approvedCount} ta tasdiqlangan
                  </div>
                </div>

                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="text-[11px] font-semibold text-purple-800">C. Ko'nikmalar</div>
                  <div className="text-lg font-black font-mono text-purple-700 mt-1">
                    {sklData.score} <span className="text-xs text-purple-500">/{settings.skillsMaxScore}</span>
                  </div>
                  <div className="text-[10px] text-purple-600 mt-0.5">
                    {sklData.skillProgressPercent}% me'yor bajarildi
                  </div>
                </div>

                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                  <div className="text-[11px] font-semibold text-indigo-800">D. Imtihon</div>
                  <div className="text-lg font-black font-mono text-indigo-700 mt-1">
                    {exmData.score} <span className="text-xs text-indigo-500">/{settings.finalExamMaxScore}</span>
                  </div>
                  <div className="text-[10px] text-indigo-600 mt-0.5">
                    5 ta klinik mezon
                  </div>
                </div>
              </div>
            </div>

            {/* Exam Breakdown mini table */}
            {exmData.exam && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-[11px] text-slate-700 uppercase">
                  Imtihon mezonlari tafsiloti:
                </span>
                <div className="grid grid-cols-5 gap-2 mt-2 text-center text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Nazariya</span>
                    <strong className="font-mono">{exmData.exam.theoryScore}/{settings.examCriteriaWeights.theoryMax}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Manipulyatsiya</span>
                    <strong className="font-mono">{exmData.exam.practicalScore}/{settings.examCriteriaWeights.practicalMax}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Klinik keys</span>
                    <strong className="font-mono">{exmData.exam.clinicalCaseScore}/{settings.examCriteriaWeights.clinicalCaseMax}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Muomala</span>
                    <strong className="font-mono">{exmData.exam.professionalismScore}/{settings.examCriteriaWeights.professionalismMax}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Xavfsizlik</span>
                    <strong className="font-mono">{exmData.exam.safetyScore}/{settings.examCriteriaWeights.safetyMax}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Final Overall Grade Banner */}
            <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400">Yakuniy amaliyot natijasi:</span>
                <h4 className="text-base sm:text-lg font-black text-amber-400">
                  BAHO: {gradeWord}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-black font-mono text-white leading-none">
                  {totalScore}
                </span>
                <span className="text-xs text-slate-400 font-mono"> / 100 BALL</span>
              </div>
            </div>

            {/* Feedback note */}
            {assessment.feedback && (
              <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-700">Komissiya taqrizi: </span>
                <span className="text-slate-600">{assessment.feedback}</span>
              </div>
            )}

            {/* Signatures & QR Code */}
            <div className="pt-4 border-t border-slate-300 grid grid-cols-3 gap-4 text-xs text-slate-800 items-end">
              <div>
                <p className="font-bold">Attestatsiya komissiyasi raisi:</p>
                <div className="h-8 border-b border-dashed border-slate-400 flex items-end pb-0.5">
                  <span className="text-[10px] text-slate-600">
                    {assessment.assessorName || 'Prof. Sobirov A.T.'}
                  </span>
                </div>
              </div>

              <div>
                <p className="font-bold">Fakultet dekani:</p>
                <div className="h-8 border-b border-dashed border-slate-400 flex items-end pb-0.5">
                  <span className="text-[10px] text-slate-600">
                    {assessment.approvedBy || 'Dots. Xalimov B.R.'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 text-right">
                <div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase">Elektron Tasdiq</div>
                  <div className="text-[8px] font-mono text-slate-400">
                    {assessment.approvedAt ? assessment.approvedAt.split('T')[0] : new Date().toISOString().split('T')[0]}
                  </div>
                </div>
                <div className="w-10 h-10 border border-slate-300 rounded flex items-center justify-center bg-white shadow-2xs">
                  <QrCode className="w-7 h-7 text-slate-800" />
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
