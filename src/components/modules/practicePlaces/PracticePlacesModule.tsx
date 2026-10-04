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
  Navigation
} from 'lucide-react';
import { PracticePlace, PracticePlaceType } from '../../../types';
import { organizationService, getNextOrganizationId } from '../../../services/organizationService';
import { useToast } from '../../../context/ToastContext';
import { Modal } from '../../common/Modal';
import { ConfirmDialog } from '../../common/ConfirmDialog';
import { EmptyState } from '../../common/EmptyState';

export function PracticePlacesModule() {
  const { showToast } = useToast();
  const [places, setPlaces] = useState<PracticePlace[]>([]);
  
  useEffect(() => {
    organizationService.getOrganizations().then(setPlaces);
  }, []);
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
    } else {
      await organizationService.createOrganization(place as Omit<PracticePlace, 'id'>);
    }
    refreshList();
    setIsModalOpen(false);
    showToast('success', 'Amaliyot joyi saqlandi', `${place.name} (${finalOrgId})`);
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
            Amaliyot joylari va klinik bazalar
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Universitet bilan rasmiy hamkorlik shartnomasiga ega bo'lgan shifoxonalar va tibbiyot muassasalari
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setPlaceToEdit(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi amaliyot joyi</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Shifoxona nomi, manzili yoki mas'ul shaxs..."
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
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
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
          title="Amaliyot joyi topilmadi"
          description="Kiritilgan parametrlar bo'yicha tibbiyot bazalari mavjud emas."
          actionLabel="+ Yangi baza qo'shish"
          onAction={() => setIsModalOpen(true)}
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
        title={placeToEdit ? "Klinik bazani tahrirlash" : "Yangi amaliyot joyi qo'shish"}
        subtitle="Universitet amaliyot bazalari reestriga kiritish"
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tashkilot ID *</label>
              <input type="text" name="organizationId" required defaultValue={placeToEdit?.organizationId || ''} placeholder="TASH-000001" className="w-full px-3 py-2 text-xs border rounded-lg font-mono" />
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
        title="Amaliyot joyini o'chirish"
        message={`Haqiqatan ham "${placeToDelete?.name}" bazasini o'chirmoqchimisiz?`}
        confirmLabel="O'chirish"
        cancelLabel="Bekor qilish"
        isDestructive
      />
    </div>
  );
}
