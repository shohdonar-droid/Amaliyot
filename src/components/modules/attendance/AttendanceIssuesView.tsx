import React, { useState } from 'react';
import {
  AlertTriangle,
  Users,
  Search,
  Filter,
  Eye,
  Phone,
  Send,
  Calendar,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Student, Practice, PracticeAssignment, Attendance, PracticePlace, Group } from '../../../types';
import { storageService } from '../../../services/storageService';
import { useToast } from '../../../context/ToastContext';
import { Modal } from '../../common/Modal';

interface AttendanceIssuesViewProps {
  students: Student[];
  practices: Practice[];
  places: PracticePlace[];
  groups: Group[];
  attendance: Attendance[];
  onOpenManualModal?: (studentId: string, practiceId: string) => void;
}

export function AttendanceIssuesView({
  students,
  practices,
  places,
  groups,
  attendance,
  onOpenManualModal
}: AttendanceIssuesViewProps) {
  const { showToast } = useToast();

  const [filterType, setFilterType] = useState<'all' | 'critical' | 'frequent_late' | 'low_rate'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentForDossier, setSelectedStudentForDossier] = useState<Student | null>(null);

  const isPresent = (st?: string) => st?.toUpperCase() === 'PRESENT';
  const isLate = (st?: string) => st?.toUpperCase() === 'LATE';
  const isAbsent = (st?: string) => st?.toUpperCase() === 'ABSENT';
  const isExcused = (st?: string) => st?.toUpperCase() === 'EXCUSED';

  // Compute issue metrics for each student
  const studentMetrics = students.map(student => {
    const studentAtt = attendance.filter(a => a.studentId === student.id);
    const absentCount = studentAtt.filter(a => isAbsent(a.status)).length;
    const lateCount = studentAtt.filter(a => isLate(a.status)).length;
    const presentCount = studentAtt.filter(a => isPresent(a.status)).length;
    const excusedCount = studentAtt.filter(a => isExcused(a.status)).length;
    const totalRecorded = studentAtt.length;

    const rate = totalRecorded > 0
      ? Math.round(((presentCount + lateCount + excusedCount) / totalRecorded) * 100)
      : (student.status === 'in_practice' ? 85 : 100);

    // Classification (Section 15):
    // 🔴 3 kun kelmagan
    // 🟠 ko'p kechikkan (>= 2)
    // 🟡 davomat past (<80%)
    // 🟢 normal
    let severity: 'critical' | 'frequent_late' | 'low_rate' | 'normal' = 'normal';
    if (absentCount >= 3) {
      severity = 'critical'; // 🔴 3 kun kelmagan
    } else if (lateCount >= 2) {
      severity = 'frequent_late'; // 🟠 ko'p kechikkan
    } else if (rate < 80) {
      severity = 'low_rate'; // 🟡 davomat past
    }

    const assignment = storageService.getAssignments().find(a => a.studentId === student.id);
    const practice = practices.find(p => p.id === (assignment?.practiceId || student.currentPracticeId));
    const place = places.find(p => p.id === (assignment?.practicePlaceId || student.currentPracticePlaceId));
    const group = groups.find(g => g.id === student.groupId);

    return {
      student,
      absentCount,
      lateCount,
      presentCount,
      excusedCount,
      totalRecorded,
      rate,
      severity,
      practice,
      place,
      group,
      assignment
    };
  });

  // Filter only problematic students by default, or all
  const problematicList = studentMetrics.filter(m => {
    if (filterType === 'critical') return m.severity === 'critical';
    if (filterType === 'frequent_late') return m.severity === 'frequent_late';
    if (filterType === 'low_rate') return m.severity === 'low_rate';
    // 'all' includes any problem
    return m.severity !== 'normal';
  }).filter(m => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.student.fullName.toLowerCase().includes(q) ||
      m.student.studentId.toLowerCase().includes(q) ||
      m.group?.name.toLowerCase().includes(q)
    );
  });

  // Dossier student records
  const dossierStudent = selectedStudentForDossier;
  const dossierRecords = dossierStudent
    ? attendance
        .filter(a => a.studentId === dossierStudent.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  const criticalCount = studentMetrics.filter(m => m.severity === 'critical').length;
  const frequentLateCount = studentMetrics.filter(m => m.severity === 'frequent_late').length;
  const lowRateCount = studentMetrics.filter(m => m.severity === 'low_rate').length;
  const normalCount = studentMetrics.filter(m => m.severity === 'normal').length;

  return (
    <div className="space-y-6">
      {/* 4 Classification Filter Badges (Section 15) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setFilterType(filterType === 'critical' ? 'all' : 'critical')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterType === 'critical'
              ? 'bg-red-50 border-red-300 ring-2 ring-red-400 shadow-sm'
              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xl">🔴</span>
            <span className="text-xl font-bold font-mono text-red-700">{criticalCount}</span>
          </div>
          <h4 className="text-xs font-bold text-slate-800 mt-2">3 kun kelmagan</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Xavfli xavf guruhi (Kritik)</p>
        </button>

        <button
          type="button"
          onClick={() => setFilterType(filterType === 'frequent_late' ? 'all' : 'frequent_late')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterType === 'frequent_late'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400 shadow-sm'
              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xl">🟠</span>
            <span className="text-xl font-bold font-mono text-amber-700">{frequentLateCount}</span>
          </div>
          <h4 className="text-xs font-bold text-slate-800 mt-2">Ko'p kechikkan</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">2+ marta kechikish qaydlari</p>
        </button>

        <button
          type="button"
          onClick={() => setFilterType(filterType === 'low_rate' ? 'all' : 'low_rate')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterType === 'low_rate'
              ? 'bg-yellow-50 border-yellow-300 ring-2 ring-yellow-400 shadow-sm'
              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xl">🟡</span>
            <span className="text-xl font-bold font-mono text-yellow-700">{lowRateCount}</span>
          </div>
          <h4 className="text-xs font-bold text-slate-800 mt-2">Davomat past</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Davomat foizi 80% dan past</p>
        </button>

        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterType === 'all'
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-400 shadow-sm'
              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xl">🟢</span>
            <span className="text-xl font-bold font-mono text-emerald-700">{normalCount}</span>
          </div>
          <h4 className="text-xs font-bold text-slate-800 mt-2">Normal talabalar</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Davomati 90% dan yuqori</p>
        </button>
      </div>

      {/* Search and Filters Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Muammoli talaba F.I.Sh. yoki guruh..."
            className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span>Filtr:</span>
          <span className="font-semibold text-slate-900 font-mono">
            {problematicList.length} nafar talaba topildi
          </span>
        </div>
      </div>

      {/* Section 16: Problematic Cards & Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {problematicList.map(item => (
          <div
            key={item.student.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3 flex flex-col justify-between hover:border-slate-300 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-lg">
                    {item.severity === 'critical' ? '🔴' : item.severity === 'frequent_late' ? '🟠' : '🟡'}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">
                    {item.student.fullName}
                  </h4>
                  <p className="text-[11px] font-mono text-slate-500">
                    ID: {item.student.studentId} · Guruh: {item.group?.name || 'Guruh'}
                  </p>
                </div>

                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  item.rate < 70 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {item.rate}%
                </span>
              </div>

              {/* Exact card layout requested in Section 16 */}
              <div className="mt-3 p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Amaliyot:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[170px]">
                    {item.practice?.type || 'Klinik amaliyot'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Klinik baza:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[170px]">
                    {item.place?.name || 'Respublika shifoxonasi'}
                  </span>
                </div>
                <div className="flex justify-between text-red-700">
                  <span>Kelmagan:</span>
                  <span className="font-bold font-mono">{item.absentCount} kun</span>
                </div>
                <div className="flex justify-between text-amber-700">
                  <span>Kechikkan:</span>
                  <span className="font-bold font-mono">{item.lateCount} marta</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t flex items-center justify-between gap-2">
              <a
                href={`tel:${item.student.phone}`}
                className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border"
                title="Qo'ng'iroq qilish"
              >
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>Aloqa</span>
              </a>

              <button
                type="button"
                onClick={() => setSelectedStudentForDossier(item.student)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors shrink-0"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>[Ko'rish]</span>
              </button>
            </div>
          </div>
        ))}

        {problematicList.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 p-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">Muammoli holatlar topilmadi</h4>
            <p className="text-xs text-slate-500 mt-1">
              Tanlangan filtr bo'yicha barcha talabalarning davomati qoniqarli darajada.
            </p>
          </div>
        )}
      </div>

      {/* Student Dossier Modal */}
      {dossierStudent && (
        <Modal
          isOpen={!!selectedStudentForDossier}
          onClose={() => setSelectedStudentForDossier(null)}
          title={`Talaba davomat dosyesi · ${dossierStudent.fullName}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between text-xs">
              <div>
                <span className="font-mono text-slate-500 text-[11px]">Guvohnoma ID: {dossierStudent.studentId}</span>
                <p className="font-semibold text-slate-800">{dossierStudent.phone} · {dossierStudent.email}</p>
              </div>

              {onOpenManualModal && (
                <button
                  type="button"
                  onClick={() => {
                    const stId = dossierStudent.id;
                    const prId = dossierStudent.currentPracticeId || practices[0]?.id;
                    setSelectedStudentForDossier(null);
                    onOpenManualModal(stId, prId);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg"
                >
                  Qo'lda tahrirlash (Uzrli qilish)
                </button>
              )}
            </div>

            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 font-semibold text-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Sana</th>
                    <th className="py-2.5 px-3">Holat</th>
                    <th className="py-2.5 px-3">Kelish / Ketish</th>
                    <th className="py-2.5 px-3">Izoh / Sabab</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dossierRecords.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-medium">{rec.date}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.status.toUpperCase() === 'PRESENT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.status.toUpperCase() === 'LATE'
                            ? 'bg-amber-100 text-amber-800'
                            : rec.status.toUpperCase() === 'EXCUSED'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {rec.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono">{rec.checkInTime || '—'} / {rec.checkOutTime || '—'}</td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">{rec.note || rec.notes || '—'}</td>
                    </tr>
                  ))}
                  {dossierRecords.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-slate-400">
                        Davomat qaydlari mavjud emas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStudentForDossier(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border"
              >
                Yopish
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
