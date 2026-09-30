import React from 'react';
import {
  Building2,
  Stethoscope,
  Users,
  CheckCircle2,
  AlertTriangle,
  Award
} from 'lucide-react';
import { storageService } from '../../../services/storageService';

export const ClinicReportsView: React.FC<{ practiceId?: string }> = ({
  practiceId
}) => {
  const clinics = storageService.getClinicReports(practiceId);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Klinik Bazalar (Shifoxonalar) Kesimida Monitoring
            </h3>
            <p className="text-xs text-slate-500">
              Klinik bazalardagi talabalar sig'imi, amaliyot rahbarlari tarkibi va natijadorlik tahlili
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3 text-center">№</th>
                <th className="py-3 px-4">Klinik Baza Nomi</th>
                <th className="py-3 px-3">Turi / Bo'lim</th>
                <th className="py-3 px-2 text-center">Talabalar</th>
                <th className="py-3 px-3">Amaliyot Rahbarlari</th>
                <th className="py-3 px-2 text-center">Davomat %</th>
                <th className="py-3 px-2 text-center">Kundalik %</th>
                <th className="py-3 px-2 text-center">Ko'nikma %</th>
                <th className="py-3 px-2 text-center">O'rtacha Ball</th>
                <th className="py-3 px-2 text-center">Muammoli</th>
                <th className="py-3 px-2 text-center">Tasdiqlangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {clinics.map((c, idx) => (
                <tr key={c.clinicId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 text-center font-mono text-slate-500">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{c.clinicName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold text-[11px]">
                      {c.type}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {c.department}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center font-mono font-bold text-slate-900">
                    {c.studentsCount}
                  </td>
                  <td className="py-3 px-3 text-slate-700 text-xs">
                    <div className="max-w-[180px] truncate" title={c.supervisorsList.join(', ')}>
                      {c.supervisorsList.length > 0 ? c.supervisorsList.join(', ') : 'Biriktirilmagan'}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      ({c.supervisorsCount} nafar mas'ul)
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center font-mono font-semibold">
                    <span className={c.avgAttendance < 80 ? 'text-rose-600' : 'text-slate-800'}>
                      {c.avgAttendance}%
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center font-mono font-semibold">
                    {c.avgJournal}%
                  </td>
                  <td className="py-3 px-2 text-center font-mono font-semibold">
                    {c.avgSkills}%
                  </td>
                  <td className="py-3 px-2 text-center font-mono font-bold text-blue-700">
                    {c.avgScore}
                  </td>
                  <td className="py-3 px-2 text-center font-mono">
                    {c.problemCount > 0 ? (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded-full text-[10px]">
                        {c.problemCount} ta
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-semibold text-[11px]">0</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-emerald-700 font-bold">
                    {c.approvedCount}
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
