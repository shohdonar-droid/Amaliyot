import React, { useState } from 'react';
import {
  Users,
  Search,
  Eye,
  Award,
  GraduationCap,
  ChevronRight,
  X,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { storageService } from '../../../services/storageService';
import { Student } from '../../../types';

interface GroupReportsViewProps {
  practiceId?: string;
  onOpenTimeline: (student: Student) => void;
}

export const GroupReportsView: React.FC<GroupReportsViewProps> = ({
  practiceId,
  onOpenTimeline
}) => {
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const groupsData = storageService.getGroupSummaryReports(practiceId);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Guruhlar Kesimida Yakuniy Amaliyot Hisoboti
            </h3>
            <p className="text-xs text-slate-500">
              Har bir akademik guruh bo'yicha davomat, kundalik, ko'nikmalar, imtihon va o'zlashtirish tahlili
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3 text-center">№</th>
                <th className="py-3 px-3">Guruh Nomi</th>
                <th className="py-3 px-3">Fakultet</th>
                <th className="py-3 px-2 text-center">Jami</th>
                <th className="py-3 px-2 text-center">Amaliyotda</th>
                <th className="py-3 px-2 text-center">Yakunlagan</th>
                <th className="py-3 px-2 text-center">Davomat %</th>
                <th className="py-3 px-2 text-center">Kundalik %</th>
                <th className="py-3 px-2 text-center">Ko'nikma %</th>
                <th className="py-3 px-2 text-center">Imtihon</th>
                <th className="py-3 px-2 text-center">O'rtacha Ball</th>
                <th className="py-3 px-3 text-center">Baholar (5/4/3/2)</th>
                <th className="py-3 px-2 text-center">O'zlashtirish %</th>
                <th className="py-3 px-2 text-center">Sifat %</th>
                <th className="py-3 px-2 text-center">Qayta topshirish</th>
                <th className="py-3 px-3 text-center">Tafsilot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {groupsData.length === 0 ? (
                <tr>
                  <td colSpan={16} className="py-8 text-center text-slate-400">
                    Guruhlar bo'yicha ma'lumot topilmadi.
                  </td>
                </tr>
              ) : (
                groupsData.map((g, idx) => (
                  <tr key={g.groupId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-center font-mono text-slate-500">
                      {idx + 1}
                    </td>

                    <td className="py-3 px-3 font-bold text-slate-900">
                      <button
                        type="button"
                        onClick={() => setSelectedGroup(g)}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-left font-bold"
                      >
                        {g.groupName}
                      </button>
                    </td>

                    <td className="py-3 px-3 text-slate-700 font-medium text-[11px]">
                      {g.facultyName}
                    </td>

                    <td className="py-3 px-2 text-center font-bold font-mono text-slate-900">
                      {g.totalStudents}
                    </td>

                    <td className="py-3 px-2 text-center font-mono text-blue-700 font-semibold">
                      {g.inPractice}
                    </td>

                    <td className="py-3 px-2 text-center font-mono text-emerald-700 font-semibold">
                      {g.completed}
                    </td>

                    <td className="py-3 px-2 text-center font-mono font-semibold">
                      <span className={g.avgAttendance < 80 ? 'text-rose-600' : 'text-slate-800'}>
                        {g.avgAttendance}%
                      </span>
                    </td>

                    <td className="py-3 px-2 text-center font-mono font-semibold">
                      <span className={g.avgJournal < 60 ? 'text-amber-600' : 'text-slate-800'}>
                        {g.avgJournal}%
                      </span>
                    </td>

                    <td className="py-3 px-2 text-center font-mono font-semibold">
                      <span className={g.avgSkills < 60 ? 'text-amber-600' : 'text-slate-800'}>
                        {g.avgSkills}%
                      </span>
                    </td>

                    <td className="py-3 px-2 text-center font-mono text-indigo-700 font-semibold">
                      {g.examCount}/{g.totalStudents}
                    </td>

                    <td className="py-3 px-2 text-center font-mono font-bold text-slate-900">
                      {g.avgScore}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-[11px] font-mono">
                        <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold" title="5 (A'lo)">
                          {g.grade5Count}
                        </span>
                        <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold" title="4 (Yaxshi)">
                          {g.grade4Count}
                        </span>
                        <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold" title="3 (Qoniqarli)">
                          {g.grade3Count}
                        </span>
                        <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold" title="2 (Qoniqarsiz)">
                          {g.grade2Count}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-2 text-center font-mono font-bold text-blue-700">
                      {g.masteryPercentage}%
                    </td>

                    <td className="py-3 px-2 text-center font-mono font-bold text-emerald-700">
                      {g.qualityPercentage}%
                    </td>

                    <td className="py-3 px-2 text-center font-mono">
                      {g.retakeCount > 0 ? (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded-full text-[10px]">
                          {g.retakeCount} nafar
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">0</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedGroup(g)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Talabalar</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Group Detail Modal */}
      {selectedGroup && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between shrink-0">
              <div>
                <h4 className="text-base font-bold">
                  {selectedGroup.groupName} Guruhining Talabalar Ro'yxati
                </h4>
                <p className="text-xs text-sky-100">
                  {selectedGroup.facultyName} • Jami: {selectedGroup.totalStudents} ta talaba
                </p>
              </div>
              <button
                onClick={() => setSelectedGroup(null)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-4 gap-2 text-center shrink-0">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">O'rtacha Ball</span>
                <span className="text-base font-bold text-slate-900">{selectedGroup.avgScore}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Davomat</span>
                <span className="text-base font-bold text-blue-700">{selectedGroup.avgAttendance}%</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">O'zlashtirish</span>
                <span className="text-base font-bold text-indigo-700">{selectedGroup.masteryPercentage}%</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Sifat Ko'rsatkichi</span>
                <span className="text-base font-bold text-emerald-700">{selectedGroup.qualityPercentage}%</span>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">№</th>
                    <th className="py-2.5 px-3">Talaba F.I.Sh.</th>
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-2 text-center">Davomat %</th>
                    <th className="py-2.5 px-2 text-center">Kundalik %</th>
                    <th className="py-2.5 px-2 text-center">Ko'nikma %</th>
                    <th className="py-2.5 px-2 text-center">Imtihon</th>
                    <th className="py-2.5 px-2 text-center">Jami</th>
                    <th className="py-2.5 px-2 text-center">Baho</th>
                    <th className="py-2.5 px-3 text-center">Holat</th>
                    <th className="py-2.5 px-3 text-center">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {selectedGroup.students.map((r: any, idx: number) => (
                    <tr key={r.student.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{r.student.fullName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{r.student.studentId}</td>
                      <td className="py-2.5 px-2 text-center font-mono">{r.attendancePercentage}%</td>
                      <td className="py-2.5 px-2 text-center font-mono">{r.journalCompletionPct}%</td>
                      <td className="py-2.5 px-2 text-center font-mono">{r.skillsProgressPct}%</td>
                      <td className="py-2.5 px-2 text-center font-mono">{r.examScore} b</td>
                      <td className="py-2.5 px-2 text-center font-mono font-bold text-blue-700">{r.totalScore}</td>
                      <td className="py-2.5 px-2 text-center font-bold">{r.grade}</td>
                      <td className="py-2.5 px-3 text-center text-[10px] font-semibold">{r.status}</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedGroup(null);
                            onOpenTimeline(r.student);
                          }}
                          className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[11px] font-semibold"
                        >
                          Timeline
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSelectedGroup(null)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-lg transition-colors"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
