import React, { useState } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  CalendarCheck,
  Eye,
  Check,
  Building2,
  Calendar
} from 'lucide-react';
import { Supervisor, Student, Practice, PracticeAssignment, Attendance, PracticePlace, Group } from '../../../types';
import { storageService } from '../../../services/storageService';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/AuthContext';

interface SupervisorAttendanceViewProps {
  supervisorId: string;
  onOpenManualModal?: (studentId: string, practiceId: string) => void;
  onRefresh?: () => void;
}

export function SupervisorAttendanceView({
  supervisorId,
  onOpenManualModal,
  onRefresh
}: SupervisorAttendanceViewProps) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const todayDate = '2026-09-28';

  const students = storageService.getStudents();
  const assignments = storageService.getAssignments();
  const practices = storageService.getPractices();
  const places = storageService.getPracticePlaces();
  const groups = storageService.getGroups();
  const attendance = storageService.getAttendance();

  // Filter only students assigned to this supervisor (Section 13 & 18 security isolation)
  const myAssignments = assignments.filter(a => a.supervisorId === supervisorId);
  const myStudentIds = new Set(myAssignments.map(a => a.studentId));
  const myStudents = students.filter(s => myStudentIds.has(s.id));

  const isPresent = (st?: string) => st?.toUpperCase() === 'PRESENT';
  const isLate = (st?: string) => st?.toUpperCase() === 'LATE';
  const isAbsent = (st?: string) => st?.toUpperCase() === 'ABSENT';
  const isExcused = (st?: string) => st?.toUpperCase() === 'EXCUSED';

  // Compute metrics for each assigned student
  const studentRows = myStudents.map(student => {
    const studentAssignment = myAssignments.find(a => a.studentId === student.id);
    const place = places.find(p => p.id === studentAssignment?.practicePlaceId);
    const group = groups.find(g => g.id === student.groupId);
    const practice = practices.find(p => p.id === studentAssignment?.practiceId);

    const studentAtt = attendance.filter(a => a.studentId === student.id);
    const todayAtt = studentAtt.find(a => a.date === todayDate);

    const absentDays = studentAtt.filter(a => isAbsent(a.status)).length;
    const lateDays = studentAtt.filter(a => isLate(a.status)).length;
    const presentDays = studentAtt.filter(a => isPresent(a.status)).length;
    const excusedDays = studentAtt.filter(a => isExcused(a.status)).length;
    const totalDays = studentAtt.length;

    const rate = totalDays > 0
      ? Math.round(((presentDays + lateDays + excusedDays) / totalDays) * 100)
      : (student.status === 'in_practice' ? 95 : 100);

    return {
      student,
      studentAssignment,
      place,
      group,
      practice,
      todayAtt,
      absentDays,
      lateDays,
      presentDays,
      rate
    };
  }).filter(row => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      row.student.fullName.toLowerCase().includes(q) ||
      row.student.studentId.toLowerCase().includes(q) ||
      row.group?.name.toLowerCase().includes(q)
    );
  });

  const handleApproveToday = (row: typeof studentRows[0]) => {
    if (!row.studentAssignment) return;
    storageService.manualUpdateAttendance({
      studentId: row.student.id,
      practiceId: row.studentAssignment.practiceId,
      date: todayDate,
      status: 'PRESENT',
      checkInTime: '08:30',
      checkOutTime: '14:30',
      reason: 'Universitet rahbari tomonidan tasdiqlandi',
      actorUserId: currentUser?.uid || 'supervisor',
      actorRole: 'PRACTICE_SUPERVISOR',
      actorName: currentUser?.fullName || 'Amaliyot rahbari'
    });

    showToast('success', 'Davomat tasdiqlandi', `${row.student.fullName} bugun qatnashgan deb belgilandi`);
    if (onRefresh) onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header and stats */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Mening talabalarim davomati (Section 13)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sizga biriktirilgan talabalar: <strong>{myStudents.length} nafar</strong>. Klinik bazalardagi qatnashishi va intizomi nazorati.
            </p>
          </div>

          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Talaba F.I.Sh. yoki guruh..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg bg-slate-50 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Table required by Section 13 */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">F.I.Sh.</th>
                <th className="py-3 px-4">Guruh</th>
                <th className="py-3 px-4">Klinik baza</th>
                <th className="py-3 px-4 text-center">Davomat %</th>
                <th className="py-3 px-4">Bugungi status</th>
                <th className="py-3 px-4 text-center">Kechikishlar</th>
                <th className="py-3 px-4 text-center">Kelmagan kunlar</th>
                <th className="py-3 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentRows.map(row => {
                const todaySt = row.todayAtt?.status?.toUpperCase();
                return (
                  <tr key={row.student.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{row.student.fullName}</div>
                      <div className="font-mono text-[10px] text-slate-500">{row.student.studentId}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {row.group?.name || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div className="truncate max-w-[200px]">{row.place?.name}</div>
                      <div className="text-[10px] text-slate-500">{row.studentAssignment?.department}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block font-mono font-bold px-2 py-0.5 rounded-md ${
                        row.rate >= 90 ? 'bg-emerald-100 text-emerald-800' :
                        row.rate >= 75 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {row.rate}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {row.todayAtt ? (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          todaySt === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' :
                          todaySt === 'LATE' ? 'bg-amber-100 text-amber-800' :
                          todaySt === 'EXCUSED' ? 'bg-purple-100 text-purple-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {todaySt === 'PRESENT' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {todaySt === 'LATE' && <Clock className="w-3 h-3 text-amber-600" />}
                          {todaySt === 'ABSENT' && <XCircle className="w-3 h-3 text-red-600" />}
                          {todaySt === 'PRESENT' ? `Kelgan (${row.todayAtt.checkInTime})` :
                           todaySt === 'LATE' ? `Kechikkan (${row.todayAtt.checkInTime})` :
                           todaySt === 'EXCUSED' ? 'Uzrli' : 'Kelmagan'}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Belgilanmagan</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-amber-700">
                      {row.lateDays > 0 ? `${row.lateDays} marta` : '0'}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-red-700">
                      {row.absentDays > 0 ? `${row.absentDays} kun` : '0'}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {!row.todayAtt && (
                        <button
                          type="button"
                          onClick={() => handleApproveToday(row)}
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                          title="Bugungi davomatni tasdiqlash"
                        >
                          Tasdiqlash
                        </button>
                      )}
                      {onOpenManualModal && (
                        <button
                          type="button"
                          onClick={() => onOpenManualModal(row.student.id, row.studentAssignment?.practiceId || '')}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border"
                        >
                          Tahrirlash
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
