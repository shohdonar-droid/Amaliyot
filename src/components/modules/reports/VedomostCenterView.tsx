import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  Archive,
  QrCode,
  ShieldCheck,
  Search,
  Filter,
  Eye,
  FileCheck,
  Building,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';
import { storageService } from '../../../services/storageService';
import { OfficialVedomost, VedomostStatus } from '../../../types';
import { useToast } from '../../../context/ToastContext';
import { exportToExcel } from '../../../utils/reportGenerators';
import { OfficialVedomostPrintModal } from '../assessments/OfficialVedomostPrintModal';
import { QRVerificationModal } from './QRVerificationModal';

export const VedomostCenterView: React.FC<{ practiceId?: string }> = ({
  practiceId
}) => {
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedVedomostForPrint, setSelectedVedomostForPrint] = useState<OfficialVedomost | null>(null);
  const [qrCodeToVerify, setQrCodeToVerify] = useState<string | null>(null);

  // New vedomost form states
  const practices = storageService.getPractices();
  const groups = storageService.getGroups();
  const faculties = storageService.getFaculties();
  const commissions = storageService.getAttestationCommissions();

  const [selectedPracticeId, setSelectedPracticeId] = useState(practiceId || practices[0]?.id || 'prac-1');
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || 'grp-1');
  const [selectedFacultyId, setSelectedFacultyId] = useState(faculties[0]?.id || 'fac-1');
  const [selectedCommissionId, setSelectedCommissionId] = useState(commissions[0]?.id || 'com-1');

  const vedomosts = storageService.getVedomosts({ practiceId });

  const filteredVedomosts = vedomosts.filter(v => {
    if (statusFilter !== 'ALL' && v.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = v.vedomostNumber.toLowerCase().includes(q);
      const matchTitle = v.title.toLowerCase().includes(q);
      const matchGroup = (v.groupName || '').toLowerCase().includes(q);
      if (!matchNum && !matchTitle && !matchGroup) return false;
    }
    return true;
  });

  const handleCreateVedomost = (e: React.FormEvent) => {
    e.preventDefault();
    const created = storageService.createVedomost({
      practiceId: selectedPracticeId,
      facultyId: selectedFacultyId,
      groupId: selectedGroupId,
      commissionId: selectedCommissionId
    });
    showToast('success', 'Vedomost shakllantirildi', `№ ${created.vedomostNumber} vedomosti muvaffaqiyatli yaratildi.`);
    setIsCreateModalOpen(false);
  };

  const handleSign = (v: OfficialVedomost) => {
    const signer = 'Klinik rahbar: Prof. M. Aliyev';
    const res = storageService.signVedomost(v.id, signer);
    if (res.success) {
      showToast('success', 'Vedomost imzolandi', `${v.vedomostNumber} amaliyot rahbari tomonidan elektron imzolandi.`);
    } else {
      showToast('error', 'Xatolik', res.error || 'Imzolash amalga oshmadi.');
    }
  };

  const handleApprove = (v: OfficialVedomost) => {
    const approver = 'Dekan: Dots. B. Saidov';
    const res = storageService.approveVedomost(v.id, approver);
    if (res.success) {
      showToast('success', 'Dekan tomonidan tasdiqlandi', `${v.vedomostNumber} rasmiy tasdiqdan o'tdi.`);
    } else {
      showToast('error', 'Xatolik', res.error || 'Tasdiqlash amalga oshmadi.');
    }
  };

  const handleArchive = (v: OfficialVedomost) => {
    const res = storageService.archiveVedomost(v.id);
    if (res.success) {
      showToast('info', 'Arxivlandi', `${v.vedomostNumber} yakuniy arxiv fondiga joylandi.`);
    }
  };

  const handleExportExcel = (v: OfficialVedomost) => {
    const data = v.students.map((s, idx) => ({
      "№": idx + 1,
      "Talaba F.I.Sh.": s.fullName,
      "Talaba ID": s.studentCode,
      "Guruh": s.group,
      "Davomat (20 ball)": s.attendanceScore,
      "Kundalik (20 ball)": s.journalScore,
      "Ko'nikmalar (30 ball)": s.skillsScore,
      "Imtihon (30 ball)": s.finalExamScore,
      "Jami (100 ball)": s.totalScore,
      "Baho": s.grade,
      "Holat": s.status,
      "Imzo": s.signature || "Imzolangan"
    }));

    exportToExcel(data, `${v.vedomostNumber}_Amaliyot_Vedomosti`);
    showToast('success', 'Excel (.xlsx) yuklandi', `"${v.vedomostNumber}.xlsx" barcha ustunlari bilan yuklab olindi.`);
  };

  const getStatusBadge = (status: VedomostStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Tasdiqlangan
          </span>
        );
      case 'SIGNED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <FileCheck className="w-3 h-3 text-blue-600" />
            Imzolangan
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <Archive className="w-3 h-3 text-slate-500" />
            Arxivlangan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Shakllantirilgan
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Rasmiy Attestatsiya Vedomostlari Markazi</span>
          </h3>
          <p className="text-xs text-slate-500">
            O'zbekiston OTM standartidagi rasmiy vedomostlarni shakllantirish, imzolash, dekan tasdig'i va arxiv fondi
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi Vedomost Generatsiya Qilish</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-600">Status:</span>
          {['ALL', 'GENERATED', 'SIGNED', 'APPROVED', 'ARCHIVED'].map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'Barchasi' : st === 'GENERATED' ? 'Shakllangan' : st === 'SIGNED' ? 'Imzolangan' : st === 'APPROVED' ? 'Tasdiqlangan' : 'Arxiv'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Vedomost raqami yoki guruh..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Vedomosts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3 text-center">№</th>
                <th className="py-3 px-3">Vedomost Raqami</th>
                <th className="py-3 px-3">Amaliyot & Guruh</th>
                <th className="py-3 px-3">Fakultet & Komissiya</th>
                <th className="py-3 px-2 text-center">Talabalar</th>
                <th className="py-3 px-3 text-center">Baholar (5/4/3/2)</th>
                <th className="py-3 px-2 text-center">O‘zlashtirish %</th>
                <th className="py-3 px-2 text-center">Sifat %</th>
                <th className="py-3 px-3 text-center">Holat</th>
                <th className="py-3 px-3 text-center">QR Verifikatsiya</th>
                <th className="py-3 px-3 text-center">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredVedomosts.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    Vedomostlar topilmadi.
                  </td>
                </tr>
              ) : (
                filteredVedomosts.map((v, idx) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-center font-mono text-slate-500">
                      {idx + 1}
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-blue-700">
                      <div>{v.vedomostNumber}</div>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {v.issueDate}
                      </span>
                    </td>

                    <td className="py-3 px-3 max-w-[200px]">
                      <div className="font-bold text-slate-900 text-xs truncate" title={v.title}>
                        {v.title}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Guruh: <span className="font-semibold text-slate-700">{v.groupName}</span> • {v.practiceCode}
                      </div>
                    </td>

                    <td className="py-3 px-3 max-w-[180px]">
                      <div className="text-[11px] font-semibold text-slate-800 truncate">
                        {v.facultyName}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        Rais: {v.commissionChairperson || 'Komissiya'}
                      </div>
                    </td>

                    <td className="py-3 px-2 text-center font-bold font-mono text-slate-900">
                      {v.totalStudentsCount}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-[11px] font-mono">
                        <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold" title="5 (A'lo)">
                          {v.grade5Count}
                        </span>
                        <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold" title="4 (Yaxshi)">
                          {v.grade4Count}
                        </span>
                        <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold" title="3 (Qoniqarli)">
                          {v.grade3Count}
                        </span>
                        <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold" title="2 (Qoniqarsiz)">
                          {v.grade2Count}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-2 text-center font-mono font-bold text-blue-700">
                      {v.masteryPercentage}%
                    </td>

                    <td className="py-3 px-2 text-center font-mono font-bold text-emerald-700">
                      {v.qualityPercentage}%
                    </td>

                    <td className="py-3 px-3 text-center">
                      {getStatusBadge(v.status)}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => setQrCodeToVerify(v.verificationCode)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-mono transition-colors"
                        title="QR kod va haqiqiyligini tekshirish"
                      >
                        <QrCode className="w-3.5 h-3.5 text-blue-600" />
                        <span>{v.verificationCode}</span>
                      </button>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedVedomostForPrint(v)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chop etish / Rasmiy blanka"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleExportExcel(v)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Excel (.xlsx) yuklash"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                        </button>

                        {v.status === 'GENERATED' && (
                          <button
                            type="button"
                            onClick={() => handleSign(v)}
                            className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[11px] font-bold transition-colors"
                            title="Rahbar sifatida imzolash"
                          >
                            Imzolash
                          </button>
                        )}

                        {v.status === 'SIGNED' && (
                          <button
                            type="button"
                            onClick={() => handleApprove(v)}
                            className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-bold transition-colors"
                            title="Dekan tasdig'i"
                          >
                            Dekan tasdig'i
                          </button>
                        )}

                        {v.status === 'APPROVED' && (
                          <button
                            type="button"
                            onClick={() => handleArchive(v)}
                            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Arxivlash"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generation Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
              <h4 className="text-base font-bold">Yangi Rasmiy Vedomost Generatsiya Qilish</h4>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVedomost} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amaliyot turi
                </label>
                <select
                  value={selectedPracticeId}
                  onChange={e => setSelectedPracticeId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  {practices.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.academicYear})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Akademik Guruh
                </label>
                <select
                  value={selectedGroupId}
                  onChange={e => setSelectedGroupId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fakultet
                </label>
                <select
                  value={selectedFacultyId}
                  onChange={e => setSelectedFacultyId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  {faculties.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Attestatsiya Komissiyasi
                </label>
                <select
                  value={selectedCommissionId}
                  onChange={e => setSelectedCommissionId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  {commissions.map(c => (
                    <option key={c.id} value={c.id}>{c.name} (Rais: {c.chairpersonName})</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-blue-800 leading-relaxed">
                Tizim tanlangan guruhdagi barcha talabalarning davomat, kundalik, amaliy ko'nikmalar va imtihon ballarini avtomatik jamlab, o'zlashtirish va sifat ko'rsatkichlarini hisoblaydi.
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs"
                >
                  Vedomostni Shakllantirish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Print Modal (Reused from Stage 7) */}
      {selectedVedomostForPrint && (
        <OfficialVedomostPrintModal
          isOpen={Boolean(selectedVedomostForPrint)}
          onClose={() => setSelectedVedomostForPrint(null)}
          practiceId={selectedVedomostForPrint.practiceId}
          selectedGroupId={selectedVedomostForPrint.groupId}
        />
      )}

      {/* QR Verification Modal */}
      {qrCodeToVerify && (
        <QRVerificationModal
          isOpen={Boolean(qrCodeToVerify)}
          onClose={() => setQrCodeToVerify(null)}
          initialCode={qrCodeToVerify}
        />
      )}
    </div>
  );
};
