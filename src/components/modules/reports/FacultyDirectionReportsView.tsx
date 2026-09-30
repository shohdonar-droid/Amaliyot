import React from 'react';
import {
  Building2,
  Users,
  Award,
  BookOpen,
  Calendar,
  Stethoscope,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { storageService } from '../../../services/storageService';

export const FacultyDirectionReportsView: React.FC<{ practiceId?: string }> = ({
  practiceId
}) => {
  const faculties = storageService.getFacultyDirectionReports(practiceId);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Fakultetlar va Yo'nalishlar Kesimida Yakuniy Hisobot
            </h3>
            <p className="text-xs text-slate-500">
              Fakultetlar bo'yicha talabalar kontingenti, klinik bazalar qamrovi, o'rtacha ballar va sifat ko'rsatkichlari
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3 text-center">№</th>
                <th className="py-3 px-4">Fakultet Nomi</th>
                <th className="py-3 px-2 text-center">Talabalar</th>
                <th className="py-3 px-2 text-center">Klinikalar</th>
                <th className="py-3 px-2 text-center">Rahbarlar</th>
                <th className="py-3 px-2 text-center">Davomat %</th>
                <th className="py-3 px-2 text-center">Kundalik %</th>
                <th className="py-3 px-2 text-center">Ko'nikma %</th>
                <th className="py-3 px-2 text-center">O'rtacha Ball</th>
                <th className="py-3 px-3 text-center">Baholar Taqsimoti (5/4/3/2)</th>
                <th className="py-3 px-2 text-center">O'zlashtirish %</th>
                <th className="py-3 px-2 text-center">Sifat %</th>
                <th className="py-3 px-2 text-center">Qayta topshirish</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {faculties.map((f, idx) => (
                <tr key={f.facultyId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 text-center font-mono text-slate-500">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{f.facultyName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center font-mono font-bold text-slate-900">
                    {f.studentsCount}
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-slate-700">
                    {f.clinicsCount} ta
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-slate-700">
                    {f.supervisorsCount} nafar
                  </td>
                  <td className="py-3 px-2 text-center font-mono font-semibold">
                    {f.avgAttendance}%
                  </td>
                  <td className="py-3 px-2 text-center font-mono font-semibold">
                    {f.avgJournal}%
                  </td>
                  <td className="py-3 px-2 text-center font-mono font-semibold">
                    {f.avgSkills}%
                  </td>
                  <td className="py-3 px-2 text-center font-mono font-bold text-blue-700">
                    {f.avgScore}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-[11px] font-mono">
                      <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold" title="5">
                        {f.grade5}
                      </span>
                      <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold" title="4">
                        {f.grade4}
                      </span>
                      <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold" title="3">
                        {f.grade3}
                      </span>
                      <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold" title="2">
                        {f.grade2}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center font-mono font-bold text-blue-700">
                    {f.masteryPercentage}%
                  </td>
                  <td className="py-3 px-2 text-center font-mono font-bold text-emerald-700">
                    {f.qualityPercentage}%
                  </td>
                  <td className="py-3 px-2 text-center font-mono">
                    {f.retakeCount > 0 ? (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded-full text-[10px]">
                        {f.retakeCount} nafar
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
