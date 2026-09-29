import React, { useState, useEffect } from 'react';
import { Student, StudentStatus } from '../../../types';
import { storageService } from '../../../services/storageService';
import { Modal } from '../../common/Modal';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
  studentToEdit?: Student | null;
}

export function StudentFormModal({
  isOpen,
  onClose,
  onSave,
  studentToEdit
}: StudentFormModalProps) {
  const faculties = storageService.getFaculties();
  const directions = storageService.getDirections();
  const courses = storageService.getCourses();
  const groups = storageService.getGroups();

  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [pinfl, setPinfl] = useState('');
  const [facultyId, setFacultyId] = useState(faculties[0]?.id || '');
  const [directionId, setDirectionId] = useState(directions[0]?.id || '');
  const [courseId, setCourseId] = useState(courses[3]?.id || courses[0]?.id || '');
  const [groupId, setGroupId] = useState(groups[0]?.id || '');
  const [phone, setPhone] = useState('+998 ');
  const [telegram, setTelegram] = useState('@');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<StudentStatus>('active');

  useEffect(() => {
    if (studentToEdit) {
      setFullName(studentToEdit.fullName);
      setStudentId(studentToEdit.studentId);
      setPinfl(studentToEdit.pinfl);
      setFacultyId(studentToEdit.facultyId);
      setDirectionId(studentToEdit.directionId);
      setCourseId(studentToEdit.courseId);
      setGroupId(studentToEdit.groupId);
      setPhone(studentToEdit.phone);
      setTelegram(studentToEdit.telegram);
      setEmail(studentToEdit.email);
      setStatus(studentToEdit.status);
    } else {
      // New student defaults
      setFullName('');
      setStudentId(`MED-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
      setPinfl('');
      setFacultyId(faculties[0]?.id || '');
      setDirectionId(directions[0]?.id || '');
      setCourseId(courses[3]?.id || courses[0]?.id || '');
      setGroupId(groups[0]?.id || '');
      setPhone('+998 (90) ');
      setTelegram('@');
      setEmail('');
      setStatus('active');
    }
  }, [studentToEdit, isOpen]);

  // Filter directions based on selected faculty
  const filteredDirections = directions.filter(d => d.facultyId === facultyId);
  // Filter groups based on selected faculty and direction
  const filteredGroups = groups.filter(g => g.facultyId === facultyId && (!directionId || g.directionId === directionId));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !studentId.trim() || !pinfl.trim()) {
      return;
    }

    const payload: Student = {
      id: studentToEdit?.id || `std-${Date.now()}`,
      fullName: fullName.trim(),
      studentId: studentId.trim(),
      pinfl: pinfl.trim(),
      facultyId,
      directionId,
      courseId,
      groupId: groupId || filteredGroups[0]?.id || 'grp-401',
      phone: phone.trim(),
      telegram: telegram.trim(),
      email: email.trim() || `${studentId.toLowerCase()}@student.tma.uz`,
      status,
      currentPracticeId: studentToEdit?.currentPracticeId,
      currentPracticePlaceId: studentToEdit?.currentPracticePlaceId
    };

    onSave(payload);
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
        {/* Full Name & Student ID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Talaba ID raqami *
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
                const firstDir = directions.find(d => d.facultyId === e.target.value);
                if (firstDir) setDirectionId(firstDir.id);
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
                <option key={d.id} value={d.id}>{d.name} ({d.degree})</option>
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
                <option key={c.id} value={c.id}>{c.name} ({c.academicYear})</option>
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

        {/* Phone, Telegram, Email */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Telefon raqami *
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+998 (90) 123-45-67"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Telegram profili
            </label>
            <input
              type="text"
              value={telegram}
              onChange={e => setTelegram(e.target.value)}
              placeholder="@username"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email manzili
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="student@tma.uz"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            {studentToEdit ? "O'zgarishlarni saqlash" : "Talabani qo'shish"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
