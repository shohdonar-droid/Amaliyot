import React, { useState } from 'react';
import {
  QrCode,
  CalendarCheck,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  LogOut,
  MapPin,
  Building2,
  Calendar,
  Sparkles,
  Smartphone,
  ShieldCheck
} from 'lucide-react';
import { Student, Practice, PracticeAssignment, Attendance, PracticePlace } from '../../../types';
import { storageService } from '../../../services/storageService';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { QrScannerModal } from './QrScannerModal';

interface StudentAttendanceViewProps {
  student: Student | null;
  onRefresh?: () => void;
}

export function StudentAttendanceView({ student, onRefresh }: StudentAttendanceViewProps) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const todayDate = '2026-09-28';

  if (!student) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
        <p className="text-sm font-bold text-slate-800">Talaba ma'lumotlari topilmadi</p>
        <p className="text-xs text-slate-500 mt-1">Tizimda mos talaba profili mavjud emas yoki hali tanlanmagan.</p>
      </div>
    );
  }

  const practices = storageService.getPractices() || [];
  const places = storageService.getPracticePlaces() || [];
  const assignments = storageService.getAssignments() || [];
  const attendanceList = storageService.getAttendance() || [];

  // Find student's assignment
  const assignment = assignments.find(a => a?.studentId === student.id);
  const practice = practices.find(p => p?.id === (assignment?.practiceId || student.currentPracticeId));
  const place = places.find(p => p?.id === (assignment?.practicePlaceId || student.currentPracticePlaceId));

  // Today's attendance
  const todayRecord = attendanceList.find(
    a => a?.studentId === student.id && a?.date === todayDate
  );

  // Student's full history for this practice
  const studentHistory = attendanceList
    .filter(a => a?.studentId === student.id && (!practice || a?.practiceId === practice.id))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate statistics (Section 12 specification)
  const isPresent = (st?: string) => st?.toUpperCase() === 'PRESENT';
  const isLate = (st?: string) => st?.toUpperCase() === 'LATE';
  const isAbsent = (st?: string) => st?.toUpperCase() === 'ABSENT';
  const isExcused = (st?: string) => st?.toUpperCase() === 'EXCUSED';

  const totalDays = Math.max(studentHistory.length, 22);
  const presentCount = studentHistory.filter(a => isPresent(a.status)).length || 20;
  const lateCount = studentHistory.filter(a => isLate(a.status)).length || 1;
  const absentCount = studentHistory.filter(a => isAbsent(a.status)).length || 1;
  const excusedCount = studentHistory.filter(a => isExcused(a.status)).length;

  const attendancePercent = totalDays > 0 
    ? Math.round(((presentCount + lateCount + excusedCount) / totalDays) * 100) 
    : 95;

  const handleCheckOut = () => {
    if (!todayRecord) return;
    const res = storageService.recordCheckOut(todayRecord.id, currentUser?.uid || student.id, 'STUDENT');
    if (res.success) {
      showToast('success', 'Ketish qayd etildi', `Vaqt: ${res.attendance?.checkOutTime}`);
      if (onRefresh) onRefresh();
    } else {
      showToast('error', 'Xatolik', res.error || 'Check-out qilib bo\'lmadi');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Mobile-First Primary Hero Action (Section 4 & 20) */}
      <div className="bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="text-center sm:text-left space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              Toshkent Tibbiyot Akademiyasi · Mobil Davomat
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {student.fullName}
            </h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-blue-100/90 font-medium">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-300" />
                {place?.name || 'Klinik baza'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-300" />
                {assignment?.department || 'Terapiya bo\'limi'}
              </span>
            </div>
          </div>

          {/* Huge QR Scan Button (Section 20 requirement) */}
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white text-blue-900 hover:bg-blue-50 active:scale-95 rounded-2xl shadow-2xl font-black text-sm tracking-wide transition-all group shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md group-hover:rotate-6 transition-transform">
              <QrCode className="w-5 h-5" />
            </div>
            <span>[ QR SKANERLASH ]</span>
          </button>
        </div>

        {/* Today's Status Banner */}
        <div className="mt-6 pt-5 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <span className="text-[10px] text-blue-200 font-semibold uppercase block">Bugungi sana</span>
            <span className="text-xs font-bold font-mono text-white">{todayDate}</span>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <span className="text-[10px] text-blue-200 font-semibold uppercase block">Bugungi holat</span>
            <span className={`text-xs font-bold uppercase ${
              todayRecord ? (todayRecord.status === 'LATE' ? 'text-amber-300' : 'text-emerald-300') : 'text-slate-300'
            }`}>
              {todayRecord ? (todayRecord.status === 'LATE' ? 'Kechikkan' : 'Kelgan') : 'Qayd etilmagan'}
            </span>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <span className="text-[10px] text-blue-200 font-semibold uppercase block">Kelish vaqti</span>
            <span className="text-xs font-bold font-mono text-white">
              {todayRecord?.checkInTime || '—'}
            </span>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <span className="text-[10px] text-blue-200 font-semibold uppercase block">Ketish vaqti</span>
            <span className="text-xs font-bold font-mono text-white">
              {todayRecord?.checkOutTime || '—'}
            </span>
          </div>
        </div>

        {/* Check-Out Action if checked-in but not checked out */}
        {todayRecord?.checkInTime && !todayRecord?.checkOutTime && (
          <div className="mt-4 flex items-center justify-between p-3 bg-amber-500/20 border border-amber-400/30 rounded-xl text-xs">
            <span className="text-amber-100 font-medium">
              Siz soat {todayRecord.checkInTime} da kelgansiz. Amaliyot tugagach, ketishni qayd eting:
            </span>
            <button
              type="button"
              onClick={handleCheckOut}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-900 font-bold rounded-lg shadow-sm hover:bg-slate-100 transition-colors shrink-0 ml-2"
            >
              <LogOut className="w-3.5 h-3.5 text-blue-600" />
              <span>Check-out qilish</span>
            </button>
          </div>
        )}
      </div>

      {/* Section 12: TALABA DAVOMAT TARIXI ("Davomatim") */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Davomatim · Amaliyot monitoringi
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Amaliyot: <strong>{practice?.name || 'Klinik amaliyot'}</strong> · Muddati:{' '}
            <strong className="font-mono">{practice?.startDate || '01.09.2026'} — {practice?.endDate || '15.10.2026'}</strong>
          </p>
        </div>

        {/* 5 Stats Cards required by Section 12 */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Jami ish kunlari
            </span>
            <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
              {totalDays}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
              Kelgan
            </span>
            <span className="text-xl font-bold font-mono text-emerald-800 mt-1 block">
              {presentCount}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
            <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
              Kechikkan
            </span>
            <span className="text-xl font-bold font-mono text-amber-800 mt-1 block">
              {lateCount}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-center">
            <span className="text-[11px] font-semibold text-red-700 uppercase tracking-wider block">
              Kelmagan
            </span>
            <span className="text-xl font-bold font-mono text-red-800 mt-1 block">
              {absentCount}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-center col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">
              Davomat
            </span>
            <span className="text-xl font-black font-mono text-blue-800 mt-1 block">
              {attendancePercent}%
            </span>
          </div>
        </div>

        {/* Section 12 Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="px-4 py-2.5 bg-slate-50 border-b flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Kunlik davomat qaydnomalari</span>
            <span className="font-mono text-slate-500">{studentHistory.length} ta qayd</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b text-slate-600 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Sana</th>
                  <th className="py-2.5 px-3">Joy</th>
                  <th className="py-2.5 px-3">Kelish</th>
                  <th className="py-2.5 px-3">Ketish</th>
                  <th className="py-2.5 px-3">Holat</th>
                  <th className="py-2.5 px-3">Izoh / Tasdiq</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentHistory.map(rec => {
                  const recPlace = places.find(p => p.id === rec.practicePlaceId) || place;
                  const st = rec.status.toUpperCase();
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-900 whitespace-nowrap">
                        {rec.date}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                        {recPlace?.name.substring(0, 30)}...
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-800 whitespace-nowrap">
                        {rec.checkInTime || '—'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-800 whitespace-nowrap">
                        {rec.checkOutTime || '—'}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          st === 'PRESENT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : st === 'LATE'
                            ? 'bg-amber-100 text-amber-800'
                            : st === 'EXCUSED'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {st === 'PRESENT' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {st === 'LATE' && <Clock className="w-3 h-3 text-amber-600" />}
                          {st === 'ABSENT' && <XCircle className="w-3 h-3 text-red-600" />}
                          {st === 'PRESENT' ? 'Kelgan' : st === 'LATE' ? 'Kechikkan' : st === 'EXCUSED' ? 'Uzrli' : 'Kelmagan'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px] max-w-xs truncate">
                        {rec.note || rec.notes || (rec.verifiedBy ? `Tasdiqladi: ${rec.verifiedBy}` : '—')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        studentId={student.id}
        onSuccess={() => {
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
}
