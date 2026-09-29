import React, { useState } from 'react';
import {
  CalendarRange,
  Building2,
  Users,
  GraduationCap,
  Hospital,
  FileText,
  Printer,
  Edit2,
  CheckCircle,
  Pause,
  Play,
  Archive,
  AlertTriangle,
  Clock,
  Layers,
  ChevronRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import {
  Practice,
  PracticeAssignment,
  PracticeStatus,
  Student,
  PracticePlace,
  Supervisor,
  ClinicResponsible
} from '../../../types';
import { storageService } from '../../../services/storageService';
import { Modal } from '../../common/Modal';
import { StatusBadge, StatusVariant } from '../../common/Badge';

interface PracticeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  practice: Practice | null;
  onEdit: (practice: Practice) => void;
  onStatusChange: (id: string, status: PracticeStatus) => void;
  onOpenAllocation?: () => void;
}

export function PracticeDetailModal({
  isOpen,
  onClose,
  practice,
  onEdit,
  onStatusChange,
  onOpenAllocation
}: PracticeDetailModalProps) {
  if (!practice) return null;

  const [activeTab, setActiveTab] = useState<'students' | 'places' | 'supervisors' | 'order'>('students');

  const faculties = storageService.getFaculties();
  const directions = storageService.getDirections();
  const groups = storageService.getGroups();
  const allPlaces = storageService.getPracticePlaces();
  const allSupervisors = storageService.getSupervisors();
  const allClinicResponsibles = storageService.getClinicResponsibles();
  const allStudents = storageService.getStudents();
  const allAssignments = storageService.getAssignments();

  const faculty = faculties.find(f => f.id === practice.facultyId);
  const direction = directions.find(d => d.id === practice.directionId);
  const practiceGroups = groups.filter(g => practice.groupIds.includes(g.id));
  const practicePlaces = allPlaces.filter(p => practice.practicePlaceIds.includes(p.id));
  const practiceSupervisors = allSupervisors.filter(s => practice.supervisorIds.includes(s.id));
  const practiceClinicResponsibles = allClinicResponsibles.filter(c => practice.clinicResponsibleIds.includes(c.id));

  // Assignments for this practice
  const practiceAssignments = allAssignments.filter(a => a.practiceId === practice.id);

  // Status badges
  const normStatus = practice.status.toUpperCase();
  const statusVariant: StatusVariant =
    normStatus === 'ACTIVE' ? 'success' :
    normStatus === 'DRAFT' ? 'info' :
    normStatus === 'PAUSED' ? 'warning' :
    normStatus === 'COMPLETED' ? 'purple' : 'neutral';

  const statusLabel =
    normStatus === 'ACTIVE' ? 'Faol amaliyot' :
    normStatus === 'DRAFT' ? 'Loyiha / Reja' :
    normStatus === 'PAUSED' ? 'To\'xtatilgan' :
    normStatus === 'COMPLETED' ? 'Yakunlangan' : 'Arxivlangan';

  const isLocked = normStatus === 'COMPLETED' || normStatus === 'ARCHIVED';

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={practice.name}
      subtitle={`Kodi: ${practice.code} · ${faculty?.name || ''} (${practice.courseLevel}-kurs)`}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Top Header Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded border border-blue-200">
                {practice.code}
              </span>
              <StatusBadge label={statusLabel} variant={statusVariant} />
              <span className="text-xs text-slate-500 font-medium">
                {practice.academicYear} o'quv yili
              </span>
            </div>

            <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2 pt-1">
              <span>{faculty?.name}</span>
              <span>·</span>
              <span>{direction?.name}</span>
              <span>·</span>
              <span>{practice.type}</span>
            </div>

            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 pt-0.5">
              <span className="font-mono tabular-nums">{practice.startDate} dan {practice.endDate} gacha</span>
              <span>·</span>
              <span>{practice.totalHours} soat ({practice.credits} kredit)</span>
              <span>·</span>
              <span className="font-mono text-slate-700 font-medium">{practice.orderNumber} ({practice.orderDate})</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {normStatus !== 'ACTIVE' && normStatus !== 'ARCHIVED' && (
              <button
                type="button"
                onClick={() => onStatusChange(practice.id, 'ACTIVE')}
                className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 flex items-center gap-1 transition-colors cursor-pointer"
                title="Amaliyotni faollashtirish"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Faollashtirish</span>
              </button>
            )}

            {normStatus === 'ACTIVE' && (
              <button
                type="button"
                onClick={() => onStatusChange(practice.id, 'PAUSED')}
                className="px-2.5 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 flex items-center gap-1 transition-colors cursor-pointer"
                title="Vaqtincha to'xtatish"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>To'xtatish</span>
              </button>
            )}

            {normStatus !== 'COMPLETED' && normStatus !== 'ARCHIVED' && (
              <button
                type="button"
                onClick={() => onStatusChange(practice.id, 'COMPLETED')}
                className="px-2.5 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 flex items-center gap-1 transition-colors cursor-pointer"
                title="Amaliyotni yakunlash"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Yakunlash</span>
              </button>
            )}

            {normStatus === 'COMPLETED' && (
              <button
                type="button"
                onClick={() => onStatusChange(practice.id, 'ARCHIVED')}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
                title="Amaliyotni arxivlash"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Arxivlash</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
              title="Chop etish"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Chop etish</span>
            </button>

            {!isLocked ? (
              <button
                type="button"
                onClick={() => onEdit(practice)}
                className="px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                title="Tahrirlash"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Tahrirlash</span>
              </button>
            ) : (
              <div className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 bg-slate-100 rounded-lg border border-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Tahrirlash yopilgan</span>
              </div>
            )}
          </div>
        </div>

        {/* Locked warning banner if completed or archived */}
        {isLocked && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Ushbu amaliyot <strong>{statusLabel.toLowerCase()}</strong> holatida bo'lganligi sababli ma'lumotlar faqat ko'rish rejimida ochilgan.
            </span>
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
          {[
            { id: 'students', label: `Taqsimlangan talabalar (${practiceAssignments.length})` },
            { id: 'places', label: `Amaliyot bazalari (${practicePlaces.length})` },
            { id: 'supervisors', label: `Rahbarlar (${practiceSupervisors.length + practiceClinicResponsibles.length})` },
            { id: 'order', label: 'Buyruq & Ma\'lumotlar' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: STUDENTS ASSIGNMENTS */}
        {activeTab === 'students' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Amaliyotga biriktirilgan talabalar va ularning klinik bazalari
              </span>
              {onOpenAllocation && (
                <button
                  type="button"
                  onClick={onOpenAllocation}
                  className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Taqsimlash modulida ochish</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {practiceAssignments.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
                Ushbu amaliyotga hozircha talabalar taqsimlanmagan.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {practiceAssignments.map((asg, idx) => {
                    const student = allStudents.find(s => s.id === asg.studentId);
                    const place = allPlaces.find(p => p.id === asg.practicePlaceId);
                    const sup = allSupervisors.find(s => s.id === asg.supervisorId);
                    const clinicResp = allClinicResponsibles.find(c => c.id === asg.clinicResponsibleId);
                    const grp = groups.find(g => g.id === student?.groupId);

                    return (
                      <div key={asg.id} className="p-3 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-mono flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {student?.fullName || asg.studentId}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                              <span>{student?.studentId}</span>
                              <span>·</span>
                              <span>{grp?.name}</span>
                              <span>·</span>
                              <span>{student?.phone}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-slate-600 sm:text-right">
                          <div>
                            <div className="font-medium text-slate-800">{place?.name || 'Baza belgilanmagan'}</div>
                            <div className="text-[11px] text-slate-500">{asg.department} bo'limi</div>
                          </div>

                          <div className="border-l border-slate-200 pl-3">
                            <div className="text-[11px] text-slate-700">Rahbar: {sup?.fullName?.split(' ')[0] || '—'}</div>
                            <div className="text-[10px] text-slate-400">Mas'ul: {clinicResp?.fullName?.split(' ')[0] || '—'}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PLACES & CAPACITY */}
        {activeTab === 'places' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {practicePlaces.map(place => {
                const assignedToThis = practiceAssignments.filter(a => a.practicePlaceId === place.id).length;
                return (
                  <div key={place.id} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{place.name}</h4>
                      <StatusBadge label={place.type} variant="info" />
                    </div>
                    <p className="text-[11px] text-slate-500">{place.address}, {place.city}</p>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <span>Ushbu amaliyotdan biriktirilgan:</span>
                      <strong className="font-mono text-blue-700 font-bold">{assignedToThis} nafar talaba</strong>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                      <span>Umumiy baza sig'imi: {place.capacity}</span>
                      <span>Aloqa: {place.contactPhone}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: SUPERVISORS */}
        {activeTab === 'supervisors' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900">Universitet amaliyot rahbarlari</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {practiceSupervisors.map(sup => (
                <div key={sup.id} className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-slate-900">{sup.fullName}</div>
                  <div className="text-slate-500">{sup.department} · {sup.academicDegree}</div>
                  <div className="text-slate-600 pt-1 flex items-center justify-between">
                    <span>Telefon: <strong className="font-mono">{sup.phone}</strong></span>
                    <span>Biriktirilgan: <strong className="text-blue-700">{sup.assignedStudentsCount} talaba</strong></span>
                  </div>
                </div>
              ))}
            </div>

            <h4 className="text-xs font-bold text-slate-900 pt-2">Klinik bazalardagi mas'ullar</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {practiceClinicResponsibles.map(cresp => {
                const place = allPlaces.find(p => p.id === cresp.practicePlaceId);
                return (
                  <div key={cresp.id} className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1">
                    <div className="font-bold text-slate-900">{cresp.fullName}</div>
                    <div className="text-slate-500">{cresp.position}</div>
                    <div className="text-slate-600 pt-1 flex items-center justify-between">
                      <span className="truncate max-w-[200px]">{place?.name}</span>
                      <span className="font-mono text-slate-500">{cresp.phone}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: ORDER & DETAILS */}
        {activeTab === 'order' && (
          <div className="space-y-3 bg-white border border-slate-200 rounded-xl p-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-500 block">Buyruq raqami:</span>
                <span className="font-mono font-bold text-slate-900">{practice.orderNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Buyruq sanasi:</span>
                <span className="font-mono font-bold text-slate-900">{practice.orderDate}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Yuklama soati:</span>
                <span className="font-bold text-slate-900">{practice.totalHours} akademik soat</span>
              </div>
              <div>
                <span className="text-slate-500 block">Kredit miqdori:</span>
                <span className="font-bold text-slate-900">{practice.credits} ECTS</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <span className="text-slate-500 block mb-1">Amaliyot tavsifi va dasturi:</span>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {practice.description || 'Amaliyot dasturi rektorat buyrug\'iga asosan tasdiqlangan va klinik kafedralar tomonidan monitoring qilinadi.'}
              </p>
            </div>
          </div>
        )}

        {/* Modal footer close */}
        <div className="pt-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Yopish
          </button>
        </div>
      </div>
    </Modal>
  );
}
