import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  Calendar,
  Building2,
  User,
  GraduationCap,
  Bell,
  ChevronRight
} from 'lucide-react';
import { storageService } from '../../../services/storageService';
import { Student } from '../../../types';
import { useToast } from '../../../context/ToastContext';

interface OverallMonitoringViewProps {
  rows: any[];
  onOpenTimeline: (student: Student) => void;
  onOpenAssessment: (studentId: string) => void;
}

export const OverallMonitoringView: React.FC<OverallMonitoringViewProps> = ({
  rows,
  onOpenTimeline,
  onOpenAssessment
}) => {
  const { showToast } = useToast();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            {status === 'APPROVED' ? 'Tasdiqlangan' : 'Yakunlangan'}
          </span>
        );
      case 'WAITING_FOR_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Tasdiq kutilmoqda
          </span>
        );
      case 'WAITING_FOR_EXAM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <GraduationCap className="w-3 h-3 text-purple-600" />
            Imtihon kutilmoqda
          </span>
        );
      case 'EXAM_COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <CheckCircle2 className="w-3 h-3 text-indigo-600" />
            Imtihon topshirildi
          </span>
        );
      case 'RETAKE_REQUIRED':
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <RotateCcw className="w-3 h-3 text-rose-600" />
            Qayta topshirish
          </span>
        );
      case 'PRACTICE_COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
            <CheckCircle2 className="w-3 h-3 text-sky-600" />
            Amaliyot tugagan
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" />
            Jarayonda
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Boshlanmagan
          </span>
        );
    }
  };

  const handleNotifyStudent = (stdName: string) => {
    storageService.addNotification({
      title: 'Amaliyot jarayoni bo‘yicha ogohlantirish',
      message: `${stdName}, amaliyot davomati, kundalik va ko'nikmalaringizni to'liq bajarishingiz zarur.`,
      type: 'warning'
    });
    showToast('info', 'Xabar yuborildi', `${stdName} ga ogohlantirish xabari jo'natildi.`);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Yagona “Talaba Amaliyot Holati” Monitoring Jadvali
          </h3>
          <p className="text-xs text-slate-500">
            Tizimdagi barcha jarayonlar natijalari avtomatik sinxronlashgan holda (Jami: {rows.length} ta talaba)
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-3 text-center">№</th>
              <th className="py-3 px-3">Talaba F.I.Sh. / ID</th>
              <th className="py-3 px-3">Fakultet & Yo'nalish</th>
              <th className="py-3 px-3">Guruh & Kurs</th>
              <th className="py-3 px-3">Amaliyot / Joy / Rahbar</th>
              <th className="py-3 px-2 text-center">Davomat %</th>
              <th className="py-3 px-2 text-center">Kundalik %</th>
              <th className="py-3 px-2 text-center">Ko‘nikma %</th>
              <th className="py-3 px-2 text-center">Imtihon</th>
              <th className="py-3 px-3 text-center">Jami (100)</th>
              <th className="py-3 px-2 text-center">Baho</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3">Muammo</th>
              <th className="py-3 px-3 text-center">Oxirgi Yangilanish</th>
              <th className="py-3 px-3 text-center">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={15} className="py-8 text-center text-slate-400">
                  Tanlangan parametrlar bo'yicha ma'lumot topilmadi.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => {
                const isFail = row.grade === '2' || row.status === 'RETAKE_REQUIRED';
                const isExcellent = row.grade === '5';
                const hasProblem = Boolean(row.problem);

                return (
                  <tr
                    key={row.student.id}
                    className={`hover:bg-slate-50/60 transition-colors ${
                      hasProblem ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    <td className="py-3 px-3 text-center font-mono text-slate-500">
                      {idx + 1}
                    </td>

                    {/* Student */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer" onClick={() => onOpenTimeline(row.student)}>
                        {row.student.fullName}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        ID: {row.student.studentId}
                      </div>
                    </td>

                    {/* Faculty */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800 text-[11px] max-w-[130px] truncate" title={row.facultyName}>
                        {row.facultyName}
                      </div>
                      <div className="text-[10px] text-slate-500 max-w-[130px] truncate" title={row.directionName}>
                        {row.directionName}
                      </div>
                    </td>

                    {/* Group */}
                    <td className="py-3 px-3 font-medium">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-800 font-semibold text-[11px]">
                        {row.groupName}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {row.courseLevel}-kurs
                      </div>
                    </td>

                    {/* Practice & Clinic */}
                    <td className="py-3 px-3 max-w-[160px]">
                      <div className="font-medium text-slate-800 text-[11px] truncate" title={row.practice?.name}>
                        {row.practice?.name || 'Amaliyot'}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate" title={row.practicePlace?.name}>
                        🏥 {row.practicePlace?.name || 'Klinik baza'}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate" title={row.supervisor?.fullName}>
                        👨‍⚕️ {row.supervisor?.fullName || 'Biriktirilmagan'}
                      </div>
                    </td>

                    {/* Attendance */}
                    <td className="py-3 px-2 text-center font-mono font-semibold">
                      <span
                        className={
                          row.attendancePercentage < 80
                            ? 'text-rose-600 font-bold'
                            : 'text-slate-800'
                        }
                      >
                        {row.attendancePercentage}%
                      </span>
                      <div className="text-[10px] text-slate-400">
                        {row.attendanceScore}/{row.attendanceMax} b
                      </div>
                    </td>

                    {/* Journal */}
                    <td className="py-3 px-2 text-center font-mono font-semibold">
                      <span
                        className={
                          row.journalCompletionPct < 50
                            ? 'text-amber-600 font-bold'
                            : 'text-slate-800'
                        }
                      >
                        {row.journalCompletionPct}%
                      </span>
                      <div className="text-[10px] text-slate-400">
                        {row.journalScore}/{row.journalMax} b
                      </div>
                    </td>

                    {/* Skills */}
                    <td className="py-3 px-2 text-center font-mono font-semibold">
                      <span
                        className={
                          row.skillsProgressPct < 60
                            ? 'text-amber-600 font-bold'
                            : 'text-slate-800'
                        }
                      >
                        {row.skillsProgressPct}%
                      </span>
                      <div className="text-[10px] text-slate-400">
                        {row.skillsScore}/{row.skillsMax} b
                      </div>
                    </td>

                    {/* Exam */}
                    <td className="py-3 px-2 text-center font-mono font-semibold">
                      <span
                        className={
                          row.examScore > 0 ? 'text-indigo-700' : 'text-slate-400'
                        }
                      >
                        {row.examScore}/{row.examMax} b
                      </span>
                      <div className="text-[9px] text-slate-400 uppercase">
                        {row.examStatus || 'Kutilmoqda'}
                      </div>
                    </td>

                    {/* Total Score */}
                    <td className="py-3 px-3 text-center">
                      <div
                        className={`text-sm font-bold font-mono ${
                          isFail
                            ? 'text-rose-600'
                            : isExcellent
                            ? 'text-emerald-700'
                            : 'text-blue-700'
                        }`}
                      >
                        {row.totalScore}
                      </div>
                      <div className="w-12 bg-slate-100 h-1.5 rounded-full mx-auto overflow-hidden mt-0.5">
                        <div
                          className={`h-full ${
                            isFail
                              ? 'bg-rose-500'
                              : isExcellent
                              ? 'bg-emerald-500'
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(100, row.totalScore)}%` }}
                        />
                      </div>
                    </td>

                    {/* Grade */}
                    <td className="py-3 px-2 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-bold text-xs ${
                          row.grade === '5'
                            ? 'bg-emerald-100 text-emerald-800'
                            : row.grade === '4'
                            ? 'bg-blue-100 text-blue-800'
                            : row.grade === '3'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {row.grade}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center">
                      {getStatusBadge(row.status)}
                    </td>

                    {/* Problem */}
                    <td className="py-3 px-3">
                      {row.problem ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 max-w-[150px] truncate" title={row.problem}>
                          <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                          <span className="truncate">{row.problem}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          Muammo yo'q
                        </span>
                      )}
                    </td>

                    {/* Last Updated */}
                    <td className="py-3 px-3 text-center font-mono text-slate-500 text-[11px]">
                      {row.lastUpdated}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onOpenTimeline(row.student)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="11 bosqichli Timeline ko'rish"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenAssessment(row.student.id)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Attestatsiya varaqasi"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleNotifyStudent(row.student.fullName)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Ogohlantirish jo'natish"
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
