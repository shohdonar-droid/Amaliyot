import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Stethoscope,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldAlert,
  Upload,
  FileText,
  User
} from 'lucide-react';
import { Modal } from '../../common/Modal';
import { Skill, SkillParticipationType, Student, PracticeAssignment, Attendance } from '../../../types';
import { storageService } from '../../../services/storageService';
import { useToast } from '../../../context/ToastContext';

interface SkillLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedSkill?: Skill | null;
  studentId: string;
}

export function SkillLogModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedSkill,
  studentId
}: SkillLogModalProps) {
  const { showToast } = useToast();
  const allSkills = storageService.getSkills().filter(s => s.isActive);
  const students = storageService.getStudents();
  const currentStudent = students.find(s => s.id === studentId);
  const assignments = storageService.getAssignments().filter(a => a.studentId === studentId);
  const activeAssignment = assignments[0];
  const supervisors = storageService.getSupervisors();
  const assignedSupervisor = supervisors.find(s => s.id === activeAssignment?.supervisorId);
  const practicePlaces = storageService.getPracticePlaces();
  const assignedPlace = practicePlaces.find(p => p.id === activeAssignment?.practicePlaceId);

  // Form state
  const [selectedSkillId, setSelectedSkillId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [participationType, setParticipationType] = useState<SkillParticipationType>('INDEPENDENT');
  const [count, setCount] = useState<number>(1);
  const [patientAge, setPatientAge] = useState<string>('');
  const [patientGender, setPatientGender] = useState<'Erkak' | 'Ayol'>('Erkak');
  const [patientCondition, setPatientCondition] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  // Attendance check for selected date
  const [attendanceRecord, setAttendanceRecord] = useState<Attendance | undefined>(undefined);

  useEffect(() => {
    if (preselectedSkill) {
      setSelectedSkillId(preselectedSkill.id);
    } else if (allSkills.length > 0 && !selectedSkillId) {
      setSelectedSkillId(allSkills[0].id);
    }
  }, [preselectedSkill, allSkills]);

  useEffect(() => {
    if (activeAssignment && date) {
      const allAttendance = storageService.getAttendance();
      const att = allAttendance.find(
        a => a.studentId === studentId && a.practiceId === activeAssignment.practiceId && a.date === date
      );
      setAttendanceRecord(att);
    }
  }, [studentId, activeAssignment, date]);

  const selectedSkill = allSkills.find(s => s.id === selectedSkillId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!activeAssignment) {
      setFormError('Siz rasmiy amaliyotga biriktirilmagansiz. Ko\'nikma qayd etish mumkin emas.');
      return;
    }

    if (!selectedSkillId) {
      setFormError('Iltimos, bajarilgan klinik ko\'nikmani tanlang.');
      return;
    }

    const numericCount = Number(count);
    if (!numericCount || numericCount < 1) {
      setFormError('Bajarilish soni kamida 1 bo\'lishi shart.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (date > today) {
      setFormError('Kelajakdagi sana uchun ko\'nikma kiritish mumkin emas.');
      return;
    }

    if (!notes.trim() || notes.trim().length < 10) {
      setFormError('Bajargan ishingiz yoki manipulyatsiya jarayoni haqida qisqacha mazmunli izoh yozing (kamida 10 ta belgi).');
      return;
    }

    setSubmitting(true);

    try {
      const result = storageService.submitSkillLog({
        studentId,
        practiceId: activeAssignment.practiceId,
        skillId: selectedSkillId,
        date,
        participationType,
        count: numericCount,
        notes: notes.trim(),
        patientInfo: patientAge || patientCondition ? {
          age: patientAge ? Number(patientAge) : undefined,
          gender: patientGender,
          department: activeAssignment.department || 'Bo\'lim',
          clinicalCondition: patientCondition.trim() || undefined
        } : undefined,
        supervisorId: activeAssignment.supervisorId,
        supervisorName: assignedSupervisor?.fullName || 'Mas\'ul rahbar',
        attachmentName: attachmentName || undefined
      });

      if (!result.success) {
        setFormError(result.error || 'Ko\'nikmani saqlashda xatolik yuz berdi.');
        setSubmitting(false);
        return;
      }

      showToast(
        'success',
        'Ko\'nikma muvaffaqiyatli qayd etildi',
        `"${selectedSkill?.name}" bo'yicha ${numericCount} marta bajarish tekshiruvga topshirildi.`
      );

      // Reset form
      setNotes('');
      setCount(1);
      setPatientAge('');
      setPatientCondition('');
      setAttachmentName('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Xatolik yuz berdi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('error', 'Fayl hajmi juda katta', 'Maksimal ruxsat etilgan hajm 10MB.');
        return;
      }
      setAttachmentName(file.name);
      showToast('info', 'Fayl biriktirildi', file.name);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Amaliy ko'nikma bajarilishini qayd etish"
      subtitle="Klinik manipulyatsiyani pasportga kiritish va rahbar tekshiruviga yuborish"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {formError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {/* Practice & Supervisor Context Banner */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Talaba:</span>
            <span className="font-semibold text-slate-800 truncate block">
              {currentStudent?.fullName || 'Talaba'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Klinik baza & Bo'lim:</span>
            <span className="font-semibold text-slate-800 truncate block">
              {assignedPlace?.name || 'Klinik baza'} · {activeAssignment?.department || 'Bo\'lim'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Tasdiqlovchi rahbar:</span>
            <span className="font-semibold text-slate-800 truncate block text-blue-700">
              {assignedSupervisor?.fullName || 'Kafedra rahbari'}
            </span>
          </div>
        </div>

        {/* Skill Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
            Klinik ko'nikma / Manipulyatsiya *
          </label>
          <select
            value={selectedSkillId}
            onChange={e => setSelectedSkillId(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
            required
          >
            {allSkills.map(sk => (
              <option key={sk.id} value={sk.id}>
                [{sk.category}] {sk.name} (Me'yor: {sk.requiredCount} marta)
              </option>
            ))}
          </select>
          {selectedSkill && (
            <p className="text-[11px] text-slate-500 mt-1 italic">
              {selectedSkill.description}
            </p>
          )}
        </div>

        {/* Date and Count Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5 flex items-center justify-between">
              <span>Bajarilgan sana *</span>
              {attendanceRecord && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                  attendanceRecord.status.toUpperCase() === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  Davomat: {attendanceRecord.status}
                </span>
              )}
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={date}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => setDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Bajarish soni (marta) *
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={e => setCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 font-mono font-bold"
              required
            />
          </div>
        </div>

        {/* Participation Type (Bajarilish turi) */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-2">
            Ishtirok va bajarilish turi *
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              {
                id: 'OBSERVED',
                label: 'Kuzatuvchi',
                desc: 'Jarayonni kuzatgan holda o\'rganish'
              },
              {
                id: 'SUPERVISED',
                label: 'Rahbar nazoratida',
                desc: 'Shifokor yoki rahbar nazorati ostida'
              },
              {
                id: 'INDEPENDENT',
                label: 'Mustaqil',
                desc: 'Manipulyatsiyani to\'liq mustaqil bajarish'
              }
            ].map(type => (
              <label
                key={type.id}
                className={`relative flex flex-col p-3 rounded-lg border cursor-pointer transition-all ${
                  participationType === type.id
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="participationType"
                    value={type.id}
                    checked={participationType === type.id}
                    onChange={() => setParticipationType(type.id as SkillParticipationType)}
                    className="text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                  />
                  <span className="text-xs font-bold text-slate-900">{type.label}</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 leading-tight">
                  {type.desc}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Anonymized Patient Info (Medical Confidentiality Protected) */}
        <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              Bemor haqida qisqacha ma'lumot (Ixtiyoriy)
            </span>
            <span className="text-[10px] text-slate-400">
              Shaxsiy ma'lumotlar maxfiy saqlanadi
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-600 block mb-1">Bemor yoshi:</label>
              <input
                type="number"
                min={0}
                max={120}
                placeholder="Masalan: 54"
                value={patientAge}
                onChange={e => setPatientAge(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-600 block mb-1">Jinsi:</label>
              <select
                value={patientGender}
                onChange={e => setPatientGender(e.target.value as any)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="Erkak">Erkak</option>
                <option value="Ayol">Ayol</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-600 block mb-1">Klinik holat / Tashxis:</label>
              <input
                type="text"
                placeholder="Masalan: Gipertoniya II"
                value={patientCondition}
                onChange={e => setPatientCondition(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
              />
            </div>
          </div>
        </div>

        {/* Detailed Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
            Bajargan ishlaringiz va manipulyatsiya tavsifi *
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Manipulyatsiya qanday o'tkazildi, qanday asbob-uskunalardan foydalanildi, aseptikaga rioya qilinishi va erishilgan natija..."
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
            required
          />
          <span className="text-[10px] text-slate-400 block mt-1">
            Kamida 10 ta belgi talab qilinadi. Qisqa yoki ma'nosiz yozuvlar qabul qilinmaydi.
          </span>
        </div>

        {/* File / Photo Attachment */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1.5 flex items-center justify-between">
            <span>Fayl yoki rasm biriktirish (Ixtiyoriy)</span>
            <span className="text-[10px] text-slate-400">PNG, JPG, PDF (max 10MB)</span>
          </label>
          <div className="flex items-center gap-3">
            <label className="px-3 py-1.5 border border-dashed border-slate-300 hover:border-blue-500 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-blue-50 cursor-pointer transition-colors flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Fayl tanlash</span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleSimulateFileUpload}
                className="hidden"
              />
            </label>
            {attachmentName ? (
              <span className="text-xs text-blue-700 font-medium flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                {attachmentName}
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">Fayl biriktirilmagan</span>
            )}
          </div>
        </div>

        {/* Medical Confidentiality Disclaimer */}
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex items-start gap-2 text-amber-900 text-[11px]">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Tibbiy deontologiya va maxfiylik:</strong> Bemorning shaxsiy identifikatorlari (F.I.Sh., pasport, yashash manzili)ni kiritish qat'iyan taqiqlanadi. Kiritilgan ma'lumotlar faqat o'quv amaliyoti maqsadlarida foydalaniladi.
          </span>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>Saqlanmoqda...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tekshiruvga topshirish</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
