import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Clock,
  User,
  Database,
  Tag,
  RefreshCw
} from 'lucide-react';
import { storageService } from '../../../services/storageService';
import { AuditLog, AuditAction } from '../../../types';
import { StatusBadge } from '../../common/Badge';

export function AuditLogsModule() {
  const [logs, setLogs] = useState<AuditLog[]>(() => storageService.getAuditLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');

  const refreshList = () => {
    setLogs(storageService.getAuditLogs());
  };

  const actionLabels: Record<AuditAction, { label: string; variant: 'success' | 'info' | 'warning' | 'danger' | 'purple' | 'neutral' }> = {
    login: { label: 'Tizimga kirish', variant: 'success' },
    logout: { label: 'Tizimdan chiqish', variant: 'neutral' },
    studentCreated: { label: 'Yangi talaba kiritildi', variant: 'info' },
    studentUpdated: { label: 'Talaba yangilandi', variant: 'info' },
    studentDeleted: { label: 'Talaba o\'chirildi', variant: 'danger' },
    practiceCreated: { label: 'Amaliyot yaratildi', variant: 'purple' },
    practiceUpdated: { label: 'Amaliyot yangilandi', variant: 'purple' },
    practiceStatusChanged: { label: 'Amaliyot holati o\'zgardi', variant: 'warning' },
    assignmentCreated: { label: 'Talaba taqsimlandi', variant: 'success' },
    assignmentRemoved: { label: 'Taqsimot bekor qilindi', variant: 'warning' },
    attendanceCreated: { label: 'Davomat kiritildi', variant: 'info' },
    attendanceUpdated: { label: 'Davomat yangilandi', variant: 'info' },
    attendanceSessionCreated: { label: 'QR Sessiya ochildi', variant: 'purple' },
    attendanceSessionExpired: { label: 'QR Sessiya muddati tugadi', variant: 'warning' },
    attendanceCheckIn: { label: 'Mobil QR Check-In', variant: 'success' },
    attendanceCheckOut: { label: 'Mobil Check-Out', variant: 'neutral' },
    attendanceManualCreated: { label: 'Qo\'lda davomat kiritildi', variant: 'info' },
    attendanceManualUpdated: { label: 'Qo\'lda davomat tuzatildi', variant: 'warning' },
    attendanceExcused: { label: 'Uzrli sabab qayd etildi', variant: 'purple' },
    attendanceDeleted: { label: 'Davomat o\'chirildi', variant: 'danger' },
    journalSubmitted: { label: 'Kundalik topshirildi', variant: 'info' },
    journalReviewed: { label: 'Kundalik baholandi', variant: 'success' },
    journalUpdated: { label: 'Kundalik tahrirlandi', variant: 'info' },
    journalResubmitted: { label: 'Kundalik qayta topshirildi', variant: 'purple' },
    journalRevisionRequested: { label: 'Qayta ishlashga yuborildi', variant: 'warning' },
    gradeUpdated: { label: 'Baho qo\'yildi', variant: 'success' },
    documentCreated: { label: 'Hujjat kiritildi', variant: 'info' },
    documentDeleted: { label: 'Hujjat o\'chirildi', variant: 'danger' },
    skillCreated: { label: 'Yangi ko\'nikma yaratildi', variant: 'purple' },
    skillUpdated: { label: 'Ko\'nikma yangilandi', variant: 'info' },
    skillDeleted: { label: 'Ko\'nikma o\'chirildi', variant: 'danger' },
    skillRecordCreated: { label: 'Ko\'nikma qaydi yaratildi', variant: 'info' },
    skillRecordUpdated: { label: 'Ko\'nikma qaydi yangilandi', variant: 'info' },
    skillRecordSubmitted: { label: 'Ko\'nikma tekshiruvga topshirildi', variant: 'info' },
    skillRecordApproved: { label: 'Ko\'nikma rahbar tomonidan tasdiqlandi', variant: 'success' },
    skillRecordRevisionRequested: { label: 'Ko\'nikma qayta ishlashga qaytarildi', variant: 'warning' },
    studentSkillCompleted: { label: 'Ko\'nikma me\'yori to\'liq bajarildi', variant: 'success' },
    skillProgressUpdated: { label: 'Ko\'nikmalar progressi yangilandi', variant: 'info' },
    skillLogSubmitted: { label: 'Ko\'nikma topshirildi', variant: 'info' },
    skillLogApproved: { label: 'Ko\'nikma tasdiqlandi', variant: 'success' },
    skillLogRejected: { label: 'Ko\'nikma qaytarildi', variant: 'warning' },
    skillLogBatchApproved: { label: 'Ommaviy tasdiqlandi', variant: 'success' },
    skillCategoryCreated: { label: 'Yangi kategoriya ochildi', variant: 'purple' },
    assessmentCreated: { label: 'Attestatsiya qaydi yaratildi', variant: 'purple' },
    assessmentCalculated: { label: 'Attestatsiya ballari hisoblandi', variant: 'info' },
    examCreated: { label: 'Yakuniy imtihon belgilandi', variant: 'purple' },
    examScoreEntered: { label: 'Imtihon bahosi kiritildi', variant: 'success' },
    assessmentApproved: { label: 'Attestatsiya tasdiqlandi', variant: 'success' },
    assessmentRejected: { label: 'Attestatsiya bekor qilindi', variant: 'danger' },
    retakeRequested: { label: 'Qayta topshirish belgilandi', variant: 'warning' },
    retakeScheduled: { label: 'Qayta sinov rejalashtirildi', variant: 'warning' },
    finalResultPublished: { label: 'Yakuniy natija e\'lon qilindi', variant: 'success' },
    commissionCreated: { label: 'Attestatsiya komissiyasi tuzildi', variant: 'purple' },
    commissionUpdated: { label: 'Komissiya tarkibi yangilandi', variant: 'info' },
    assessmentSettingsUpdated: { label: 'Baholash mezonlari o\'zgartirildi', variant: 'warning' },
    finalReportGenerated: { label: 'Yakuniy hisobot shakllantirildi', variant: 'purple' },
    reportExported: { label: 'Hisobot eksport qilindi', variant: 'info' },
    reportPrinted: { label: 'Hisobot chop etildi', variant: 'info' },
    vedomostCreated: { label: 'Vedomost yaratildi', variant: 'purple' },
    vedomostUpdated: { label: 'Vedomost tahrirlandi', variant: 'info' },
    vedomostSigned: { label: 'Vedomost imzolandi', variant: 'success' },
    vedomostApproved: { label: 'Vedomost tasdiqlandi', variant: 'success' },
    vedomostArchived: { label: 'Vedomost arxivlandi', variant: 'neutral' },
    verificationGenerated: { label: 'QR tekshiruv kodi berildi', variant: 'info' },
    finalStatusCalculated: { label: 'Talaba holati aniqlandi', variant: 'info' },
    studentStatusSynced: { label: 'Barcha holatlar sinxronlandi', variant: 'success' },
    problemResolved: { label: 'Muammo hal qilindi', variant: 'success' },
    systemReset: { label: 'Tizim bazasi qayta tiklandi', variant: 'danger' }
  };

  const filteredLogs = logs.filter(log => {
    if (filterAction !== 'all' && log.action !== filterAction) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAction = log.action.toLowerCase().includes(q);
      const matchEntity = log.entity.toLowerCase().includes(q);
      const matchUserId = log.userId.toLowerCase().includes(q);
      const matchMeta = log.metadata?.toLowerCase().includes(q) || false;
      if (!matchAction && !matchEntity && !matchUserId && !matchMeta) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
            <span>Audit loglari va xavfsizlik nazorati</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Barcha muhim o'zgarishlar, autentifikatsiya va klinik ma'lumotlar tranzaksiyalari qaydnomasi (Immutable)
          </p>
        </div>

        <button
          type="button"
          onClick={refreshList}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Yangilash</span>
        </button>
      </div>

      {/* Filter and search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Amal, entity yoki foydalanuvchi..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-slate-500 shrink-0">Harakat turi:</label>
          <select
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
            className="px-3 py-1.5 text-xs border rounded-lg bg-white"
          >
            <option value="all">Barcha amallar</option>
            <option value="login">Tizimga kirish (login)</option>
            <option value="logout">Chiqish (logout)</option>
            <option value="studentCreated">Talaba kiritildi</option>
            <option value="studentUpdated">Talaba yangilandi</option>
            <option value="studentDeleted">Talaba o'chirildi</option>
            <option value="practiceCreated">Amaliyot yaratildi</option>
            <option value="assignmentCreated">Taqsimlash</option>
            <option value="attendanceCreated">Davomat</option>
            <option value="journalSubmitted">Kundalik</option>
            <option value="gradeUpdated">Baholash</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs text-slate-500">
          <span>Jami qaydlar: <strong className="font-mono font-bold text-slate-800">{filteredLogs.length}</strong></span>
          <span className="font-mono">Collection: /auditLogs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Vaqt (Timestamp)</th>
                <th className="py-3 px-4">Foydalanuvchi / Rol</th>
                <th className="py-3 px-4">Harakat (Action)</th>
                <th className="py-3 px-4">Obyekt (Entity)</th>
                <th className="py-3 px-4">Entity ID</th>
                <th className="py-3 px-4">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredLogs.map(log => {
                const actionMeta = actionLabels[log.action] || { label: log.action, variant: 'neutral' };

                return (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      <span className="font-semibold text-slate-800">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </span>{' '}
                      <span className="text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{log.userId}</div>
                      {log.userRole && (
                        <span className="text-[10px] text-blue-600 font-medium">{log.userRole}</span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-sans">
                      <StatusBadge label={actionMeta.label} variant={actionMeta.variant} />
                    </td>

                    <td className="py-3 px-4 text-slate-800 font-semibold">
                      /{log.entity}
                    </td>

                    <td className="py-3 px-4 text-slate-500 truncate max-w-[120px]">
                      {log.entityId}
                    </td>

                    <td className="py-3 px-4 text-slate-600 font-sans max-w-xs truncate">
                      {log.metadata || '—'}
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
