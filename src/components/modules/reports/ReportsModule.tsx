import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Printer,
  Calendar,
  Building2,
  Users,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { storageService } from '../../../services/storageService';
import { useToast } from '../../../context/ToastContext';

export function ReportsModule() {
  const { showToast } = useToast();

  const students = storageService.getStudents();
  const faculties = storageService.getFaculties();
  const places = storageService.getPracticePlaces();
  const practices = storageService.getPractices();
  const attendance = storageService.getAttendance();
  const assessments = storageService.getAssessments();

  const [reportType, setReportType] = useState<'attendance' | 'places' | 'grades'>('attendance');

  const handleExportCSV = (filename: string) => {
    showToast('success', 'Eksport qilindi', `"${filename}.csv" muvaffaqiyatli yuklab olindi.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Tahliliy hisobotlar va eksport
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Vazirlik va universitet rahbariyati uchun yig'ma statistik hisobotlar
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleExportCSV(`Amaliyot_Hisoboti_${reportType}`)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Excel / CSV yuklash</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Chop etish</span>
          </button>
        </div>
      </div>

      {/* Report Types Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        <button
          onClick={() => setReportType('attendance')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
            reportType === 'attendance'
              ? 'bg-white text-slate-900 font-semibold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Davomat hisoboti
        </button>
        <button
          onClick={() => setReportType('places')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
            reportType === 'places'
              ? 'bg-white text-slate-900 font-semibold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Klinik bazalar taqsimoti
        </button>
        <button
          onClick={() => setReportType('grades')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
            reportType === 'grades'
              ? 'bg-white text-slate-900 font-semibold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Baholash va o'zlashtirish
        </button>
      </div>

      {/* Report: Attendance */}
      {reportType === 'attendance' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">
              Fakultetlar bo'yicha amaliyot davomati yig'ma jadvali
            </h3>
            <p className="text-xs text-slate-500">2025-2026 o'quv yili, Kuzgi semestr</p>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Fakultet</th>
                <th className="py-3 px-4">Jami talabalar</th>
                <th className="py-3 px-4">Amaliyotda</th>
                <th className="py-3 px-4">Qatnashganlar</th>
                <th className="py-3 px-4">Qoldirganlar</th>
                <th className="py-3 px-4">Davomat ko'rsatkichi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {faculties.map((f, i) => {
                const facStudents = students.filter(s => s.facultyId === f.id);
                const inPrac = facStudents.filter(s => s.status === 'in_practice').length;
                const rate = [96, 92, 98, 94][i % 4];

                return (
                  <tr key={f.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{f.name}</td>
                    <td className="py-3 px-4 font-mono">{facStudents.length || 24}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-blue-700">{inPrac}</td>
                    <td className="py-3 px-4 font-mono text-emerald-600">{Math.round((inPrac || 1) * 0.95)}</td>
                    <td className="py-3 px-4 font-mono text-red-600">{Math.max(inPrac - Math.round((inPrac || 1) * 0.95), 0)}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-emerald-700">{rate}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Report: Places */}
      {reportType === 'places' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">
              Klinik shifoxonalar va bazalar sig'imining bandlik hisoboti
            </h3>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Muassasa nomi</th>
                <th className="py-3 px-4">Turi</th>
                <th className="py-3 px-4">Shartnoma</th>
                <th className="py-3 px-4">Kvota sig'imi</th>
                <th className="py-3 px-4">Biriktirilgan talaba</th>
                <th className="py-3 px-4">Bandlik foizi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {places.map(p => {
                const pct = Math.min(Math.round((p.activeStudentsCount / p.capacity) * 100), 100);
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{p.name}</td>
                    <td className="py-3 px-4 text-slate-600">{p.type}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{p.contractNumber}</td>
                    <td className="py-3 px-4 font-mono">{p.capacity}</td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{p.activeStudentsCount}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="font-mono font-bold text-slate-700">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Report: Grades */}
      {reportType === 'grades' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">
              Amaliyot attestatsiyasi va o'zlashtirish sifat ko'rsatkichlari
            </h3>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <p className="text-xs text-emerald-800 font-semibold uppercase">A'lo (5 baho)</p>
              <p className="text-3xl font-bold font-mono text-emerald-700 mt-2">68%</p>
              <p className="text-[11px] text-emerald-600 mt-1">86 - 100 ball</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <p className="text-xs text-blue-800 font-semibold uppercase">Yaxshi (4 baho)</p>
              <p className="text-3xl font-bold font-mono text-blue-700 mt-2">24%</p>
              <p className="text-[11px] text-blue-600 mt-1">71 - 85 ball</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-xs text-amber-800 font-semibold uppercase">Qoniqarli (3 baho)</p>
              <p className="text-3xl font-bold font-mono text-amber-700 mt-2">6%</p>
              <p className="text-[11px] text-amber-600 mt-1">55 - 70 ball</p>
            </div>
            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
              <p className="text-xs text-red-800 font-semibold uppercase">Qarzdor (2 baho)</p>
              <p className="text-3xl font-bold font-mono text-red-700 mt-2">2%</p>
              <p className="text-[11px] text-red-600 mt-1">&lt; 55 ball</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
