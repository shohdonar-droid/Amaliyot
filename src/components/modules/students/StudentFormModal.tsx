import React, { useState, useEffect } from 'react';
import { Student, StudentStatus } from '../../../types';
import { storageService } from '../../../services/storageService';
import { generateAutoUserCredentials } from '../../../services/loginGeneratorService';
import { db } from '../../../services/firebase';
import { Modal } from '../../common/Modal';
import { ShieldCheck, Hash, Copy, RefreshCw, Key } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
  studentToEdit?: Student | null;
}

export function StudentFormModal({ isOpen, onClose, onSave, studentToEdit }: StudentFormModalProps) {
  const { showToast } = useToast();
  const faculties = storageService.getFaculties();
  const directions = storageService.getDirections();
  const courses = storageService.getCourses();
  const groups = storageService.getGroups();

  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [hemisStudentId, setHemisStudentId] = useState('');
  const [assignedLogin, setAssignedLogin] = useState('');
  const [password, setPassword] = useState('');
  const [pinfl, setPinfl] = useState('');
  const [facultyId, setFacultyId] = useState(faculties[0]?.id || '');
  const [directionId, setDirectionId] = useState(directions[0]?.id || '');
  const [courseId, setCourseId] = useState(courses[3]?.id || courses[0]?.id || '');
  const [groupId, setGroupId] = useState(groups[0]?.id || '');
  const [phone, setPhone] = useState('+998 ');
  const [telegram, setTelegram] = useState('@');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<StudentStatus>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const regenerateCredentials = (name: string) => {
    const creds = generateAutoUserCredentials(name, 'STUDENT', storageService.getUsers(), storageService.getStudents());
    setAssignedLogin(creds.login);
    setEmail(creds.email);
    setPassword(creds.password);
  };

  useEffect(() => {
    if (studentToEdit) {
      setFullName(studentToEdit.fullName);
      setStudentId(studentToEdit.studentId);
      setHemisStudentId(studentToEdit.hemisStudentId || studentToEdit.studentId);
      setAssignedLogin(studentToEdit.login || studentToEdit.studentCode || '');
      setPassword(studentToEdit.password || 'password123');
      setPinfl(studentToEdit.pinfl);
      setFacultyId(studentToEdit.facultyId);
      setDirectionId(studentToEdit.directionId);
      setCourseId(studentToEdit.courseId);
      setGroupId(studentToEdit.groupId);
      setPhone(studentToEdit.phone);
      setTelegram(studentToEdit.telegram || '');
      setEmail(studentToEdit.email);
      setStatus(studentToEdit.status);
    } else {
      const creds = generateAutoUserCredentials('', 'STUDENT', storageService.getUsers(), storageService.getStudents());
      setFullName('');
      setStudentId(`MED-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
      setHemisStudentId(String(Math.floor(10000000 + Math.random() * 90000000)));
      setAssignedLogin(creds.login);
      setPassword(creds.password);
      setPinfl('');
      setFacultyId(faculties[0]?.id || '');
      setDirectionId(directions[0]?.id || '');
      setCourseId(courses[3]?.id || courses[0]?.id || '');
      setGroupId(groups[0]?.id || '');
      setPhone('+998 (90) ');
      setTelegram('@');
      setEmail(creds.email);
      setStatus('active');
    }
  }, [studentToEdit, isOpen]);

  // Filter directions based on selected faculty
  const filteredDirections = directions.filter(d => d.facultyId === facultyId);
  // Filter groups based on selected faculty and direction
  const filteredGroups = groups.filter(g => g.facultyId === facultyId && (!directionId || g.directionId === directionId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !studentId.trim() || !pinfl.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    const payload: Student = {
      id: studentToEdit?.id || 'new',
      userId: studentToEdit?.userId || `uid-std-${Date.now()}`,
      login: assignedLogin,
      password: password,
      studentCode: assignedLogin,
      hemisStudentId: hemisStudentId.trim() || studentId.trim(),
      fullName: fullName.trim(),
      studentId: studentId.trim(),
      pinfl: pinfl.trim(),
      facultyId,
      directionId,
      courseId,
      groupId: groupId || filteredGroups[0]?.id || 'grp-401',
      phone: phone.trim(),
      telegram: telegram.trim(),
      email: email.trim(),
      status,
      currentPracticeId: studentToEdit?.currentPracticeId,
      currentPracticePlaceId: studentToEdit?.currentPracticePlaceId
    };

    onSave(payload);
    setIsSubmitting(false);
    onClose();
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
        {/* AIDE System Auto Login, Password & Email Info */}
        <div className="p-3.5 bg-gradient-to-br from-indigo-50/70 via-blue-50/50 to-emerald-50/40 border border-blue-200 rounded-xl space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-xs font-bold text-slate-900">
                Firebase Avtomatik Login, Parol va Email
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full border border-emerald-300">
                Avtomatik
              </span>
            </div>
            <button
              type="button"
              onClick={() => regenerateCredentials(fullName)}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
              title="Yangi parol va logindan qayta generatsiya qilish"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Qayta yaratish</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 block font-semibold">Tizim Logini:</span>
              <input
                type="text"
                value={assignedLogin}
                onChange={e => setAssignedLogin(e.target.value)}
                placeholder="Login"
                className="mt-1 w-full font-mono text-xs font-black text-slate-900 border border-slate-200 rounded px-2 py-1 bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 block font-semibold">Tizim Paroli:</span>
              <input
                type="text"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Parol"
                className="mt-1 w-full font-mono text-xs font-black text-blue-700 border border-slate-200 rounded px-2 py-1 bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 block font-semibold">Avtomatik Email:</span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@tma.uz"
                className="mt-1 w-full text-xs font-semibold text-slate-800 border border-slate-200 rounded px-2 py-1 bg-slate-50 focus:bg-white truncate"
              />
            </div>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            F.I.Sh. (Familiya Ism Sharif) *
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Masalan: Karimova Dilnoza Sanjar qizi"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>

        {/* HEMIS ID & Student ID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-blue-600" />
              HEMIS Talaba ID *
            </label>
            <input
              type="text"
              required
              value={hemisStudentId}
              onChange={e => setHemisStudentId(e.target.value)}
              placeholder="12345678"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono"
            />
            <span className="text-[10px] text-slate-400">HEMIS bazasidagi o'zgarmas rasmiy ID</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Universitet Guvohnoma / ID raqami *
            </label>
            <input
              type="text"
              required
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              placeholder="MED-2022-1084"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono"
            />
          </div>
        </div>

        {/* JSHSHIR & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              JSHSHIR (14 xonali PINFL) *
            </label>
            <input
              type="text"
              required
              maxLength={14}
              value={pinfl}
              onChange={e => setPinfl(e.target.value)}
              placeholder="31405991230045"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Holati (Status)
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as StudentStatus)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            >
              <option value="active">Boshlanmagan (Active)</option>
              <option value="in_practice">Amaliyotda (In practice)</option>
              <option value="completed">Yakunlagan (Completed)</option>
              <option value="suspended">Chetlashtirilgan (Suspended)</option>
            </select>
          </div>
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
                setFacultyId(e.target.value);
                const nextDirs = directions.filter(d => d.facultyId === e.target.value);
                setDirectionId(nextDirs[0]?.id || '');
              }}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
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
              onChange={e => setDirectionId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
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
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
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
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
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
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Telefon raqami
            </label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+998 (90) 123-45-67"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Telegram foydalanuvchi
            </label>
            <input
              type="text"
              value={telegram}
              onChange={e => setTelegram(e.target.value)}
              placeholder="@username"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            {studentToEdit ? "O'zgarishlarni saqlash" : "Talabani saqlash"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
