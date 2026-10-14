import React, { useState, useEffect } from 'react';
import { Practice, PracticeType, PracticeStatus, PracticePlace } from '../../../types';
import { storageService } from '../../../services/storageService';
import { organizationService } from '../../../services/organizationService';
import { Modal } from '../../common/Modal';

interface PracticeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (practice: Practice) => void;
  practiceToEdit?: Practice | null;
}

const PRACTICE_TYPES: PracticeType[] = [
  "O'quv-tanishuv amaliyoti",
  "Hamshiralik malakaviy amaliyoti",
  "Klinik ishlab chiqarish amaliyoti",
  "Subordinatura amaliyoti",
  "Klinik ordinatura amaliyoti"
];

export function PracticeFormModal({
  isOpen,
  onClose,
  onSave,
  practiceToEdit
}: PracticeFormModalProps) {
  const faculties = storageService.getFaculties();
  const directions = storageService.getDirections();
  const groups = storageService.getGroups();
  const [places, setPlaces] = useState<PracticePlace[]>(() => storageService.getPracticePlaces());
  
  const [supervisors, setSupervisors] = useState(() => storageService.getSupervisors());
  const [clinicResponsibles, setClinicResponsibles] = useState(() => storageService.getClinicResponsibles());

  const [name, setName] = useState('');
  const [type, setType] = useState<PracticeType>("Klinik ishlab chiqarish amaliyoti");
  const [code, setCode] = useState('');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-11-15');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [facultyId, setFacultyId] = useState(faculties[0]?.id || '');
  const [directionId, setDirectionId] = useState(directions[0]?.id || '');
  const [courseLevel, setCourseLevel] = useState<number>(4);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([]);
  const [selectedSupervisorIds, setSelectedSupervisorIds] = useState<string[]>([]);
  const [selectedClinicRespIds, setSelectedClinicRespIds] = useState<string[]>([]);
  const [orderNumber, setOrderNumber] = useState('BUYRUQ-№188/A');
  const [orderDate, setOrderDate] = useState('2026-09-20');
  const [description, setDescription] = useState('');
  const [totalHours, setTotalHours] = useState(180);
  const [credits, setCredits] = useState(6);
  const [status, setStatus] = useState<PracticeStatus>('draft');

  useEffect(() => {
    if (isOpen) {
      const freshPlaces = storageService.getPracticePlaces();
      setPlaces(freshPlaces);
      organizationService.getOrganizations().then(fresh => {
        if (fresh && fresh.length > 0) {
          setPlaces(fresh);
        }
      });
      setSupervisors(storageService.getSupervisors());
      setClinicResponsibles(storageService.getClinicResponsibles());
    }
    if (practiceToEdit) {
      setName(practiceToEdit.name);
      setType(practiceToEdit.type);
      setCode(practiceToEdit.code);
      setStartDate(practiceToEdit.startDate);
      setEndDate(practiceToEdit.endDate);
      setAcademicYear(practiceToEdit.academicYear);
      setFacultyId(practiceToEdit.facultyId);
      setDirectionId(practiceToEdit.directionId);
      setCourseLevel(practiceToEdit.courseLevel);
      setSelectedGroupIds(practiceToEdit.groupIds);
      setSelectedPlaceIds(practiceToEdit.practicePlaceIds);
      setSelectedSupervisorIds(practiceToEdit.supervisorIds);
      setSelectedClinicRespIds(practiceToEdit.clinicResponsibleIds);
      setOrderNumber(practiceToEdit.orderNumber);
      setOrderDate(practiceToEdit.orderDate);
      setDescription(practiceToEdit.description || '');
      setTotalHours(practiceToEdit.totalHours);
      setCredits(practiceToEdit.credits);
      setStatus(practiceToEdit.status);
    } else {
      setName('');
      setType("Klinik ishlab chiqarish amaliyoti");
      setCode(`PRAC-${new Date().getFullYear()}-MED${Math.floor(10 + Math.random() * 90)}`);
      setStartDate('2026-10-01');
      setEndDate('2026-11-15');
      setAcademicYear('2026-2027');
      setFacultyId(faculties[0]?.id || '');
      setDirectionId(directions[0]?.id || '');
      setCourseLevel(4);
      setSelectedGroupIds(groups.slice(0, 2).map(g => g.id));
      setSelectedPlaceIds(places.slice(0, 2).map(p => p.id));
      setSelectedSupervisorIds(supervisors.slice(0, 1).map(s => s.id));
      setSelectedClinicRespIds(clinicResponsibles.slice(0, 1).map(c => c.id));
      setOrderNumber(`BUYRUQ-№${Math.floor(100 + Math.random() * 900)}/A`);
      setOrderDate('2026-09-25');
      setDescription('');
      setTotalHours(180);
      setCredits(6);
      setStatus('active');
    }
  }, [practiceToEdit, isOpen]);

  const toggleSelection = (id: string, currentList: string[], setList: (arr: string[]) => void) => {
    if (currentList.includes(id)) {
      setList(currentList.filter(item => item !== id));
    } else {
      setList([...currentList, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    const payload: Practice = {
      id: practiceToEdit?.id || `prac-${Date.now()}`,
      name: name.trim(),
      type,
      code: code.trim(),
      startDate,
      endDate,
      academicYear,
      facultyId,
      directionId,
      courseLevel,
      groupIds: selectedGroupIds,
      practicePlaceIds: selectedPlaceIds,
      supervisorIds: selectedSupervisorIds,
      clinicResponsibleIds: selectedClinicRespIds,
      status,
      orderNumber: orderNumber.trim(),
      orderDate,
      description: description.trim(),
      totalHours: Number(totalHours) || 120,
      credits: Number(credits) || 4
    };

    onSave(payload);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={practiceToEdit ? "Amaliyotni tahrirlash" : "Yangi amaliyot yaratish"}
      subtitle="Universitet bo'yicha amaliyot buyrug'ini ro'yxatdan o'tkazish"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Practice Name & Code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Amaliyot nomi *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Masalan: 4-kurs Davolash ishi 'Terapevtik yordam' klinik amaliyoti"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Amaliyot kodi *
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="PRAC-2025-MED4"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono"
            />
          </div>
        </div>

        {/* Type & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Amaliyot turi *
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value as PracticeType)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            >
              {PRACTICE_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Holati
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as PracticeStatus)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            >
              <option value="draft">Loyiha / Rejalashtirilgan (Draft)</option>
              <option value="active">Faol / O'talmoqda (Active)</option>
              <option value="paused">Vaqtincha to'xtatilgan (Paused)</option>
              <option value="completed">Yakunlangan (Completed)</option>
            </select>
          </div>
        </div>

        {/* Start Date, End Date, Academic Year */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Boshlanish sanasi *
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Tugash sanasi *
            </label>
            <input
              type="date"
              required
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              O'quv yili
            </label>
            <input
              type="text"
              value={academicYear}
              onChange={e => setAcademicYear(e.target.value)}
              placeholder="2026-2027"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
        </div>

        {/* Faculty, Direction, Course */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Fakultet *
            </label>
            <select
              value={facultyId}
              onChange={e => setFacultyId(e.target.value)}
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
              {directions.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Kurs darajasi *
            </label>
            <select
              value={courseLevel}
              onChange={e => setCourseLevel(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            >
              {[1, 2, 3, 4, 5, 6].map(lvl => (
                <option key={lvl} value={lvl}>{lvl}-kurs</option>
              ))}
            </select>
          </div>
        </div>

        {/* Amaliyotga chiqish va biriktirish parametrlari (Guruh, Rahbar, Baza) */}
        <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Amaliyot biriktiruvi: Guruh → Universitet rahbari → Amaliyot bazasi
            </span>
            <span className="text-[11px] text-blue-700 font-medium">
              Amaliyot yaratilishi bilan guruh talabalari bazaga biriktiriladi
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Guruh amaliyotga chiqishi */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                1. Qatnashuvchi guruh(lar) *
              </label>
              <div className="space-y-1.5 p-2 rounded-lg border border-slate-300 bg-white max-h-36 overflow-y-auto">
                {groups.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-1">Guruhlar mavjud emas</p>
                ) : (
                  groups.map(grp => {
                    const isChecked = selectedGroupIds.includes(grp.id);
                    const groupStudentsCount = storageService.getStudents().filter(s => s.groupId === grp.id).length;
                    return (
                      <label key={grp.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelection(grp.id, selectedGroupIds, setSelectedGroupIds)}
                          className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                        <span className="font-semibold text-slate-900">{grp.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono ml-auto">({groupStudentsCount} talaba)</span>
                      </label>
                    );
                  })
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Tanlandi: <strong className="text-blue-700">{selectedGroupIds.length} ta guruh</strong>
              </p>
            </div>

            {/* 2. Universitetdan amaliyot rahbari */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                2. Universitet amaliyot rahbari *
              </label>
              <select
                value={selectedSupervisorIds[0] || ''}
                onChange={e => {
                  const val = e.target.value;
                  setSelectedSupervisorIds(val ? [val] : []);
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium"
              >
                <option value="">Rahbarni tanlang...</option>
                {supervisors.map(sup => (
                  <option key={sup.id} value={sup.id}>
                    {sup.fullName} ({sup.academicDegree || 'Kafedra o\'qituvchisi'})
                  </option>
                ))}
              </select>

              <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600">
                {selectedSupervisorIds[0] ? (
                  <span>
                    Mas'ul: <strong className="text-slate-900">{supervisors.find(s => s.id === selectedSupervisorIds[0])?.fullName}</strong>
                  </span>
                ) : (
                  <span className="text-amber-700">Rahbar tanlanishi shart</span>
                )}
              </div>
            </div>

            {/* 3. Amaliyot tashkilotiga (bazaga) amaliyotga borishi */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                3. Amaliyot bazasi (Tashkilot) *
              </label>
              <select
                value={selectedPlaceIds[0] || ''}
                onChange={e => {
                  const val = e.target.value;
                  setSelectedPlaceIds(val ? [val] : []);
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium"
              >
                <option value="">Amaliyot bazasini tanlang...</option>
                {places.map(place => (
                  <option key={place.id} value={place.id}>
                    {place.name} [{place.organizationId || place.organizationCode || 'Tash-1'}]
                  </option>
                ))}
              </select>

              <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600">
                {selectedPlaceIds[0] ? (
                  (() => {
                    const selPlace = places.find(p => p.id === selectedPlaceIds[0]);
                    return (
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-900">{selPlace?.name}</div>
                        <div className="text-[10px] text-slate-500">
                          GPS: {selPlace?.latitude?.toFixed(4)}, {selPlace?.longitude?.toFixed(4)} · Radius: 300 m
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <span className="text-amber-700">Amaliyot bazasi tanlanishi shart</span>
                )}
              </div>
            </div>
          </div>

          {/* Live Link Summary & Info */}
          <div className="p-3 bg-white rounded-lg border border-blue-200 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-900">🔗 Tizimli bog'lanish:</span>
              <span>
                Tanlangan {selectedGroupIds.length} ta guruh talabalari avtomatik tarzda ushbu amaliyot bazasi va universitet rahbariga biriktiriladi.
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium shrink-0">
              Bo'limlarga taqsimot esa "Amaliyot taqsimoti" menyusida amalga oshiriladi.
            </span>
          </div>
        </div>

        {/* Order Number & Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Rektor buyrug'i raqami
            </label>
            <input
              type="text"
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value)}
              placeholder="BUYRUQ-№142/A"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Jami soat yuklamasi
            </label>
            <input
              type="number"
              value={totalHours}
              onChange={e => setTotalHours(Number(e.target.value))}
              placeholder="180"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Kredit miqdori
            </label>
            <input
              type="number"
              value={credits}
              onChange={e => setCredits(Number(e.target.value))}
              placeholder="6"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono"
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
            {practiceToEdit ? "O'zgarishlarni saqlash" : "Amaliyotni yaratish"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
