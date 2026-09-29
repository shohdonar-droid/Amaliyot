import React, { useState } from 'react';
import {
  Award,
  CalendarCheck,
  BookOpen,
  Stethoscope,
  GraduationCap,
  Printer,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Info
} from 'lucide-react';
import { Student, Assessment, Practice, FinalExam } from '../../../types';
import { storageService } from '../../../services/storageService';
import { StudentIndividualCertificateModal } from './StudentIndividualCertificateModal';

interface StudentAttestationCabinetViewProps {
  student: Student;
}

export const StudentAttestationCabinetView: React.FC<StudentAttestationCabinetViewProps> = ({
  student
}) => {
  const practices = storageService.getPractices();
  const assignments = storageService.getPracticeAssignments();
  const assignment = assignments.find(a => a.studentId === student.id);
  const activePracticeId = assignment?.practiceId || practices[0]?.id || 'prac-1';
  const practice = practices.find(p => p.id === activePracticeId) || practices[0];
  const places = storageService.getPracticePlaces();
  const practicePlace = places.find(p => p.id === assignment?.practicePlaceId);
  const supervisors = storageService.getSupervisors();
  const supervisor = supervisors.find(s => s.id === assignment?.supervisorId);
  const settings = storageService.getAssessmentSettings();

  const assessment = storageService.getAssessmentByStudent(student.id, activePracticeId);
  const attData = storageService.calculateStudentAttendanceScore(student.id, activePracticeId);
  const jnlData = storageService.calculateStudentJournalScore(student.id, activePracticeId);
  const sklData = storageService.calculateStudentSkillsScore(student.id, activePracticeId);
  const exmData = storageService.calculateStudentFinalExamScore(student.id, activePracticeId);

  const [isCertificateOpen, setIsCertificateOpen] = useState(false);

  const totalScore = assessment?.totalScore ?? (attData.score + jnlData.score + sklData.score + exmData.score);
  const grade = assessment?.grade || (totalScore >= settings.grade5Min ? '5' : totalScore >= settings.grade4Min ? '4' : totalScore >= settings.grade3Min ? '3' : '2');

  const gradeWord = 
    grade === '5' ? "A'lo" :
    grade === '4' ? "Yaxshi" :
    grade === '3' ? "Qoniqarli" : "Qoniqarsiz (Qayta topshirish)";

  const isApproved = assessment?.status === 'APPROVED' || assessment?.status === 'COMPLETED';
  const isRetake = assessment?.status === 'RETAKE_REQUIRED' || assessment?.status === 'FAILED';

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-200 border border-white/10">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Amaliyot yakuniy attestatsiyasi</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {student.fullName}
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              {practice?.name} ({practice?.code}) • Klinik baza: {practicePlace?.name || 'Klinika'} • Amaliyot rahbari: {supervisor?.fullName || 'Rahbar'}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Yakuniy ball</span>
              <div className="text-3xl font-black font-mono text-white leading-none mt-1">
                {totalScore}
                <span className="text-xs font-normal text-slate-300">/100</span>
              </div>
            </div>

            <div className="h-10 w-[1px] bg-white/20" />

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Baho</span>
              <div className="mt-1">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  grade === '5' ? 'bg-emerald-500 text-white' :
                  grade === '4' ? 'bg-blue-500 text-white' :
                  grade === '3' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
                }`}>
                  {grade} ({gradeWord})
                </span>
              </div>
            </div>

            {assessment && (
              <button
                onClick={() => setIsCertificateOpen(true)}
                className="ml-2 px-3 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Varaqa</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex justify-between text-xs text-slate-300 mb-1.5">
            <span>Umumiy o'zlashtirish progressi:</span>
            <span className="font-mono font-bold">{totalScore}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                totalScore >= 86 ? 'bg-gradient-to-r from-emerald-400 to-teal-300' :
                totalScore >= 71 ? 'bg-gradient-to-r from-blue-400 to-cyan-300' :
                totalScore >= 56 ? 'bg-gradient-to-r from-amber-400 to-yellow-300' :
                'bg-gradient-to-r from-rose-500 to-red-400'
              }`}
              style={{ width: `${Math.min(100, totalScore)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Retake Alert if required */}
      {isRetake && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <RotateCcw className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-900 space-y-1">
            <p className="font-bold text-sm">Yakuniy imtihonni qayta topshirish belgilandi!</p>
            <p>
              Yangi imtihon sanasi: <strong className="font-mono">{assessment?.retakeExamDate || 'Yaqin kunlarda'}</strong>.
            </p>
            {assessment?.retakeReason && (
              <p className="text-rose-700 bg-white/60 p-2 rounded-lg border border-rose-200/60 mt-1">
                Sabab: {assessment.retakeReason}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Status Alert if Waiting for Exam */}
      {assessment?.status === 'WAITING_FOR_EXAM' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <GraduationCap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <p className="font-bold text-sm">Amaliyot yakuniy imtihoni kutilmoqda</p>
            <p className="mt-0.5">
              Davomat, kundalik va amaliy ko'nikmalar ko'rsatkichlaringiz hisoblab chiqildi. Yakuniy imtihon topshirilgach attestatsiya to'liq shakllanadi.
            </p>
          </div>
        </div>
      )}

      {/* 4 Block Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Block A: Davomat */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">A. Davomat</h4>
                <p className="text-[10px] text-slate-500">Maksimal: {settings.attendanceMaxScore} ball</p>
              </div>
            </div>
            <span className="text-xl font-bold font-mono text-emerald-700">
              {attData.score} <span className="text-xs text-slate-400 font-normal">/ {settings.attendanceMaxScore}</span>
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Ishtirok etgan kunlar:</span>
              <strong className="text-slate-900 font-mono">{attData.presentCount + attData.lateCount} kun</strong>
            </div>
            <div className="flex justify-between">
              <span>Davomat foizi:</span>
              <strong className="text-emerald-700 font-mono">{attData.percentage}%</strong>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t">
              <span>Kechikkan: {attData.lateCount} • Sababli: {attData.excusedCount} • Sababsiz: {attData.absentCount}</span>
            </div>
          </div>
        </div>

        {/* Block B: Kundalik */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">B. Elektron kundalik</h4>
                <p className="text-[10px] text-slate-500">Maksimal: {settings.journalMaxScore} ball</p>
              </div>
            </div>
            <span className="text-xl font-bold font-mono text-blue-700">
              {jnlData.score} <span className="text-xs text-slate-400 font-normal">/ {settings.journalMaxScore}</span>
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Tasdiqlangan kundaliklar:</span>
              <strong className="text-emerald-700 font-mono">{jnlData.approvedCount} ta</strong>
            </div>
            <div className="flex justify-between">
              <span>O'rtacha rahbar bahosi:</span>
              <strong className="text-blue-700 font-mono">{jnlData.avgRating} / 5.0 ⭐</strong>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t">
              <span>Jami topshirilgan: {jnlData.submittedCount} • Qaytarilgan: {jnlData.revisionCount}</span>
            </div>
          </div>
        </div>

        {/* Block C: Ko'nikmalar */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">C. Amaliy ko'nikmalar</h4>
                <p className="text-[10px] text-slate-500">Maksimal: {settings.skillsMaxScore} ball</p>
              </div>
            </div>
            <span className="text-xl font-bold font-mono text-purple-700">
              {sklData.score} <span className="text-xs text-slate-400 font-normal">/ {settings.skillsMaxScore}</span>
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Minimal me'yori bajarilgan:</span>
              <strong className="text-purple-700 font-mono">{sklData.completedSkills} / {sklData.totalSkills} ta ({sklData.skillProgressPercent}%)</strong>
            </div>
            <div className="flex justify-between">
              <span>Bajarilmagan majburiy:</span>
              <span className={`font-mono ${sklData.unmasteredMandatorySkills.length > 0 ? 'text-rose-600 font-bold' : 'text-emerald-700'}`}>
                {sklData.unmasteredMandatorySkills.length} ta
              </span>
            </div>
            <div className="text-[11px] text-slate-500 pt-1 border-t">
              Skills Logbook da to'liq ko'nikmalar pasporti qayd etilgan.
            </div>
          </div>
        </div>

        {/* Block D: Yakuniy imtihon */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">D. Yakuniy imtihon</h4>
                <p className="text-[10px] text-slate-500">Maksimal: {settings.finalExamMaxScore} ball</p>
              </div>
            </div>
            <span className="text-xl font-bold font-mono text-indigo-700">
              {exmData.score} <span className="text-xs text-slate-400 font-normal">/ {settings.finalExamMaxScore}</span>
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Holat:</span>
              <span className={`font-semibold ${
                exmData.status === 'COMPLETED' ? 'text-emerald-700' : 'text-amber-700'
              }`}>
                {exmData.status === 'COMPLETED' ? 'Topshirildi' : 'Rejalashtirilgan'}
              </span>
            </div>
            {exmData.exam ? (
              <div className="grid grid-cols-5 gap-1 pt-1 border-t text-center text-[10px]">
                <div>Naz: <strong>{exmData.exam.theoryScore}</strong></div>
                <div>Man: <strong>{exmData.exam.practicalScore}</strong></div>
                <div>Keys: <strong>{exmData.exam.clinicalCaseScore}</strong></div>
                <div>Etik: <strong>{exmData.exam.professionalismScore}</strong></div>
                <div>Xavf: <strong>{exmData.exam.safetyScore}</strong></div>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 pt-1 border-t">
                Imtihon sanasi kafedra tomonidan e'lon qilinadi.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Commission Feedback & Approval Note */}
      {assessment?.feedback && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2">
          <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            Attestatsiya komissiyasi taqrizi va rasmiy xulosasi:
          </h4>
          <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/80 leading-relaxed">
            {assessment.feedback}
          </p>
          {assessment.approvedBy && (
            <p className="text-[11px] text-emerald-700 font-medium">
              ✓ Tasdiqlagan: {assessment.approvedBy} ({assessment.approvedAt?.split('T')[0]})
            </p>
          )}
        </div>
      )}

      {/* Individual Certificate Modal */}
      {isCertificateOpen && assessment && (
        <StudentIndividualCertificateModal
          isOpen={isCertificateOpen}
          onClose={() => setIsCertificateOpen(false)}
          student={student}
          assessment={assessment}
        />
      )}

    </div>
  );
};
