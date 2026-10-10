import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Users,
  Search,
  FileCheck,
  Crosshair,
  Compass,
  ShieldCheck,
  Navigation,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { PracticePlace, PracticePlaceType } from '../../../types';
import { organizationService, getNextOrganizationId } from '../../../services/organizationService';
import { practiceAssignmentService } from '../../../services/practiceAssignmentService';
import { useToast } from '../../../context/ToastContext';
import { Modal } from '../../common/Modal';
import { ConfirmDialog } from '../../common/ConfirmDialog';
import { EmptyState } from '../../common/EmptyState';
import { useAuth } from '../../../context/AuthContext';

export function PracticePlacesModule() {
  const { showToast } = useToast();
  const { canonicalRole, currentUser } = useAuth();
  const [places, setPlaces] = useState<PracticePlace[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      const allPlaces = await organizationService.getOrganizations();
      if (canonicalRole === 'PRACTICE_SUPERVISOR') {
        const supervisorId = currentUser?.supervisorId;
        if (supervisorId) {
          const assignments = await practiceAssignmentService.getPracticeAssignmentsBySupervisor(supervisorId);
          const supervisorPlaceIds = new Set(assignments.map(a => a.practicePlaceId));
          setPlaces(allPlaces.filter(p => supervisorPlaceIds.has(p.id)));
        } else {
          setPlaces([]);
        }
      } else {
        setPlaces(allPlaces);
      }
    };
    fetchData();
  }, [canonicalRole, currentUser]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const [placeToEdit, setPlaceToEdit] = useState<PracticePlace | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [placeToDelete, setPlaceToDelete] = useState<PracticePlace | null>(null);

  // Form states for Sequential ID and GPS
  const [assignedOrgId, setAssignedOrgId] = useState<string>('');
  const [modalLat, setModalLat] = useState<string>('41.2995');
  const [modalLng, setModalLng] = useState<string>('69.2401');
  const [modalRadius, setModalRadius] = useState<number>(200);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Success dialog after creating an organization with its assigned ID
  const [createdPlaceConfirmation, setCreatedPlaceConfirmation] = useState<{
    place: PracticePlace;
    orgId: string;
  } | null>(null);

  const refreshList = async () => {
    const data = await organizationService.getOrganizations();
    setPlaces(data);
  };

  const handleOpenAddModal = () => {
    const nextId = getNextOrganizationId(places);
    setPlaceToEdit(null);
    setAssignedOrgId(nextId);
    setModalLat('41.2995');
    setModalLng('69.2401');
    setModalRadius(200);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: PracticePlace) => {
    setPlaceToEdit(p);
    setAssignedOrgId(p.organizationId || p.organizationCode || p.id);
    setModalLat(String(p.latitude ?? 41.2995));
    setModalLng(String(p.longitude ?? 69.2401));
    setModalRadius(p.allowedRadius ?? 200);
    setIsModalOpen(true);
  };

  const handleDetectGPS = () => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        pos => {
          setModalLat(pos.coords.latitude.toFixed(6));
          setModalLng(pos.coords.longitude.toFixed(6));
          setIsLocating(false);
          showToast('success', 'GPS aniqlandi', `Kenglik: ${pos.coords.latitude.toFixed(5)}, Uzunlik: ${pos.coords.longitude.toFixed(5)}`);
        },
        err => {
          console.warn('Geolocation lookup failed:', err);
          setIsLocating(false);
          showToast('warning', 'GPS xatoligi', 'Brauzerdan geolokatsiyani olish imkoni bo\'lmadi. Koordinatalarni qo\'lda kiritishingiz mumkin.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      showToast('error', 'GPS mavjud emas', 'Qurilmada geolokatsiya qo\'llab-quvvatlanmaydi');
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const deptsRaw = (formData.get('departments') as string) || '';
    const departments = deptsRaw.split(',').map(s => s.trim()).filter(Boolean);

    const latVal = parseFloat(modalLat);
    const lngVal = parseFloat(modalLng);
    const radiusVal = Number(formData.get('allowedRadius')) || modalRadius || 200;

    const finalOrgId = assignedOrgId || (formData.get('organizationId') as string) || getNextOrganizationId(places);

    const place = {
      id: placeToEdit?.id || 'new',
      organizationId: finalOrgId,
      organizationCode: finalOrgId,
      name: formData.get('name') as string,
      type: formData.get('type') as PracticePlaceType,
      city: formData.get('city') as string,
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      capacity: Number(formData.get('capacity')) || 30,
      activeStudentsCount: placeToEdit?.activeStudentsCount || 0,
      contactPerson: formData.get('contactPerson') as string,
      contactPhone: formData.get('contactPhone') as string,
      departments: departments,
      contractNumber: formData.get('contractNumber') as string,
      contractDate: (formData.get('contractDate') as string) || '2025-01-10',
      contractExpiryDate: (formData.get('contractExpiryDate') as string) || '2026-12-31',
      latitude: !isNaN(latVal) ? latVal : 41.2995,
      longitude: !isNaN(lngVal) ? lngVal : 69.2401,
      allowedRadius: radiusVal
    };

    if (placeToEdit) {
      await organizationService.updateOrganization(placeToEdit.id, place as Partial<PracticePlace>);
      showToast('success', 'Amaliyot joyi saqlandi', `${place.name} (${finalOrgId})`);
    } else {
      await organizationService.createOrganization(place as Omit<PracticePlace, 'id'>);
      setCreatedPlaceConfirmation({
        place: place as PracticePlace,
        orgId: finalOrgId
      });
      showToast('success', 'Tashkilot yaratildi!', `Ushbu tashkilot uchun ${finalOrgId} raqami biriktirildi.`);
    }
    refreshList();
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!placeToDelete) return;
    await organizationService.softDeleteOrganization(placeToDelete.id);
    refreshList();
    showToast('info', 'O\'chirildi', `${placeToDelete.name} bazasi olib tashlandi.`);
    setPlaceToDelete(null);
  };

  const filteredPlaces = places.filter(p => {
    if (filterType !== 'all' && p.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchAddress = p.address.toLowerCase().includes(q);
      const matchContact = p.contactPerson.toLowerCase().includes(q);
      if (!matchName && !matchAddress && !matchContact) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Amaliyot bazalari
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Universitet bilan rasmiy hamkorlik shartnomasiga ega bo'lgan klinik bazalar, shifoxonalar va tibbiyot muassasalari
          </p>
        </div>

        {(canonicalRole === 'SUPER_ADMIN' || canonicalRole === 'PRACTICE_HEAD') && (
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi amaliyot bazasi</span>
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Baza nomi, manzili yoki mas'ul shaxs..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50/50 focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'Barchasi' },
            { id: 'Shifoxona', label: 'Shifoxonalar' },
            { id: 'Ilmiy Markaz', label: 'Ilmiy markazlar' },
            { id: 'Poliklinika', label: 'Poliklinikalar' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                filterType === tab.id
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Practice Places Grid */}
      {filteredPlaces.length === 0 ? (
        <EmptyState
          title="Amaliyot bazasi topilmadi"
          description="Kiritilgan parametrlar bo'yicha amaliyot bazalari mavjud emas."
          actionLabel="+ Yangi baza qo'shish"
          onAction={handleOpenAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPlaces.map(place => {
            const usagePercent = Math.min(Math.round((place.activeStudentsCount / place.capacity) * 100), 100);

            return (
              <div
                key={place.id}
                className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {place.type}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setPlaceToEdit(place);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
                        title="Tahrirlash"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPlaceToDelete(place)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-md"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {place.name}
                  </h3>

                  <div className="mt-2 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{place.city}, {place.address}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{place.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Mas'ul: <strong className="text-slate-800">{place.contactPerson}</strong> ({place.contactPhone})</span>
                    </div>
                  </div>

                  {/* Departments */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {place.departments.map((dept, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium">
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Capacity & Contract Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700">Talaba kvotasi bandligi</span>
                    <span className="font-mono tabular-nums font-bold text-slate-900">
                      {place.activeStudentsCount} / {place.capacity} talaba ({usagePercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        usagePercent > 85 ? 'bg-red-500' : usagePercent > 60 ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Shartnoma: {place.contractNumber}</span>
                    <span>Muddati: {place.contractExpiryDate} gacha</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Place Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={placeToEdit ? "Amaliyot bazasini tahrirlash" : "Yangi amaliyot bazasi qo'shish"}
        subtitle="Universitet amaliyot bazalari reestriga kiritish"
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-3">
          {!placeToEdit && (
            <div className="p-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-950">Tizim tomonidan avtomatik beriladigan raqam (ID):</span>
                    <span className="font-mono font-black text-sm px-2.5 py-0.5 bg-white text-emerald-800 border border-emerald-300 rounded-md shadow-2xs">
                      {assignedOrgId}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Tashkilot yaratilgan paytda tizim ushbu raqam biriktirilganligini avtomatik tasdiqlaydi.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tashkilot ID *</label>
              <input
                type="text"
                name="organizationId"
                required
                defaultValue={placeToEdit ? (placeToEdit.organizationId || placeToEdit.id) : assignedOrgId}
                placeholder="TASH-000001"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono font-bold bg-slate-50 text-slate-900 focus:bg-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Muassasa nomi *</label>
              <input type="text" name="name" required defaultValue={placeToEdit?.name || ''} placeholder="Masalan: 1-son Respublika Klinik Shifoxonasi" className="w-full px-3 py-2 text-xs border rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Turi</label>
              <select name="type" defaultValue={placeToEdit?.type || 'Shifoxona'} className="w-full px-3 py-2 text-xs border rounded-lg">
                <option value="Shifoxona">Shifoxona</option>
                <option value="Ilmiy Markaz">Ilmiy Markaz</option>
                <option value="Poliklinika">Poliklinika</option>
                <option value="Klinika">Klinika</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Shahar / Viloyat</label>
              <input type="text" name="city" defaultValue={placeToEdit?.city || 'Toshkent shahri'} className="w-full px-3 py-2 text-xs border rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Aniq manzil</label>
              <input type="text" name="address" defaultValue={placeToEdit?.address || ''} placeholder="Chilonzor tumani, 103-uy" className="w-full px-3 py-2 text-xs border rounded-lg" />
            </div>
          </div>

          {/* GPS Coordinates & Geolocation Radius Section */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Tashkilot GPS Koordinatalari va Geolokatsiya Radiusi</span>
              </span>
              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={isLocating}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg transition-colors shadow-2xs"
              >
                <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Aniqlanmoqda...' : '📍 Joriy GPS joylashuvni aniqlash'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">GPS Kenglik (Latitude)</label>
                <input
                  type="number"
                  step="any"
                  value={modalLat}
                  onChange={e => setModalLat(e.target.value)}
                  placeholder="41.2995"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">GPS Uzunlik (Longitude)</label>
                <input
                  type="number"
                  step="any"
                  value={modalLng}
                  onChange={e => setModalLng(e.target.value)}
                  placeholder="69.2401"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Ruxsat radiusi (metrda)</label>
                <input
                  type="number"
                  name="allowedRadius"
                  value={modalRadius}
                  onChange={e => setModalRadius(Number(e.target.value))}
                  placeholder="200"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-white"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Talabalar ushbu tashkilotda davomatdan o'tayotganida, ularning geolokatsiyasi ushbu GPS koordinatasi va belgilangan radius ({modalRadius} metr) bilan avtomatik tekshiriladi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Telefon</label>
              <input type="text" name="phone" defaultValue={placeToEdit?.phone || '+998 (71) '} className="w-full px-3 py-2 text-xs border rounded-lg font-mono" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input type="email" name="email" defaultValue={placeToEdit?.email || ''} className="w-full px-3 py-2 text-xs border rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sig'im (Kvota talaba)</label>
              <input type="number" name="capacity" defaultValue={placeToEdit?.capacity || 40} className="w-full px-3 py-2 text-xs border rounded-lg font-mono" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mas'ul shaxs (F.I.Sh.)</label>
              <input type="text" name="contactPerson" defaultValue={placeToEdit?.contactPerson || ''} placeholder="Dr. Karimov Rustam" className="w-full px-3 py-2 text-xs border rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mas'ul telefoni</label>
              <input type="text" name="contactPhone" defaultValue={placeToEdit?.contactPhone || '+998 (90) '} className="w-full px-3 py-2 text-xs border rounded-lg font-mono" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Bo'limlar (vergul bilan ajrating)</label>
            <input
              type="text"
              name="departments"
              defaultValue={placeToEdit?.departments?.join(', ') || 'Terapiya, Umumiy xirurgiya, Kardiologiya, Reanimatsiya'}
              className="w-full px-3 py-2 text-xs border rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Shartnoma raqami</label>
              <input type="text" name="contractNumber" defaultValue={placeToEdit?.contractNumber || 'SH-2025/114'} className="w-full px-3 py-2 text-xs border rounded-lg font-mono" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tuzilgan sana</label>
              <input type="date" name="contractDate" defaultValue={placeToEdit?.contractDate || '2025-01-10'} className="w-full px-3 py-2 text-xs border rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Amal qilish muddati</label>
              <input type="date" name="contractExpiryDate" defaultValue={placeToEdit?.contractExpiryDate || '2026-12-31'} className="w-full px-3 py-2 text-xs border rounded-lg" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">Bekor qilish</button>
            <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Saqlash</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={Boolean(placeToDelete)}
        onClose={() => setPlaceToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Amaliyot bazasini o'chirish"
        message={`Haqiqatan ham "${placeToDelete?.name}" amaliyot bazasini o'chirmoqchimisiz?`}
        confirmLabel="O'chirish"
        cancelLabel="Bekor qilish"
        isDestructive
      />

      {/* Organization Created & Auto-ID Assigned Confirmation Modal */}
      {createdPlaceConfirmation && (
        <Modal
          isOpen={!!createdPlaceConfirmation}
          onClose={() => setCreatedPlaceConfirmation(null)}
          title="Tashkilot Muvaffaqiyatli Ro'yxatga Olindi"
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Tashkilot tizimda muvaffaqiyatli shakllantirildi!
              </h4>
              <p className="text-xs text-slate-500">
                Tizim tomonidan mazkur amaliyot tashkiloti uchun quyidagi rasmiy raqam avtomatik tarzda biriktirildi:
              </p>
            </div>

            {/* Official Assigned ID Card */}
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-200/80">
                <div>
                  <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                    Tizim biriktirgan rasmiy raqam (ID):
                  </span>
                  <span className="text-[11px] text-emerald-700">Tashkilotning unikal identifikatori</span>
                </div>
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <span className="font-mono font-black text-lg text-emerald-900 bg-white px-3.5 py-1 rounded-xl border border-emerald-400 shadow-2xs">
                    {createdPlaceConfirmation.orgId}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdPlaceConfirmation.orgId);
                      showToast('success', 'Nusxalandi', `${createdPlaceConfirmation.orgId} nusxalab olindi`);
                    }}
                    className="p-2 bg-white hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-300 transition-colors shadow-2xs"
                    title="Raqamdan nusxa olish"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
                <div>
                  <span className="text-[11px] text-slate-500 block">Tashkilot nomi:</span>
                  <span className="font-bold text-slate-900">{createdPlaceConfirmation.place.name}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Muassasa turi:</span>
                  <span className="font-semibold text-slate-800">{createdPlaceConfirmation.place.type}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Shahar va Manzil:</span>
                  <span className="font-medium text-slate-800">{createdPlaceConfirmation.place.city}, {createdPlaceConfirmation.place.address}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Mas'ul shaxs:</span>
                  <span className="font-medium text-slate-800">{createdPlaceConfirmation.place.contactPerson} ({createdPlaceConfirmation.place.contactPhone})</span>
                </div>
                <div className="sm:col-span-2 pt-1 border-t border-emerald-200/50 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[11px] text-slate-600">
                      GPS Koordinatalari: <strong className="font-mono text-slate-800">{createdPlaceConfirmation.place.latitude?.toFixed(4)}, {createdPlaceConfirmation.place.longitude?.toFixed(4)}</strong>
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                    Ruxsat etilgan radius: {createdPlaceConfirmation.place.allowedRadius || 200} metr
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Avtomatik biriktiruv va GPS nazorati faollashtirildi
              </p>
              <p>
                Ushbu <strong>{createdPlaceConfirmation.orgId}</strong> raqami orqali talabalar amaliyotga biriktiriladi. Talabalar amaliyotga kelib davomatdan o'tganda, ularning geolokatsiyasi ushbu tashkilot koordinatalari bilan solishtirilib, <strong>{createdPlaceConfirmation.place.allowedRadius || 200} metr</strong> radius ichida tekshiriladi.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const text = `Tashkilot: ${createdPlaceConfirmation.place.name}\nRasmiy ID: ${createdPlaceConfirmation.orgId}\nTuri: ${createdPlaceConfirmation.place.type}\nManzil: ${createdPlaceConfirmation.place.city}, ${createdPlaceConfirmation.place.address}\nGPS: ${createdPlaceConfirmation.place.latitude}, ${createdPlaceConfirmation.place.longitude} (Radius: ${createdPlaceConfirmation.place.allowedRadius || 200}m)\nMas'ul: ${createdPlaceConfirmation.place.contactPerson} (${createdPlaceConfirmation.place.contactPhone})`;
                  navigator.clipboard.writeText(text);
                  showToast('success', 'Nusxalandi', 'Barcha tashkilot ma\'lumotlari xotiraga nusxalandi');
                }}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Barcha ma'lumotlarni nusxalash</span>
              </button>

              <button
                type="button"
                onClick={() => setCreatedPlaceConfirmation(null)}
                className="w-full sm:w-auto px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
              >
                Tushunarli
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
