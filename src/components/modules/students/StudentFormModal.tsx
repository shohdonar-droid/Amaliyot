import React, { useState, useEffect } from 'react';
import { Student, StudentStatus } from '../../../types';
import { storageService } from '../../../services/storageService';
import { allocateNextStudentLoginAtomic, parseStudentCodeSequence } from '../../../services/loginGeneratorService';
import { db } from '../../../services/firebase';
import { Modal } from '../../common/Modal';
import { ShieldCheck, Hash, User, Phone, Send, Info } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
  studentToEdit?: Student | null;
}

export function StudentFormModal({ isOpen, onClose, onSave, studentToEdit }: StudentFormModalProps) {
  const { showToast } = useToast();
  const faculties = storageService.getFaculties() || [];
  const directions = storageService.getDirections() || [];
  const courses = storageService.getCourses() || [];
  const groups = storageService.getGroups() || [];

  const [fullName, setFullName] = useState('');
  const [hemisStudentId, setHemisStudentId] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [directionId, setDirectionId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [telegram, setTelegram] = useState('@');
  const [status, setStatus] = useState<StudentStatus>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (studentToEdit) {
      setFullName(studentToEdit.fullName || '');
      setHemisStudentId(studentToEdit.hemisStudentId || studentToEdit.studentId || '');
      setFacultyId(studentToEdit.facultyId || faculties[0]?.id || '');
      setDirectionId(studentToEdit.directionId || directions[0]?.id || '');
      setCourseId(studentToEdit.courseId || courses[0]?.id || '');
      setGroupId(studentToEdit.groupId || groups[0]?.id || '');
      setPhone(studentToEdit.phone || '+998 ');
      setTelegram(studentToEdit.telegram || '@');
      setStatus(studentToEdit.status || 'active');
    } else {
      const defaultFac = faculties[0]?.id || '';
      const matchingDirs = directions.filter(d => d.facultyId === defaultFac);
      const defaultDir = matchingDirs[0]?.id || directions[0]?.id || '';
      const matchingGroups = groups.filter(g => g.facultyId === defaultFac);
      const defaultGroup = matchingGroups[0]?.id || groups[0]?.id || '';

      setFullName('');
      setHemisStudentId('');
      setFacultyId(defaultFac);
      setDirectionId(defaultDir);
      setCourseId(courses[0]?.id || '');
      setGroupId(defaultGroup);
      setPhone('+998 ');
      setTelegram('@');
      setStatus('active');
    }
  }, [studentToEdit, isOpen]);

  // Filter directions based on selected faculty
  const filteredDirections = directions.filter(d => d.facultyId === facultyId);
  // Filter groups based on selected faculty and direction
  const filteredGroups = groups.filter(g => g.facultyId === facultyId && (!directionId || g.directionId === directionId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!fullName.trim()) {
      showToast('warning', 'F.I.Sh. kiritilmadi', 'Talabaning to\'liq familiya, ism va sharifini kiriting.');
      return;
    }

    if (!hemisStudentId.trim()) {
      showToast('warning', 'HEMIS ID kiritilmadi', 'Talabaning HEMIS tizimidagi ID raqamini kiriting.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (studentToEdit) {
        // Editing existing student: preserve login and studentId
        const payload: Student = {
          ...studentToEdit,
          fullName: fullName.trim(),
          hemisStudentId: hemisStudentId.trim(),
          facultyId,
          directionId,
          courseId,
          groupId: groupId || filteredGroups[0]?.id || 'grp-401',
          phone: phone.trim(),
          telegram: telegram.trim(),
          status
        };
        onSave(payload);
        onClose();
      } else {
        // Creating new student: allocate strictly monotonic next sequence login (e.g. T00001, T00002)
        const allocatedLogin = await allocateNextStudentLoginAtomic(
          db,
          storageService.getStudents(),
          storageService.getUsers()
        );

        // Numeric part of login is the student's ID (e.g. T00001 -> 00001)
        const seqNum = parseStudentCodeSequence(allocatedLogin);
        const autoStudentId = seqNum ? String(seqNum).padStart(5, '0') : allocatedLogin;

        const payload: Student = {
          id: 'new',
          userId: `uid-std-${Date.now()}`,
          login: allocatedLogin,
          studentCode: allocatedLogin,
          password: 'password123',
          studentId: autoStudentId,
          hemisStudentId: hemisStudentId.trim(),
          fullName: fullName.trim(),
          facultyId,
          directionId,
          courseId,
          groupId: groupId || filteredGroups[0]?.id || 'grp-401',
          phone: phone.trim(),
          telegram: telegram.trim(),
          email: `${allocatedLogin}@student.uz`,
          status
        };

        onSave(payload);
        onClose();
      }
    } catch (err: any) {
      showToast('error', 'Xatolik yuz berdi', err?.message || 'Talabani saqlashda muammo yuz berdi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={studentToEdit ? "Talaba ma'lumotlarini tahrirlash" : "Yangi talaba qo'shish"}
      subtitle="Universitet amaliyot ro'yxatiga talabani kiritish"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-600" />
            <span>F.I.Sh. (Familiya Ism Sharif) *</span>
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Masalan: Karimova Dilnoza Sanjar qizi"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
          />
        </div>

        {/* HEMIS Talaba ID */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-blue-600" />
            <span>HEMIS Talaba ID *</span>
          </label>
          <input
            type="text"
            required
            value={hemisStudentId}
            onChange={e => setHemisStudentId(e.target.value)}
            placeholder="Masalan: 382211100015"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono bg-white"
          />
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            HEMIS axborot tizimidagi rasmiy talaba ID kodi
          </span>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Holati (Status)
          </label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as StudentStatus)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
          >
            <option value="active">Faol (O'qimoqda)</option>
            <option value="in_practice">Amaliyotda</option>
            <option value="completed">Yakunlagan</option>
            <option value="suspended">Chetlashtirilgan</option>
          </select>
        </div>

        {/* Faculty & Direction */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Fakultet *
            </label>
            <select
              value={facultyId}
              onChange={e => {
                const nextFac = e.target.value;
                setFacultyId(nextFac);
                const nextDirs = directions.filter(d => d.facultyId === nextFac);
                const nextDirId = nextDirs[0]?.id || '';
                setDirectionId(nextDirId);
                const nextGroups = groups.filter(g => g.facultyId === nextFac);
                setGroupId(nextGroups[0]?.id || '');
              }}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
            >
              {faculties.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Yo'nalish *
            </label>
            <select
              value={directionId}
              onChange={e => {
                const nextDir = e.target.value;
                setDirectionId(nextDir);
                const nextGroups = groups.filter(g => g.facultyId === facultyId && g.directionId === nextDir);
                if (nextGroups.length > 0) {
                  setGroupId(nextGroups[0].id);
                }
              }}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
            >
              {filteredDirections.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Course & Group */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Kurs *
            </label>
            <select
              value={courseId}
              onChange={e => setCourseId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Guruh *
            </label>
            <select
              value={groupId}
              onChange={e => setGroupId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
            >
              {filteredGroups.map(g => (
                <option key={g.id} value={g.id}>{g.name} ({g.language})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Phone & Telegram */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-500" />
              <span>Telefon raqami</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+998 (90) 123-45-67"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Send className="w-3 h-3 text-blue-500" />
              <span>Telegram foydalanuvchi</span>
            </label>
            <input
              type="text"
              value={telegram}
              onChange={e => setTelegram(e.target.value)}
              placeholder="@username"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
            />
          </div>
        </div>

        {/* Automatic credentials banner (does NOT show sequence in advance) */}
        {!studentToEdit && (
          <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200/80 text-xs text-blue-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-blue-950 block">Avtomatik tartibli login va Talaba ID</span>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Tizim tartibli login (T00001, T00002...), parol va uning sonli ID raqamini <strong>"Talabani saqlash"</strong> bosilgandan so'ng navbatdagi tartib raqami bo'yicha avtomatik biriktiradi va ekranda to'liq ko'rsatib beradi.
              </p>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saqlanmoqda...</span>
              </>
            ) : (
              <span>{studentToEdit ? "O'zgarishlarni saqlash" : "Talabani saqlash"}</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
