import React, { useState, useEffect } from 'react';
import {
  FileEdit,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Info
} from 'lucide-react';
import { Attendance, AttendanceStatus, Student, Practice } from '../../../types';
import { storageService } from '../../../services/storageService';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { Modal } from '../../common/Modal';

interface ManualAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendanceRecord?: Attendance | null;
  practiceId: string;
  studentId?: string;
  date?: string;
  students: Student[];
  practices: Practice[];
  onSaved: () => void;
}

export function ManualAttendanceModal({
  isOpen,
  onClose,
  attendanceRecord,
  practiceId,
  studentId,
  date,
  students,
  practices,
  onSaved
}: ManualAttendanceModalProps) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(studentId || students[0]?.id || '');
  const [selectedPracticeId, setSelectedPracticeId] = useState<string>(practiceId || practices[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(date || '2026-09-28');
  const [status, setStatus] = useState<AttendanceStatus>('PRESENT');
  const [checkInTime, setCheckInTime] = useState<string>('08:30');
  const [checkOutTime, setCheckOutTime] = useState<string>('14:30');
  const [reason, setReason] = useState<string>('');
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (attendanceRecord) {
      setSelectedStudentId(attendanceRecord.studentId);
      setSelectedPracticeId(attendanceRecord.practiceId);
      setSelectedDate(attendanceRecord.date);
      setStatus(attendanceRecord.status.toUpperCase() as AttendanceStatus);
      setCheckInTime(attendanceRecord.checkInTime || '08:30');
      setCheckOutTime(attendanceRecord.checkOutTime || '14:30');
      setNote(attendanceRecord.notes || attendanceRecord.note || '');
      setReason('');
    } else {
      if (studentId) setSelectedStudentId(studentId);
      if (practiceId) setSelectedPracticeId(practiceId);
      if (date) setSelectedDate(date);
      setStatus('PRESENT');
      setCheckInTime('08:30');
      setCheckOutTime('14:30');
      setNote('');
      setReason('');
    }
  }, [attendanceRecord, studentId, practiceId, date, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!reason.trim()) {
      showToast('error', 'Sabab talab qilinadi', 'O\'zgartirish sababi / asosini yozing (Audit log uchun majburiy)');
      return;
    }

    try {
      storageService.manualUpdateAttendance({
        attendanceId: attendanceRecord?.id,
        studentId: selectedStudentId,
        practiceId: selectedPracticeId,
        date: selectedDate,
        status,
        checkInTime: (status === 'PRESENT' || status === 'LATE') ? checkInTime : undefined,
        checkOutTime: (status === 'PRESENT' || status === 'LATE') ? checkOutTime : undefined,
        note: note || reason,
        reason: reason.trim(),
        actorUserId: currentUser.uid || currentUser.id,
        actorRole: currentUser.role,
        actorName: currentUser.fullName
      });

      showToast('success', 'Davomat yangilandi', `Talaba holati: ${status}. Audit logga yozildi.`);
      onSaved();
      onClose();
    } catch (err: any) {
      showToast('error', 'Xatolik', err.message || 'Davomatni saqlab bo\'lmadi');
    }
  };

  const student = students.find(s => s.id === selectedStudentId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={attendanceRecord ? "Davomatni qo'lda tuzatish (Audit Nazorat)" : "Yangi davomat yozuvi kiritish"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Security Warning */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Vakolatli xodim nazorati (Section 11)</p>
            <p className="text-[11px] text-amber-700 mt-0.5">
              Har bir qo'lda kiritilgan yoki o'zgartirilgan yozuv kim tomonidan, qachon va qanday sabab bilan o'zgartirilgani audit logida saqlanadi.
            </p>
          </div>
        </div>

        {/* Student display or selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Talaba *
          </label>
          {attendanceRecord ? (
            <div className="px-3 py-2 bg-slate-50 border rounded-lg text-xs font-semibold text-slate-800">
              {student?.fullName} ({student?.studentId})
            </div>
          ) : (
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-lg bg-slate-50 focus:bg-white"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.fullName} ({s.studentId})</option>
              ))}
            </select>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Sana *
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 text-xs border rounded-lg bg-slate-50 font-mono"
            required
          />
        </div>

        {/* Status Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Davomat holati *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { val: 'PRESENT', label: 'Kelgan', color: 'emerald' },
              { val: 'LATE', label: 'Kechikkan', color: 'amber' },
              { val: 'ABSENT', label: 'Kelmagan', color: 'red' },
              { val: 'EXCUSED', label: 'Uzrli', color: 'purple' }
            ].map(item => (
              <button
                key={item.val}
                type="button"
                onClick={() => setStatus(item.val as AttendanceStatus)}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center ${
                  status === item.val
                    ? item.color === 'emerald' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : item.color === 'amber' ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : item.color === 'red' ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Check-In / Check-Out Times if Present or Late */}
        {(status === 'PRESENT' || status === 'LATE') && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kelish vaqti
              </label>
              <input
                type="time"
                value={checkInTime}
                onChange={e => setCheckInTime(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-lg bg-slate-50 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ketish vaqti (Check-out)
              </label>
              <input
                type="time"
                value={checkOutTime}
                onChange={e => setCheckOutTime(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-lg bg-slate-50 font-mono"
              />
            </div>
          </div>
        )}

        {/* Mandatory Reason for Audit Log */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            O'zgartirish sababi / Asos (Audit Log uchun majburiy) *
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={2}
            placeholder="Masalan: Talaba dekanat ma'lumotnomasi taqdim etdi, kasallik varaqasi №123 yoki QR texnik nosozlik sabab qo'lda kiritildi..."
            className="w-full px-3 py-2 text-xs border rounded-lg bg-slate-50 focus:bg-white"
            required
          />
        </div>

        {/* Additional Note */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Qo'shimcha izoh
          </label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Klinik bo'lim yoki rahbar izohi..."
            className="w-full px-3 py-2 text-xs border rounded-lg bg-slate-50"
          />
        </div>

        <div className="pt-3 border-t flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all"
          >
            Saqlash va Auditga yozish
          </button>
        </div>
      </form>
    </Modal>
  );
}
