import React, { useState } from 'react';
import {
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  Bell,
  Clock,
  User,
  Building2,
  Calendar,
  Sparkles,
  MessageSquare,
  ShieldAlert
} from 'lucide-react';
import { storageService } from '../../../services/storageService';
import { Student } from '../../../types';
import { useToast } from '../../../context/ToastContext';

interface ProblemStudentsViewProps {
  problems: any[];
  onOpenTimeline: (student: Student) => void;
  onRefresh: () => void;
}

export const ProblemStudentsView: React.FC<ProblemStudentsViewProps> = ({
  problems,
  onOpenTimeline,
  onRefresh
}) => {
  const { showToast } = useToast();
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const problemTypes = [
    { id: 'ALL', label: 'Barcha muammolar' },
    { id: 'ATTENDANCE_INSUFFICIENT', label: 'Davomat yetarli emas' },
    { id: 'JOURNAL_REVISION', label: 'Kundalik REVISION' },
    { id: 'JOURNAL_MISSING', label: 'Kundalik topshirilmagan' },
    { id: 'SKILLS_QUOTA_UNMET', label: 'Ko‘nikmalar me’yori yetarli emas' },
    { id: 'RETAKE_REQUIRED', label: 'Qayta topshirish kerak' },
    { id: 'EXAM_UNSCHEDULED', label: 'Imtihon belgilanmagan' }
  ];

  const filteredProblems = problems.filter(p => {
    if (selectedType !== 'ALL' && p.problemType !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.studentName.toLowerCase().includes(q);
      const matchGroup = p.group.toLowerCase().includes(q);
      const matchProb = p.problemLabel.toLowerCase().includes(q);
      if (!matchName && !matchGroup && !matchProb) return false;
    }
    return true;
  });

  const handleSendNotification = (p: any) => {
    storageService.addNotification({
      title: `Shoshilinch ogohlantirish: ${p.problemLabel}`,
      message: `${p.studentName}, ${p.comment}. Mas'ul shaxs: ${p.responsiblePerson}`,
      type: 'warning'
    });
    showToast('success', 'Xabar yuborildi', `${p.studentName} ga ogohlantirish xabarnomasi yuborildi.`);
  };

  const handleResolve = (p: any) => {
    p.status = 'RESOLVED';
    storageService.recordAuditLog({
      userId: 'system',
      userRole: 'PRACTICE_STAFF',
      action: 'problemResolved',
      entity: 'students',
      entityId: p.studentId,
      metadata: JSON.stringify({ problem: p.problemLabel })
    });
    showToast('success', 'Hal qilindi', `"${p.problemLabel}" muammosi ko'rib chiqilgan deb belgilandi.`);
    onRefresh();
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            Yuqori
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            O'rta
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            Past
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header filter bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Muammoli talabalar monitoring markazi</span>
            </h3>
            <p className="text-xs text-slate-500">
              Davomat, kundalik, amaliy ko'nikmalar yoki imtihonda ortda qolayotgan talabalar nazorati (Jami: {problems.length} ta)
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Talaba yoki muammo qidirish..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
          {problemTypes.map(t => {
            const count = t.id === 'ALL' ? problems.length : problems.filter(p => p.problemType === t.id).length;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedType(t.id)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                  selectedType === t.id
                    ? 'bg-rose-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Problems Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3 text-center">№</th>
                <th className="py-3 px-3">Talaba / Guruh</th>
                <th className="py-3 px-3">Fakultet & Amaliyot</th>
                <th className="py-3 px-3">Aniqlangan Muammo</th>
                <th className="py-3 px-2 text-center">Darajasi</th>
                <th className="py-3 px-3">Mas'ul Shaxs</th>
                <th className="py-3 px-3">Izoh / Tafsilot</th>
                <th className="py-3 px-3 text-center">Sana</th>
                <th className="py-3 px-3 text-center">Holat</th>
                <th className="py-3 px-3 text-center">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProblems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Muammoli holatlar mavjud emas. Barcha ko'rsatkichlar me'yorda!
                  </td>
                </tr>
              ) : (
                filteredProblems.map((p, idx) => {
                  const student = storageService.getStudents().find(s => s.id === p.studentId) || {
                    id: p.studentId,
                    studentId: 'STD',
                    pinfl: '',
                    fullName: p.studentName,
                    facultyId: '',
                    directionId: '',
                    courseId: '',
                    groupId: p.group,
                    group: p.group,
                    phone: '',
                    telegram: '',
                    email: '',
                    status: 'active'
                  };

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 text-center font-mono text-slate-500">
                        {idx + 1}
                      </td>

                      {/* Student */}
                      <td className="py-3 px-3">
                        <div
                          className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                          onClick={() => onOpenTimeline(student)}
                        >
                          {p.studentName}
                        </div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded">
                          {p.group}
                        </span>
                      </td>

                      {/* Faculty & Practice */}
                      <td className="py-3 px-3 max-w-[150px]">
                        <div className="font-semibold text-slate-800 text-[11px] truncate">
                          {p.faculty}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {p.practiceName}
                        </div>
                        {p.practicePlaceName && (
                          <div className="text-[10px] text-slate-400 truncate">
                            🏥 {p.practicePlaceName}
                          </div>
                        )}
                      </td>

                      {/* Problem Label */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-bold text-rose-700 text-xs">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{p.problemLabel}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                          {p.problemType}
                        </span>
                      </td>

                      {/* Severity */}
                      <td className="py-3 px-2 text-center">
                        {getSeverityBadge(p.severity)}
                      </td>

                      {/* Responsible */}
                      <td className="py-3 px-3 font-medium text-slate-800 text-xs">
                        {p.responsiblePerson}
                      </td>

                      {/* Comment */}
                      <td className="py-3 px-3 text-slate-600 text-xs max-w-[220px]">
                        {p.comment}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 text-center font-mono text-slate-500 text-[11px]">
                        {p.detectedDate}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'RESOLVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'IN_REVIEW'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {p.status === 'RESOLVED' ? 'Hal qilindi' : p.status === 'IN_REVIEW' ? 'Ko‘rib chiqilmoqda' : 'Ochiq'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleSendNotification(p)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Xabarnoma yuborish"
                          >
                            <Bell className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenTimeline(student)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Timeline ko'rish"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                          {p.status !== 'RESOLVED' && (
                            <button
                              type="button"
                              onClick={() => handleResolve(p)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Hal qilindi deb belgilash"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}
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
    </div>
  );
};
