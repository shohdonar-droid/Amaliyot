import React from 'react';
import {
  X,
  Printer,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Building,
  QrCode
} from 'lucide-react';
import { Practice, Student, Assessment, AttestationCommission } from '../../../types';
import { storageService } from '../../../services/storageService';
import { useToast } from '../../../context/ToastContext';

interface OfficialVedomostPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  practiceId: string;
  selectedGroupId?: string;
}

export const OfficialVedomostPrintModal: React.FC<OfficialVedomostPrintModalProps> = ({
  isOpen,
  onClose,
  practiceId,
  selectedGroupId
}) => {
  const { showToast } = useToast();

  if (!isOpen) return null;

  const practices = storageService.getPractices();
  const practice = practices.find(p => p.id === practiceId) || practices[0];
  const allStudents = storageService.getStudents();
  const assignments = storageService.getPracticeAssignments();
  const faculties = storageService.getFaculties();
  const faculty = faculties.find(f => f.id === practice?.facultyId) || faculties[0];
  const groups = storageService.getGroups();
  const commissions = storageService.getAttestationCommissions();
  const commission = commissions.find(c => c.facultyId === faculty?.id) || commissions[0];
  const settings = storageService.getAssessmentSettings();

  // Filter students for this practice and optional group
  const students = allStudents.filter(s => {
    const hasAsg = assignments.some(a => a.studentId === s.id && a.practiceId === practice?.id);
    const inPracticeGroups = practice ? practice.groupIds.includes(s.groupId) : true;
    const matchesGroup = selectedGroupId ? s.groupId === selectedGroupId : true;
    return (hasAsg || inPracticeGroups) && matchesGroup;
  });

  const assessments = storageService.getAssessments({ practiceId: practice?.id });

  // Map student rows with computed or existing assessment
  const studentRows = students.map((std, idx) => {
    let ass = assessments.find(a => a.studentId === std.id);
    if (!ass) {
      ass = storageService.calculateStudentAssessment(std.id, practice?.id);
    }
    const total = ass.totalScore;
    const grade = ass.grade;
    const gradeWord = 
      grade === '5' ? "A'lo" :
      grade === '4' ? "Yaxshi" :
      grade === '3' ? "Qoniqarli" : "Qoniqarsiz";

    return {
      number: idx + 1,
      student: std,
      assessment: ass,
      attendanceScore: ass.attendanceScore,
      journalScore: ass.journalScore,
      skillsScore: ass.skillsScore,
      finalExamScore: ass.finalExamScore,
      totalScore: total,
      grade,
      gradeWord,
      status: ass.status
    };
  });

  // Calculate Summary Statistics
  const totalCount = studentRows.length;
  const grade5Count = studentRows.filter(r => r.grade === '5').length;
  const grade4Count = studentRows.filter(r => r.grade === '4').length;
  const grade3Count = studentRows.filter(r => r.grade === '3').length;
  const grade2Count = studentRows.filter(r => r.grade === '2').length;

  const passedCount = grade5Count + grade4Count + grade3Count;
  const masteryPct = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;
  const qualityPct = totalCount > 0 ? Math.round(((grade5Count + grade4Count) / totalCount) * 100) : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      '№',
      'Talaba F.I.Sh.',
      'Talaba ID',
      'Guruh',
      `Davomat (${settings.attendanceMaxScore})`,
      `Kundalik (${settings.journalMaxScore})`,
      `Ko'nikmalar (${settings.skillsMaxScore})`,
      `Imtihon (${settings.finalExamMaxScore})`,
      'Jami (100)',
      'Baho (Raqam)',
      'Baho (So\'z)',
      'Holat'
    ];

    const rows = studentRows.map(r => [
      r.number,
      `"${r.student.fullName}"`,
      r.student.studentId,
      r.student.group,
      r.attendanceScore,
      r.journalScore,
      r.skillsScore,
      r.finalExamScore,
      r.totalScore,
      r.grade,
      `"${r.gradeWord}"`,
      r.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attestatsiya_Vedomosti_${practice?.code || 'amaliyot'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', 'Eksport qilindi', 'Attestatsiya vedomosti CSV formatida yuklab olindi.');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Controls Bar */}
        <div className="bg-slate-900 px-6 py-3.5 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">Amaliyot yakuniy attestatsiya vedomosti (Rasmiy shakl)</span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
              {practice?.code}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel (CSV)</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Chop etish (Print / PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 bg-white text-slate-900 font-sans print:p-0 print:overflow-visible">
          
          {/* Header */}
          <div className="text-center space-y-1 pb-4 border-b-2 border-slate-900">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              O'ZBEKISTON RESPUBLIKASI SOG'LIQNI SAQLASH VAZIRLIGI
            </p>
            <h2 className="text-sm sm:text-base font-extrabold uppercase text-slate-900 tracking-wide">
              TOSHKENT TIBBIYOT AKADEMIYASI
            </h2>
            <div className="pt-2">
              <span className="inline-block px-4 py-1 bg-slate-100 text-slate-900 text-xs sm:text-sm font-extrabold uppercase tracking-wider border border-slate-300 rounded">
                AMALIYOT YAKUNIY ATTESTATSIYA VEDOMOSTI (QAYD VARAQASI)
              </span>
            </div>
          </div>

          {/* Practice & Academic Metadata Grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-xs py-4 border-b border-slate-300">
            <div>
              <span className="text-slate-500">Fakultet: </span>
              <strong className="text-slate-900">{faculty?.name || '1-son Davolash fakulteti'}</strong>
            </div>
            <div>
              <span className="text-slate-500">O'quv yili: </span>
              <strong className="text-slate-900">{practice?.academicYear || '2026-2027'}</strong>
            </div>
            <div>
              <span className="text-slate-500">Amaliyot turi: </span>
              <strong className="text-slate-900">{practice?.name} ({practice?.code})</strong>
            </div>
            <div>
              <span className="text-slate-500">Amaliyot muddati: </span>
              <strong className="text-slate-900">{practice?.startDate} dan {practice?.endDate} gacha</strong>
            </div>
            <div>
              <span className="text-slate-500">Guruh(lar): </span>
              <strong className="text-slate-900">
                {selectedGroupId ? groups.find(g => g.id === selectedGroupId)?.name : practice?.groupIds.join(', ')}
              </strong>
            </div>
            <div>
              <span className="text-slate-500">Attestatsiya sanasi: </span>
              <strong className="text-slate-900">{new Date().toISOString().split('T')[0]}</strong>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500">Attestatsiya komissiyasi: </span>
              <strong className="text-slate-900">
                {commission?.name || 'Gospital terapiya yakuniy attestatsiya komissiyasi'} (Raisi: {commission?.chairpersonName})
              </strong>
            </div>
          </div>

          {/* Table */}
          <div className="pt-4 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead className="bg-slate-100 text-slate-800 text-[10px] font-bold uppercase tracking-wider border-b border-slate-300">
                <tr>
                  <th className="border border-slate-300 p-2 text-center w-8">№</th>
                  <th className="border border-slate-300 p-2">Talaba F.I.Sh.</th>
                  <th className="border border-slate-300 p-2 text-center">Talaba ID</th>
                  <th className="border border-slate-300 p-2 text-center">Guruh</th>
                  <th className="border border-slate-300 p-2 text-center">Davomat<br/>({settings.attendanceMaxScore})</th>
                  <th className="border border-slate-300 p-2 text-center">Kundalik<br/>({settings.journalMaxScore})</th>
                  <th className="border border-slate-300 p-2 text-center">Ko'nikma<br/>({settings.skillsMaxScore})</th>
                  <th className="border border-slate-300 p-2 text-center">Imtihon<br/>({settings.finalExamMaxScore})</th>
                  <th className="border border-slate-300 p-2 text-center bg-slate-200">Jami<br/>(100)</th>
                  <th className="border border-slate-300 p-2 text-center">Baho (Raqam)</th>
                  <th className="border border-slate-300 p-2 text-center">Baho (So'z bilan)</th>
                  <th className="border border-slate-300 p-2 text-center w-20">Komissiya imzosi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800 text-xs">
                {studentRows.map(row => (
                  <tr key={row.student.id} className="hover:bg-slate-50">
                    <td className="border border-slate-300 p-2 text-center font-mono">{row.number}</td>
                    <td className="border border-slate-300 p-2 font-medium">{row.student.fullName}</td>
                    <td className="border border-slate-300 p-2 text-center font-mono text-[11px] text-slate-600">{row.student.studentId}</td>
                    <td className="border border-slate-300 p-2 text-center font-mono">{row.student.group}</td>
                    <td className="border border-slate-300 p-2 text-center font-mono">{row.attendanceScore}</td>
                    <td className="border border-slate-300 p-2 text-center font-mono">{row.journalScore}</td>
                    <td className="border border-slate-300 p-2 text-center font-mono">{row.skillsScore}</td>
                    <td className="border border-slate-300 p-2 text-center font-mono">{row.finalExamScore}</td>
                    <td className="border border-slate-300 p-2 text-center font-mono font-bold bg-slate-50 text-blue-900">{row.totalScore}</td>
                    <td className="border border-slate-300 p-2 text-center font-bold">
                      <span className={`px-2 py-0.5 rounded font-mono ${
                        row.grade === '5' ? 'text-emerald-700 bg-emerald-50' :
                        row.grade === '4' ? 'text-blue-700 bg-blue-50' :
                        row.grade === '3' ? 'text-amber-700 bg-amber-50' : 'text-rose-700 bg-rose-50'
                      }`}>
                        {row.grade}
                      </span>
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-medium">{row.gradeWord}</td>
                    <td className="border border-slate-300 p-2 text-center text-[10px] text-slate-400 italic">
                      {row.status === 'APPROVED' ? '✓ Elektron tasdiq' : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary KPI Block */}
          <div className="mt-6 p-4 rounded-xl border border-slate-300 bg-slate-50/70 text-xs">
            <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2">
              Attestatsiya natijalari xulosasi:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700">
              <div>
                <span>Jami talabalar: </span>
                <strong className="font-mono text-slate-900">{totalCount} nafar</strong>
              </div>
              <div>
                <span>"A'lo" (5) baho: </span>
                <strong className="font-mono text-emerald-700">{grade5Count} nafar ({totalCount > 0 ? Math.round((grade5Count/totalCount)*100) : 0}%)</strong>
              </div>
              <div>
                <span>"Yaxshi" (4) baho: </span>
                <strong className="font-mono text-blue-700">{grade4Count} nafar ({totalCount > 0 ? Math.round((grade4Count/totalCount)*100) : 0}%)</strong>
              </div>
              <div>
                <span>"Qoniqarli" (3) baho: </span>
                <strong className="font-mono text-amber-700">{grade3Count} nafar ({totalCount > 0 ? Math.round((grade3Count/totalCount)*100) : 0}%)</strong>
              </div>
              <div>
                <span>"Qoniqarsiz" (2) baho: </span>
                <strong className="font-mono text-rose-700">{grade2Count} nafar ({totalCount > 0 ? Math.round((grade2Count/totalCount)*100) : 0}%)</strong>
              </div>
              <div>
                <span>Umumiy o'zlashtirish: </span>
                <strong className="font-mono text-emerald-700">{masteryPct}%</strong>
              </div>
              <div className="col-span-2">
                <span>Sifat ko'rsatkichi (4 va 5): </span>
                <strong className="font-mono text-blue-700">{qualityPct}%</strong>
              </div>
            </div>
          </div>

          {/* Signatures & Verification Seal */}
          <div className="mt-8 pt-6 border-t-2 border-slate-300 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-slate-800">
            <div>
              <p className="font-bold">Attestatsiya komissiyasi raisi:</p>
              <div className="h-10 border-b border-dashed border-slate-400 mt-2 flex items-end pb-1">
                <span className="text-[11px] font-medium text-slate-600">
                  {commission?.chairpersonName || 'Prof. Sobirov A.T.'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">imzo va F.I.Sh.</p>
            </div>

            <div>
              <p className="font-bold">Kafedra mudiri / Amaliyot rahbari:</p>
              <div className="h-10 border-b border-dashed border-slate-400 mt-2 flex items-end pb-1">
                <span className="text-[11px] font-medium text-slate-600">
                  {commission?.memberNames?.[0] || 'Dots. Rahmonova N.A.'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">imzo va F.I.Sh.</p>
            </div>

            <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center">
              <div className="w-12 h-12 rounded-lg bg-white border border-slate-300 flex items-center justify-center shadow-2xs">
                <QrCode className="w-8 h-8 text-slate-800" />
              </div>
              <span className="text-[9px] font-mono text-slate-500 mt-1">E-HUKUMAT VERIFIED</span>
              <span className="text-[8px] text-slate-400 font-mono">TMA-ATT-{practice?.code}-{Date.now().toString().slice(-6)}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
