import React, { useState, useEffect } from 'react';
import {
  QrCode,
  CalendarCheck,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  LogOut,
  MapPin,
  Building2,
  Calendar,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Navigation,
  Compass
} from 'lucide-react';
import { Student, Practice, PracticeAssignment, Attendance, PracticePlace } from '../../../types';
import { storageService } from '../../../services/storageService';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { QrScannerModal } from './QrScannerModal';

interface StudentAttendanceViewProps {
  student: Student | null;
  onRefresh?: () => void;
}

export function StudentAttendanceView({ student, onRefresh }: StudentAttendanceViewProps) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'QR' | 'GPS'>('QR');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isConfirmingGps, setIsConfirmingGps] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // GPS state
  const [distanceMeters, setDistanceMeters] = useState<number>(0);
  const [isInsideGeofence, setIsInsideGeofence] = useState<boolean>(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);

  const todayDate = new Date().toISOString().split('T')[0];

  const practices = storageService.getPractices() || [];
  const places = storageService.getPracticePlaces() || [];
  const assignments = storageService.getAssignments() || [];
  const attendanceList = storageService.getAttendance() || [];

  const studentDetails = storageService.getStudentActivePracticeDetails(currentUser || student);
  const practice = studentDetails.practice || practices.find(p => p?.id === (studentDetails.assignment?.practiceId || student?.currentPracticeId));
  const assignment = studentDetails.assignment || (student ? assignments.find(a => a?.studentId === student.id) : null);
  const rawPlace = studentDetails.organization || places.find(p => p?.id === (assignment?.practicePlaceId || student?.currentPracticePlaceId));
  const place = rawPlace ? {
    ...rawPlace,
    latitude: rawPlace.latitude !== undefined ? rawPlace.latitude : 41.4682,
    longitude: rawPlace.longitude !== undefined ? rawPlace.longitude : 69.5824,
    allowedRadius: rawPlace.allowedRadius || 300
  } : null;

  const todayRecord = student
    ? attendanceList.find(a => a?.studentId === student.id && a?.date === todayDate)
    : undefined;

  const studentHistory = student
    ? attendanceList
        .filter(a => a?.studentId === student.id && (!practice || a?.practiceId === practice.id))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  function calcDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  // Geolocation check function (GPS yangilash)
  const handleRefreshGps = () => {
    if (!place?.latitude || !place?.longitude) {
      showToast('error', 'Koordinatalar mavjud emas', `Amaliyot bazasi (${place?.name || 'Tashkilot'}) uchun GPS koordinatalari kiritilmagan.`);
      setIsInsideGeofence(false);
      return;
    }

    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      showToast('error', 'Qo\'llab-quvvatlanmaydi', 'Brauzeringiz GPS geolokatsiyani qo\'llab-quvvatlamaydi.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setIsLocating(false);
        const uLat = pos.coords.latitude;
        const uLng = pos.coords.longitude;
        setCurrentCoords({ lat: uLat, lng: uLng });

        const placeLat = place.latitude!;
        const placeLng = place.longitude!;
        const allowedRadius = place.allowedRadius || 300; // 300m default limit

        const distM = calcDistanceMeters(uLat, uLng, placeLat, placeLng);
        setDistanceMeters(distM);
        const inside = distM <= allowedRadius;
        setIsInsideGeofence(inside);

        if (inside) {
          showToast('success', 'GPS tasdiqlandi!', `Amaliyot bazasi hududidasiz (${distM} metr). QR kodni skanerlash ruxsat etildi.`);
        } else {
          showToast('error', 'Hududdan tashqaridasiz', `Siz amaliyot bazasidan ${distM} metr uzoqdasiz. Skanerlash uchun 300 metr radiusda bo'lishingiz shart.`);
        }
      },
      err => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        setIsInsideGeofence(false);
        showToast('error', 'GPS xatoligi', 'Joylashuvni aniqlab bo\'lmadi. GPS ruxsatini va qurilma sozlamalarini tekshiring.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Initial check on mount
  useEffect(() => {
    if (place?.latitude && place?.longitude) {
      handleRefreshGps();
    }
  }, [place?.id]);

  const handleOpenScanner = () => {
    if (!isInsideGeofence) {
      showToast('warning', 'QR skaner bloklangan', `Siz amaliyot bazasi 300 metr radiusida emassiz (Masofa: ${distanceMeters} m). Skanerlash uchun avval GPS ni yangilang.`);
      return;
    }
    setIsScannerOpen(true);
  };

  if (!student) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
        <p className="text-sm font-bold text-slate-800">Talaba ma'lumotlari topilmadi</p>
        <p className="text-xs text-slate-500 mt-1">Tizimda mos talaba profili mavjud emas yoki hali tanlanmagan.</p>
      </div>
    );
  }

  // Handle GPS attendance confirmation
  const handleConfirmGpsAttendance = async () => {
    if (!place?.latitude || !place?.longitude) {
      showToast('error', 'Koordinatalar mavjud emas', `Amaliyot bazasi (${place?.name || 'Tashkilot'}) uchun GPS koordinatalari kiritilmagan.`);
      return;
    }

    if (!currentCoords) {
      showToast('error', 'GPS xatoligi', 'Sizning joriy koordinatalaringiz aniqlanmadi. Iltimos GPS ruxsatini tekshiring.');
      return;
    }

    const allowedRadius = place.allowedRadius || 300;
    if (!isInsideGeofence || distanceMeters > allowedRadius) {
      showToast('error', 'Hududdan tashqarida', `Siz amaliyot tashkilotidan ${distanceMeters} metr uzoqdasiz. Ruxsat etilgan radius: ${allowedRadius} metr.`);
      return;
    }

    setIsConfirmingGps(true);
    try {
      const res = storageService.recordGPSAttendance({
        studentId: student.id,
        latitude: currentCoords.lat,
        longitude: currentCoords.lng
      });

      if (res.success) {
        showToast('success', 'Davomat tasdiqlandi!', `GPS orqali kelganlik qayd etildi (${distanceMeters} metr masofada).`);
        if (onRefresh) onRefresh();
      } else {
        showToast('warning', 'Eslatma', res.error || 'Davomat allaqachon qayd etilgan.');
      }
    } catch (e: any) {
      showToast('error', 'Xatolik', e.message || 'Davomatni qayd etishda xatolik');
    } finally {
      setIsConfirmingGps(false);
    }
  };

  const handleCheckOut = () => {
    if (!todayRecord) return;
    const res = storageService.recordCheckOut(todayRecord.id, currentUser?.uid || student.id, 'STUDENT');
    if (res.success) {
      showToast('success', 'Ketish qayd etildi', `Vaqt: ${res.attendance?.checkOutTime}`);
      if (onRefresh) onRefresh();
    } else {
      showToast('error', 'Xatolik', res.error || 'Check-out qilib bo\'lmadi');
    }
  };

  const isPresent = (st?: string) => st?.toUpperCase() === 'PRESENT';
  const isLate = (st?: string) => st?.toUpperCase() === 'LATE';
  const isAbsent = (st?: string) => st?.toUpperCase() === 'ABSENT';
  const isExcused = (st?: string) => st?.toUpperCase() === 'EXCUSED';

  const totalDays = studentHistory.length;
  const presentCount = studentHistory.filter(a => isPresent(a.status)).length;
  const lateCount = studentHistory.filter(a => isLate(a.status)).length;
  const absentCount = studentHistory.filter(a => isAbsent(a.status)).length;
  const excusedCount = studentHistory.filter(a => isExcused(a.status)).length;
  const attendancePercent = totalDays > 0 
    ? Math.round(((presentCount + lateCount + excusedCount) / totalDays) * 100) 
    : 0;

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* 10. Header: Bugungi davomat */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
              Mobil davomat
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Bugungi davomat
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Amaliyot bazasi: <strong className="text-slate-800">{place?.name || 'Amaliyot bazasi'}</strong> · Bo'lim: <strong className="text-blue-700">{assignment?.department || 'Biriktirilmagan (Taqsimot kutilmoqda)'}</strong>
            </p>
          </div>

          {/* Today Date Badge */}
          <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-mono text-xs font-bold self-start sm:self-auto">
            {todayDate}
          </span>
        </div>

        {/* Tab: QR / GPS */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl w-full max-w-xs">
          <button
            type="button"
            onClick={() => setActiveTab('QR')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'QR'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QR</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('GPS')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'GPS'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>GPS</span>
          </button>
        </div>

        {/* Tab 1: QR Content */}
        {activeTab === 'QR' && (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white mx-auto flex items-center justify-center shadow-md">
              <QrCode className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Amaliyot bazasi QR Kodini Skanerlash
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Amaliyot bazasida o‘rnatilgan QR kodni kamerangiz orqali skanerlang. Skanerlash uchun bazadan 300 metr radiusda bo‘lishingiz shart.
              </p>
            </div>

            {!isInsideGeofence && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium max-w-md mx-auto flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>QR skaner bloklangan: Siz amaliyot bazasidan {distanceMeters} metr uzoqdasiz (300m talab qilinadi).</span>
              </div>
            )}

            <div>
              <button
                type="button"
                onClick={handleOpenScanner}
                className={`w-full sm:w-auto px-8 py-3.5 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center justify-center gap-2 ${
                  isInsideGeofence
                    ? 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-600/20'
                    : 'bg-slate-400 hover:bg-slate-500 cursor-not-allowed'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>{isInsideGeofence ? 'QR SKANERLASH' : 'QR SKANER (BLOKLANGAN)'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: GPS Content */}
        {activeTab === 'GPS' && (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50 border border-slate-200 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-md">
              <Compass className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                GPS Geofencing Nazorati (300m radius)
              </h2>
              <p className="text-sm font-mono font-bold text-slate-700 mt-1">
                Amaliyot bazasigacha masofa: <span className="text-blue-600">{distanceMeters} metr</span>
              </p>
            </div>

            {/* Status indicator */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider border">
              {isInsideGeofence ? (
                <span className="text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-xl border border-emerald-300">
                  🟢 Amaliyot bazasi hududidasiz (300m ichida)
                </span>
              ) : (
                <span className="text-rose-700 bg-rose-100/80 px-3 py-1 rounded-xl border border-rose-300">
                  🔴 Amaliyot bazasidan uzoqdasiz (&gt;300m)
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                disabled={isLocating}
                onClick={handleRefreshGps}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Aniqlanmoqda...' : 'GPS NI YANGILASH'}</span>
              </button>

              <button
                type="button"
                disabled={isConfirmingGps || !isInsideGeofence || Boolean(todayRecord?.checkInTime)}
                onClick={handleConfirmGpsAttendance}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
              >
                {isConfirmingGps ? (
                  <span>Tasdiqlanmoqda...</span>
                ) : todayRecord?.checkInTime ? (
                  <span>Bugun tasdiqlangan</span>
                ) : (
                  <span>[GPS ORQALI KELISH]</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Today's Status Details */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Holat</span>
            <span className={`font-bold mt-0.5 block ${todayRecord ? 'text-emerald-600' : 'text-slate-500'}`}>
              {todayRecord ? (todayRecord.status === 'LATE' ? 'Kechikkan' : 'Kelgan') : 'Qayd etilmagan'}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Kelish vaqti</span>
            <span className="font-mono font-bold text-slate-800 mt-0.5 block">
              {todayRecord?.checkInTime || '—'}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Ketish vaqti</span>
            <span className="font-mono font-bold text-slate-800 mt-0.5 block">
              {todayRecord?.checkOutTime || '—'}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Usul</span>
            <span className="font-mono font-bold text-blue-600 mt-0.5 block">
              {todayRecord?.attendanceMethod || 'QR / GPS'}
            </span>
          </div>
        </div>

        {/* Check-Out Action if checked-in but not checked out */}
        {todayRecord?.checkInTime && !todayRecord?.checkOutTime && (
          <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs">
            <span className="text-amber-900 font-medium">
              Siz soat {todayRecord.checkInTime} da kelgansiz. Amaliyot tugagach, ketishni qayd eting:
            </span>
            <button
              type="button"
              onClick={handleCheckOut}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white font-bold rounded-lg shadow-xs hover:bg-amber-700 transition-colors shrink-0 ml-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Check-out</span>
            </button>
          </div>
        )}
      </div>

      {/* Davomatim · Amaliyot monitoringi statistics */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
          Davomat monitoringi ko‘rsatkichlari
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Jami kunlar</span>
            <span className="text-xl font-black font-mono text-slate-900 mt-0.5 block">{totalDays}</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-700 uppercase block">Kelgan</span>
            <span className="text-xl font-black font-mono text-emerald-800 mt-0.5 block">{presentCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-[10px] font-bold text-amber-700 uppercase block">Kechikkan</span>
            <span className="text-xl font-black font-mono text-amber-800 mt-0.5 block">{lateCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
            <span className="text-[10px] font-bold text-rose-700 uppercase block">Kelmagan</span>
            <span className="text-xl font-black font-mono text-rose-800 mt-0.5 block">{absentCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-blue-700 uppercase block">Davomat %</span>
            <span className="text-xl font-black font-mono text-blue-800 mt-0.5 block">{attendancePercent}%</span>
          </div>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Sana</th>
                <th className="py-2.5 px-3">Joy</th>
                <th className="py-2.5 px-3">Kelish</th>
                <th className="py-2.5 px-3">Ketish</th>
                <th className="py-2.5 px-3">Holat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentHistory.map(rec => {
                const recPlace = places.find(p => p.id === rec.practicePlaceId) || place;
                const st = rec.status.toUpperCase();
                return (
                  <tr key={rec.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-900">{rec.date}</td>
                    <td className="py-2.5 px-3 text-slate-700 truncate max-w-[150px]">{recPlace?.name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-800">{rec.checkInTime || '—'}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-800">{rec.checkOutTime || '—'}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        st === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' :
                        st === 'LATE' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {st === 'PRESENT' ? 'Kelgan' : st === 'LATE' ? 'Kechikkan' : 'Kelmagan'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        studentId={student.id}
        onSuccess={() => {
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
}
