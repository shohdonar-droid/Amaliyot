import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Layers,
  Users,
  Search
} from 'lucide-react';
import { Faculty, Direction, Group, Course } from '../../../types';
import { storageService } from '../../../services/storageService';
import { useToast } from '../../../context/ToastContext';
import { Modal } from '../../common/Modal';
import { ConfirmDialog } from '../../common/ConfirmDialog';

export function AcademicStructureModule() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'faculties' | 'directions' | 'courses' | 'groups'>('faculties');

  const [faculties, setFaculties] = useState<Faculty[]>(() => storageService.getFaculties());
  const [directions, setDirections] = useState<Direction[]>(() => storageService.getDirections());
  const [courses, setCourses] = useState<Course[]>(() => storageService.getCourses());
  const [groups, setGroups] = useState<Group[]>(() => storageService.getGroups());

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Modals for CRUD
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  const [facultyToEdit, setFacultyToEdit] = useState<Faculty | null>(null);

  const [isDirectionModalOpen, setIsDirectionModalOpen] = useState(false);
  const [directionToEdit, setDirectionToEdit] = useState<Direction | null>(null);

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<Group | null>(null);

  // Deletion confirm
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'faculty' | 'direction' | 'group'; id: string; name: string } | null>(null);

  const refreshAll = () => {
    setFaculties(storageService.getFaculties());
    setDirections(storageService.getDirections());
    setCourses(storageService.getCourses());
    setGroups(storageService.getGroups());
  };

  // Faculty form handler
  const handleSaveFaculty = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const item: Faculty = {
      id: facultyToEdit?.id || `fac-${Date.now()}`,
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      deanName: formData.get('deanName') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string
    };
    storageService.saveFaculty(item);
    refreshAll();
    setIsFacultyModalOpen(false);
    showToast('success', 'Fakultet saqlandi', item.name);
  };

  // Direction form handler
  const handleSaveDirection = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const item: Direction = {
      id: directionToEdit?.id || `dir-${Date.now()}`,
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      facultyId: formData.get('facultyId') as string,
      degree: formData.get('degree') as any,
      durationYears: Number(formData.get('durationYears')) || 6
    };
    storageService.saveDirection(item);
    refreshAll();
    setIsDirectionModalOpen(false);
    showToast('success', 'Yo\'nalish saqlandi', item.name);
  };

  // Group form handler
  const handleSaveGroup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const item: Group = {
      id: groupToEdit?.id || `grp-${Date.now()}`,
      name: formData.get('name') as string,
      directionId: formData.get('directionId') as string,
      courseId: formData.get('courseId') as string,
      facultyId: formData.get('facultyId') as string,
      language: formData.get('language') as any,
      studentCount: Number(formData.get('studentCount')) || 20
    };
    storageService.saveGroup(item);
    refreshAll();
    setIsGroupModalOpen(false);
    showToast('success', 'Guruh saqlandi', item.name);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'faculty') {
      storageService.deleteFaculty(deleteTarget.id);
    } else if (deleteTarget.type === 'direction') {
      storageService.deleteDirection(deleteTarget.id);
    } else if (deleteTarget.type === 'group') {
      storageService.deleteGroup(deleteTarget.id);
    }
    refreshAll();
    showToast('info', 'O\'chirildi', `${deleteTarget.name} tizimdan olib tashlandi.`);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Akademik tuzilma
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Universitet fakultetlari, mutaxassislik yo'nalishlari, kurslari va akademik guruhlari
          </p>
        </div>

        <div>
          {activeTab === 'faculties' && (
            <button
              onClick={() => {
                setFacultyToEdit(null);
                setIsFacultyModalOpen(true);
              }}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Yangi fakultet
            </button>
          )}
          {activeTab === 'directions' && (
            <button
              onClick={() => {
                setDirectionToEdit(null);
                setIsDirectionModalOpen(true);
              }}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Yangi yo'nalish
            </button>
          )}
          {activeTab === 'groups' && (
            <button
              onClick={() => {
                setGroupToEdit(null);
                setIsGroupModalOpen(true);
              }}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Yangi guruh
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('faculties')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'faculties'
              ? 'bg-white text-slate-900 font-semibold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Fakultetlar ({faculties.length})
        </button>
        <button
          onClick={() => setActiveTab('directions')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'directions'
              ? 'bg-white text-slate-900 font-semibold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Yo'nalishlar ({directions.length})
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'courses'
              ? 'bg-white text-slate-900 font-semibold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Kurslar ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'groups'
              ? 'bg-white text-slate-900 font-semibold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Guruhlar ({groups.length})
        </button>
      </div>

      {/* Tab: Faculties */}
      {activeTab === 'faculties' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faculties.map(faculty => {
            const facultyDirections = directions.filter(d => d.facultyId === faculty.id);
            const facultyGroups = groups.filter(g => g.facultyId === faculty.id);

            return (
              <div key={faculty.id} className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {faculty.code}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setFacultyToEdit(faculty);
                          setIsFacultyModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: 'faculty', id: faculty.id, name: faculty.name })}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-md"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{faculty.name}</h3>
                  <p className="text-xs text-slate-600 mt-1">Dekan: {faculty.deanName}</p>
                  
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>{faculty.phone}</span>
                    <span>{facultyDirections.length} ta yo'nalish · {facultyGroups.length} ta guruh</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Directions */}
      {activeTab === 'directions' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Kodi</th>
                <th className="py-3 px-4">Yo'nalish nomi</th>
                <th className="py-3 px-4">Fakultet</th>
                <th className="py-3 px-4">Daraja</th>
                <th className="py-3 px-4">Muddati</th>
                <th className="py-3 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {directions.map(dir => {
                const fac = faculties.find(f => f.id === dir.facultyId);
                return (
                  <tr key={dir.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-semibold text-blue-700">{dir.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{dir.name}</td>
                    <td className="py-3 px-4 text-slate-600">{fac?.name}</td>
                    <td className="py-3 px-4 text-slate-700">{dir.degree}</td>
                    <td className="py-3 px-4 font-mono">{dir.durationYears} yil</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setDirectionToEdit(dir);
                            setIsDirectionModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ type: 'direction', id: dir.id, name: dir.name })}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Courses */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => {
            const courseGroups = groups.filter(g => g.courseId === course.id);
            return (
              <div key={course.id} className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-slate-900">{course.name}</h4>
                  <span className="text-xs font-mono text-slate-500">{course.academicYear}</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Akademik guruhlar soni: <strong className="text-slate-800 font-mono">{courseGroups.length} ta</strong>
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {courseGroups.map(g => (
                    <span key={g.id} className="text-[11px] px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Groups */}
      {activeTab === 'groups' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Guruh</th>
                <th className="py-3 px-4">Yo'nalish</th>
                <th className="py-3 px-4">Fakultet</th>
                <th className="py-3 px-4">Kurs</th>
                <th className="py-3 px-4">Ta'lim tili</th>
                <th className="py-3 px-4">Talabalar soni</th>
                <th className="py-3 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {groups.map(grp => {
                const fac = faculties.find(f => f.id === grp.facultyId);
                const dir = directions.find(d => d.id === grp.directionId);
                const crs = courses.find(c => c.id === grp.courseId);

                return (
                  <tr key={grp.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{grp.name}</td>
                    <td className="py-3 px-4 text-slate-700">{dir?.name}</td>
                    <td className="py-3 px-4 text-slate-600">{fac?.name}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{crs?.name}</td>
                    <td className="py-3 px-4 text-slate-600">{grp.language}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-blue-700">{grp.studentCount || 20} nafar</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setGroupToEdit(grp);
                            setIsGroupModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ type: 'group', id: grp.id, name: grp.name })}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Faculty Modal */}
      <Modal
        isOpen={isFacultyModalOpen}
        onClose={() => setIsFacultyModalOpen(false)}
        title={facultyToEdit ? "Fakultetni tahrirlash" : "Yangi fakultet qo'shish"}
        maxWidth="md"
      >
        <form onSubmit={handleSaveFaculty} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Fakultet nomi *</label>
            <input type="text" name="name" required defaultValue={facultyToEdit?.name || ''} className="w-full px-3 py-2 text-xs border rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Qisqa kodi *</label>
            <input type="text" name="code" required defaultValue={facultyToEdit?.code || ''} className="w-full px-3 py-2 text-xs border rounded-lg font-mono" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Dekan (F.I.Sh.) *</label>
            <input type="text" name="deanName" required defaultValue={facultyToEdit?.deanName || ''} className="w-full px-3 py-2 text-xs border rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Telefon</label>
            <input type="text" name="phone" defaultValue={facultyToEdit?.phone || '+998 (71) '} className="w-full px-3 py-2 text-xs border rounded-lg font-mono" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
            <input type="email" name="email" defaultValue={facultyToEdit?.email || ''} className="w-full px-3 py-2 text-xs border rounded-lg" />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={() => setIsFacultyModalOpen(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">Bekor qilish</button>
            <button type="submit" className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Saqlash</button>
          </div>
        </form>
      </Modal>

      {/* Direction Modal */}
      <Modal
        isOpen={isDirectionModalOpen}
        onClose={() => setIsDirectionModalOpen(false)}
        title={directionToEdit ? "Yo'nalishni tahrirlash" : "Yangi yo'nalish qo'shish"}
        maxWidth="md"
      >
        <form onSubmit={handleSaveDirection} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Yo'nalish nomi *</label>
            <input type="text" name="name" required defaultValue={directionToEdit?.name || ''} className="w-full px-3 py-2 text-xs border rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Kodi *</label>
            <input type="text" name="code" required defaultValue={directionToEdit?.code || ''} className="w-full px-3 py-2 text-xs border rounded-lg font-mono" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tegishli fakultet *</label>
            <select name="facultyId" defaultValue={directionToEdit?.facultyId || faculties[0]?.id} className="w-full px-3 py-2 text-xs border rounded-lg">
              {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Daraja</label>
              <select name="degree" defaultValue={directionToEdit?.degree || 'Bakalavr'} className="w-full px-3 py-2 text-xs border rounded-lg">
                <option value="Bakalavr">Bakalavr</option>
                <option value="Magistratura">Magistratura</option>
                <option value="Klinik ordinatura">Klinik ordinatura</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Muddati (yil)</label>
              <input type="number" name="durationYears" defaultValue={directionToEdit?.durationYears || 6} className="w-full px-3 py-2 text-xs border rounded-lg" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={() => setIsDirectionModalOpen(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">Bekor qilish</button>
            <button type="submit" className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Saqlash</button>
          </div>
        </form>
      </Modal>

      {/* Group Modal */}
      <Modal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        title={groupToEdit ? "Guruhni tahrirlash" : "Yangi guruh qo'shish"}
        maxWidth="md"
      >
        <form onSubmit={handleSaveGroup} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Guruh nomi *</label>
            <input type="text" name="name" required defaultValue={groupToEdit?.name || ''} placeholder="Masalan: 401-A (Davolash)" className="w-full px-3 py-2 text-xs border rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Fakultet *</label>
            <select name="facultyId" defaultValue={groupToEdit?.facultyId || faculties[0]?.id} className="w-full px-3 py-2 text-xs border rounded-lg">
              {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Yo'nalish *</label>
            <select name="directionId" defaultValue={groupToEdit?.directionId || directions[0]?.id} className="w-full px-3 py-2 text-xs border rounded-lg">
              {directions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kurs</label>
              <select name="courseId" defaultValue={groupToEdit?.courseId || courses[3]?.id} className="w-full px-3 py-2 text-xs border rounded-lg">
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ta'lim tili</label>
              <select name="language" defaultValue={groupToEdit?.language || "O'zbek"} className="w-full px-3 py-2 text-xs border rounded-lg">
                <option value="O'zbek">O'zbek</option>
                <option value="Rus">Rus</option>
                <option value="Ingliz">Ingliz</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Talabalar soni</label>
            <input type="number" name="studentCount" defaultValue={groupToEdit?.studentCount || 20} className="w-full px-3 py-2 text-xs border rounded-lg font-mono" />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={() => setIsGroupModalOpen(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">Bekor qilish</button>
            <button type="submit" className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Saqlash</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Elementni o'chirish"
        message={`Haqiqatan ham "${deleteTarget?.name}" ni o'chirmoqchimisiz?`}
        confirmLabel="O'chirish"
        cancelLabel="Bekor qilish"
        isDestructive
      />
    </div>
  );
}
