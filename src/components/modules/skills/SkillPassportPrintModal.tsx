import React, { useRef } from 'react';
import { Printer, Download, X, CheckCircle, FileSpreadsheet, Stethoscope } from 'lucide-react';
import { storageService } from '../../../services/storageService';
import { exportToExcel } from '../../../utils/reportGenerators';

interface SkillPassportPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  practiceId?: string;
}

export function SkillPassportPrintModal({
  isOpen,
  onClose,
  studentId,
  practiceId
}: SkillPassportPrintModalProps) {
  const printContentRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const passport = storageService.getStudentPassportSummary(studentId, practiceId);
  const student = passport.student;
  const assignment = passport.assignment;
  const practice = passport.practice;
  const practicePlace = passport.practicePlace;
  const supervisor = passport.supervisor;

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const data = passport.detailedSkills.map(s => ({
      '№': s.number,
      'Ko‘nikma nomi': s.skill.name,
      'Kategoriya': s.skill.category,
      'Minimal me‘yor': s.requiredCount,
      'Jami bajarilgan': s.performedCount,
      'Mustaqil': s.independentCount,
      'Rahbar nazoratida': s.supervisedCount,
      'Kuzatuv': s.observedCount,
      'Tasdiqlangan': s.approvedCount,
      'Progress (%)': s.progressPct,
      'Holat': s.status
    }));

    exportToExcel(data, `Amaliy_Konikmalar_Pasporti_${student?.studentId || 'talaba'}`);
  };

  const todayStr = new Date().toLocaleDateString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-300 my-4 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Rasmiy hujjat ko'rinishi (Print & Export)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
              title="Ko'nikmalar pasportini Excel (.xlsx) formatida yuklab olish"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Excel (.xlsx)</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Chop etish (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Sheet Body */}
        <div className="overflow-y-auto p-6 sm:p-8 bg-white font-sans text-slate-900 print:p-0 print:m-0" ref={printContentRef}>
          {/* Official Document Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4 mb-5">
            <p className="text-[10px] font-serif uppercase tracking-widest text-slate-600">
              O'ZBEKISTON RESPUBLIKASI SOG'LIQNI SAQLASH VAZIRLIGI
            </p>
            <p className="text-[10px] font-serif uppercase tracking-widest text-slate-600 mb-1">
              {storageService.getUniversityName().toUpperCase()} · AMALIYOT BO'LIMI
            </p>
            <h1 className="text-base sm:text-lg font-serif font-black uppercase text-slate-900 tracking-tight mt-1">
              TIBBIY AMALIYOT TALABASINING AMALIY KO'NIKMALAR PASPORTI VA JURNALI
            </h1>
            <p className="text-xs font-medium text-slate-700 mt-0.5">
              (SKILLS LOGBOOK & CLINICAL COMPETENCY RECORD)
            </p>
          </div>

          {/* Student & Practice Meta Grid */}
          <div className="bg-slate-50/80 border border-slate-300 rounded-lg p-3.5 mb-5 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Talaba F.I.Sh.:</span>
              <strong className="text-slate-900 block truncate">{student?.fullName || '—'}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Talaba ID:</span>
              <span className="font-mono text-slate-800 block">{student?.studentId}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Fakultet va guruh:</span>
              <span className="text-slate-800 block">4-kurs · {student?.groupId}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Amaliyot nomi:</span>
              <span className="font-medium text-slate-900 block truncate">{practice?.name || 'Klinik amaliyot'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Klinik baza (Shifoxona):</span>
              <span className="text-slate-800 block truncate">{practicePlace?.name || 'Klinik baza'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Bo'lim:</span>
              <span className="text-slate-800 block">{assignment?.department || 'Terapiya'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Mas'ul amaliyot rahbari:</span>
              <span className="font-semibold text-slate-900 block truncate">{supervisor?.fullName || 'Dr. Karimov'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Chop etilgan sana:</span>
              <span className="font-mono text-slate-700 block">{todayStr}</span>
            </div>
          </div>

          {/* Passport Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mb-5 text-center">
            <div className="p-2 border border-slate-200 rounded-lg bg-slate-50">
              <span className="text-[10px] text-slate-500 block">Jami ko'nikmalar</span>
              <span className="text-sm font-bold text-slate-900">{passport.totalSkills} ta</span>
            </div>
            <div className="p-2 border border-slate-200 rounded-lg bg-slate-50">
              <span className="text-[10px] text-slate-500 block">Me'yorga yetgan</span>
              <span className="text-sm font-bold text-emerald-700">{passport.completedSkills} ta</span>
            </div>
            <div className="p-2 border border-slate-200 rounded-lg bg-slate-50">
              <span className="text-[10px] text-slate-500 block">Mustaqil</span>
              <span className="text-sm font-bold text-blue-700">{passport.totalIndependentCount}</span>
            </div>
            <div className="p-2 border border-slate-200 rounded-lg bg-slate-50">
              <span className="text-[10px] text-slate-500 block">Nazorat ostida</span>
              <span className="text-sm font-bold text-indigo-700">{passport.totalSupervisedCount}</span>
            </div>
            <div className="p-2 border border-slate-200 rounded-lg bg-slate-50">
              <span className="text-[10px] text-slate-500 block">Kuzatuv</span>
              <span className="text-sm font-bold text-amber-700">{passport.totalObservedCount}</span>
            </div>
            <div className="p-2 border border-blue-200 rounded-lg bg-blue-50">
              <span className="text-[10px] text-blue-700 font-semibold block">Me'yor bajarilishi</span>
              <span className="text-sm font-black text-blue-900">{passport.minimalQuotaMetPct}%</span>
            </div>
          </div>

          {/* Table of Skills */}
          <div className="border border-slate-300 rounded-lg overflow-hidden mb-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-serif">
                  <th className="py-2 px-2 border-r border-slate-300 text-center w-8">№</th>
                  <th className="py-2 px-3 border-r border-slate-300">Klinik ko'nikma / Manipulyatsiya nomi</th>
                  <th className="py-2 px-2 border-r border-slate-300">Kategoriya</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-center w-14">Me'yor</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-center w-14 font-bold">Amalda</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-center w-12 text-[10px]">Mustaqil</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-center w-12 text-[10px]">Nazorat</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-center w-12 text-[10px]">Kuzatuv</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-center w-14 font-mono font-bold">Progress</th>
                  <th className="py-2 px-2 text-center w-20">Holati</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {passport.detailedSkills.map((item, idx) => (
                  <tr key={item.skill.id} className={idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}>
                    <td className="py-2 px-2 border-r border-slate-200 text-center font-mono text-slate-500">
                      {item.number}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-medium text-slate-900">
                      {item.skill.name}
                    </td>
                    <td className="py-2 px-2 border-r border-slate-200 text-[11px] text-slate-600">
                      {item.skill.category}
                    </td>
                    <td className="py-2 px-2 border-r border-slate-200 text-center font-mono text-slate-700">
                      {item.requiredCount}
                    </td>
                    <td className="py-2 px-2 border-r border-slate-200 text-center font-mono font-bold text-slate-900">
                      {item.performedCount}
                    </td>
                    <td className="py-2 px-2 border-r border-slate-200 text-center font-mono text-blue-700">
                      {item.independentCount}
                    </td>
                    <td className="py-2 px-2 border-r border-slate-200 text-center font-mono text-indigo-700">
                      {item.supervisedCount}
                    </td>
                    <td className="py-2 px-2 border-r border-slate-200 text-center font-mono text-amber-700">
                      {item.observedCount}
                    </td>
                    <td className="py-2 px-2 border-r border-slate-200 text-center font-mono font-bold">
                      <span className={item.progressPct >= 100 ? 'text-emerald-700' : 'text-slate-700'}>
                        {item.progressPct}%
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center font-semibold text-[10px]">
                      <span className={
                        item.status === 'BAJARILDI' ? 'text-emerald-700' :
                        item.status === 'JARAYONDA' ? 'text-blue-700' :
                        'text-slate-400'
                      }>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Official Sign-off and Stamp Area */}
          <div className="pt-4 border-t-2 border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block mb-1">
                Kafedra mudiri / Amaliyot rahbari:
              </span>
              <p className="font-bold text-slate-900">{supervisor?.fullName || 'Prof. Sobirov A.T.'}</p>
              <div className="mt-4 pt-1 border-b border-dashed border-slate-400 w-40 text-[10px] text-slate-400">
                (imzo)
              </div>
            </div>

            <div className="text-center flex flex-col items-center">
              <span className="text-[10px] text-slate-500 uppercase block mb-1">
                Tibbiyot muassasasi muhri:
              </span>
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-300 font-serif text-[10px] tracking-widest mt-1">
                M.O'.
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] text-slate-500 uppercase block mb-1">
                Talaba imzosi:
              </span>
              <p className="font-bold text-slate-900">{student?.fullName || 'Talaba'}</p>
              <div className="mt-4 pt-1 border-b border-dashed border-slate-400 w-40 sm:ml-auto text-[10px] text-slate-400">
                (imzo)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
