import React from 'react';
import {
  UserCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Bell,
  Stethoscope,
  BookOpen
} from 'lucide-react';
import { storageService } from '../../../services/storageService';
import { useToast } from '../../../context/ToastContext';

export const SupervisorMonitoringView: React.FC<{ practiceId?: string }> = ({
  practiceId
}) => {
  const { showToast } = useToast();
  const supervisors = storageService.getSupervisorReports(practiceId);

  const handleNotifySupervisor = (sup: any) => {
    storageService.addNotification({
      title: 'Tekshirish kutilayotgan talaba vazifalari',
      message: `${sup.fullName}, sizda ${sup.needsActionCount} ta kundalik va ko'nikma tasdig'i kutilmoqda.`,
      type: 'warning'
    });
    showToast('info', 'Eslatma jo‘natildi', `${sup.fullName} ga tekshirish eslatmasi yuborildi.`);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Amaliyot Rahbarlari (Supervisorlar) Faoliyati Monitoringi
            </h3>
            <p className="text-xs text-slate-500">
              Rahbarlarning talabalar kundaliklarini tekshirish, ko'nikmalarni tasdiqlash va attestatsiyadagi faolligi
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3 text-center">№</th>
                <th className="py-3 px-4">Rahbar F.I.Sh.</th>
                <th className="py-3 px-3">Klinik Baza / Bo'lim</th>
                <th className="py-3 px-2 text-center">Biriktirilgan Talabalar</th>
                <th className="py-3 px-2 text-center">Tasdiqlangan Kundalik</th>
                <th className="py-3 px-2 text-center">Qaytarilgan Kundalik</th>
                <th className="py-3 px-2 text-center">Kutilayotgan Kundalik</th>
                <th className="py-3 px-2 text-center">Ko'nikmalar Tasdig'i</th>
                <th className="py-3 px-2 text-center">Attestatsiyasi Yakunlangan</th>
                <th className="py-3 px-2 text-center">E'tibor Talab</th>
                <th className="py-3 px-3 text-center">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {supervisors.map((sup, idx) => (
                <tr key={sup.supervisorId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 text-center font-mono text-slate-500">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                        {sup.fullName.charAt(0)}
                      </div>
                      <span>{sup.fullName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-800 text-[11px]">
                      {sup.clinicName}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {sup.department}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center font-mono font-bold text-slate-900">
                    {sup.assignedStudentsCount} nafar
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-emerald-700 font-semibold">
                    {sup.approvedJournalsCount}
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-amber-700 font-semibold">
                    {sup.revisionJournalsCount}
                  </td>
                  <td className="py-3 px-2 text-center font-mono">
                    {sup.pendingJournalsCount > 0 ? (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-full text-[10px]">
                        {sup.pendingJournalsCount} ta
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-blue-700 font-semibold">
                    {sup.skillsReviewedCount} ta
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-emerald-700 font-bold">
                    {sup.attestationApprovedCount}
                  </td>
                  <td className="py-3 px-2 text-center font-mono">
                    {sup.needsActionCount > 0 ? (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded-full text-[10px] flex items-center justify-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        {sup.needsActionCount}
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-semibold text-[11px] flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Hammasi joyida
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleNotifySupervisor(sup)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-1 text-[11px] font-semibold"
                      title="Eslatma xabari jo'natish"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Eslatma</span>
                    </button>
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
