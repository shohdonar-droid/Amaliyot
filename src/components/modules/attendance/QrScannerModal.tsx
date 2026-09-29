import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPin,
  RefreshCw,
  Clock,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Check,
  Building2,
  Info
} from 'lucide-react';
import { Attendance, AttendanceSession } from '../../../types';
import { storageService } from '../../../services/storageService';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { Modal } from '../../common/Modal';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  onSuccess?: (attendance: Attendance) => void;
}

export function QrScannerModal({
  isOpen,
  onClose,
  studentId,
  onSuccess
}: QrScannerModalProps) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(true);

  // Geolocation state
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<'prompt' | 'granted' | 'denied' | 'unavailable'>('prompt');
  const [geoAccuracy, setGeoAccuracy] = useState<number | null>(null);

  // Result state
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    title: string;
    message: string;
    attendance?: Attendance;
    distanceMeters?: number;
    allowedRadius?: number;
    errorType?: string;
    alreadyRecorded?: boolean;
  } | null>(null);

  // Manual code input fallback (great for dev/desktop testing)
  const [manualToken, setManualToken] = useState('');
  const [activeSessions, setActiveSessions] = useState<AttendanceSession[]>([]);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = 'qr-reader-viewfinder';

  // Fetch active sessions for quick simulation selector
  useEffect(() => {
    if (isOpen) {
      setActiveSessions(storageService.getAttendanceSessions().filter(s => s.status === 'ACTIVE'));
      acquireGeolocation();
    }
  }, [isOpen]);

  // Request GPS
  const acquireGeolocation = () => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
          setGeoAccuracy(Math.round(pos.coords.accuracy));
          setGeoStatus('granted');
        },
        err => {
          console.warn('Geolocation error or denied', err);
          setGeoStatus('denied');
          // For development/demo convenience: default to Tashkent clinic coordinates if denied
          setCoords({
            latitude: 41.2995,
            longitude: 69.2401
          });
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
      );
    } else {
      setGeoStatus('unavailable');
    }
  };

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    setScanResult(null);
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(readerElementId);
      }

      const qrCode = html5QrCodeRef.current;
      await qrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          handleProcessPayload(decodedText);
        },
        () => {
          // ignore scan frame errors
        }
      );
      setScanning(true);
    } catch (err: any) {
      console.warn('Camera failed to start', err);
      setHasCamera(false);
      setCameraError('Kamera ochilmadi yoki ruxsat berilmadi. Quyidagi test / qo\'lda kiritish usulidan foydalanishingiz mumkin.');
      setScanning(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && scanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Error stopping camera', err);
      }
      setScanning(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Short delay to allow DOM element to render
      const t = setTimeout(() => {
        startCamera();
      }, 300);
      return () => {
        clearTimeout(t);
        stopCamera();
      };
    } else {
      stopCamera();
      setScanResult(null);
      setManualToken('');
    }
  }, [isOpen]);

  const handleProcessPayload = (payload: string) => {
    stopCamera();

    const result = storageService.validateAndRecordQRAttendance({
      studentId,
      qrPayload: payload,
      latitude: coords?.latitude,
      longitude: coords?.longitude,
      deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'Mobile Browser'
    });

    if (result.success && result.attendance) {
      setScanResult({
        success: true,
        title: 'BUGUNGI DAVOMATINGIZ MUVAFFAQIYATLI QAYD ETILDI',
        message: `Vaqt: ${result.attendance.checkInTime} · Holat: ${result.attendance.status === 'LATE' ? 'Kechikkan' : 'Kelgan'}`,
        attendance: result.attendance
      });
      showToast('success', 'Muvaffaqiyatli!', 'Davomatingiz tizimga kiritildi');
      if (onSuccess) onSuccess(result.attendance);
    } else {
      setScanResult({
        success: false,
        title: 'Davomat qabul qilinmadi',
        message: result.error || 'Noma\'lum xatolik',
        errorType: result.error,
        alreadyRecorded: result.alreadyRecorded,
        attendance: result.attendance,
        distanceMeters: (result.details as any)?.distanceMeters,
        allowedRadius: (result.details as any)?.allowedRadius
      });
      showToast('error', 'Rad etildi', result.error || 'Xatolik yuz berdi');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    handleProcessPayload(manualToken.trim());
  };

  const handleQuickSessionClick = (session: AttendanceSession) => {
    handleProcessPayload(session.token);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        stopCamera();
        onClose();
      }}
      title="Mobil QR Davomat Skaneri"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Geolocation status bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border rounded-xl text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <MapPin className={`w-4 h-4 ${geoStatus === 'granted' ? 'text-emerald-600' : 'text-amber-500'}`} />
            <span>
              {geoStatus === 'granted' ? (
                <>GPS faol: <span className="font-mono text-emerald-700 font-semibold">{coords?.latitude.toFixed(4)}, {coords?.longitude.toFixed(4)}</span> (aniqlik: ~{geoAccuracy}m)</>
              ) : geoStatus === 'denied' ? (
                <span className="text-amber-700 font-medium">GPS o'chirilgan (standart baza koordinatalari qo'llanadi)</span>
              ) : (
                <span className="text-slate-500">GPS tekshirilmoqda...</span>
              )}
            </span>
          </div>
          <button
            type="button"
            onClick={acquireGeolocation}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
          >
            Yangilash
          </button>
        </div>

        {/* Result banner if already processed */}
        {scanResult ? (
          <div className={`p-5 rounded-2xl border text-center space-y-3 ${
            scanResult.success
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
              : 'bg-red-50/80 border-red-300 text-red-950'
          }`}>
            <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center shadow-md animate-bounce">
              {scanResult.success ? (
                <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              ) : (
                <div className="w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center">
                  <XCircle className="w-8 h-8" />
                </div>
              )}
            </div>

            <div>
              <h3 className="text-base font-bold">
                {scanResult.title}
              </h3>
              <p className={`text-xs mt-1 font-medium ${scanResult.success ? 'text-emerald-700' : 'text-red-700'}`}>
                {scanResult.message}
              </p>
            </div>

            {scanResult.attendance && (
              <div className="bg-white/80 border rounded-xl p-3 text-xs text-left space-y-1.5 shadow-2xs font-sans">
                <div className="flex justify-between">
                  <span className="text-slate-500">Sana:</span>
                  <span className="font-semibold font-mono">{scanResult.attendance.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kelish vaqti:</span>
                  <span className="font-semibold font-mono text-emerald-700">{scanResult.attendance.checkInTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Holati:</span>
                  <span className={`font-bold ${scanResult.attendance.status === 'LATE' ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {scanResult.attendance.status === 'LATE' ? 'KECHIKKAN' : 'KELGAN (PRESENT)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tekshirdi:</span>
                  <span className="font-medium text-slate-700">{scanResult.attendance.verifiedBy || 'QR Tizimi'}</span>
                </div>
              </div>
            )}

            {scanResult.distanceMeters && (
              <p className="text-[11px] text-red-600 font-mono">
                Siz amaliyot markazidan {scanResult.distanceMeters} metr uzoqdasiz (ruxsat etilgan: {scanResult.allowedRadius} metr).
              </p>
            )}

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setScanResult(null);
                  startCamera();
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-white hover:bg-slate-900 shadow-xs"
              >
                Qayta skanerlash
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700"
              >
                Yopish
              </button>
            </div>
          </div>
        ) : (
          /* Viewfinder camera view */
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl bg-black border-2 border-slate-700 min-h-[280px] flex flex-col items-center justify-center">
              <div id={readerElementId} className="w-full max-w-[320px] aspect-square" />

              {!scanning && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-white p-4 text-center">
                  <Camera className="w-10 h-10 text-blue-400 mb-2 animate-pulse" />
                  <p className="text-xs font-semibold">Kamera ishga tushirilmoqda...</p>
                  <p className="text-[11px] text-slate-400 mt-1">Brauzerda kameraga ruxsat bering</p>
                </div>
              )}

              {cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 text-white p-5 text-center">
                  <Smartphone className="w-10 h-10 text-amber-400 mb-2" />
                  <p className="text-xs font-semibold text-amber-300">Kamera ochilmadi</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs">{cameraError}</p>
                </div>
              )}
            </div>

            {/* Quick Simulation Bar (Section 24: Test and Dev selector) */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tezkor test / Faol QR Sessiyalar ({activeSessions.length})</span>
                </span>
                <span className="text-[10px] text-blue-600 font-mono">Kamerasiz sinash</span>
              </div>

              {activeSessions.length > 0 ? (
                <div className="space-y-1.5">
                  {activeSessions.map(sess => (
                    <button
                      key={sess.id}
                      type="button"
                      onClick={() => handleQuickSessionClick(sess)}
                      className="w-full flex items-center justify-between p-2 rounded-lg bg-white border border-blue-200 hover:border-blue-400 text-xs transition-colors text-left group shadow-2xs"
                    >
                      <div className="truncate pr-2">
                        <span className="font-semibold text-slate-900 block truncate">{sess.departmentName || 'Klinika'}</span>
                        <span className="text-[10px] font-mono text-slate-500">{sess.token}</span>
                      </div>
                      <span className="shrink-0 px-2 py-1 text-[10px] font-bold text-white bg-blue-600 group-hover:bg-blue-700 rounded-md">
                        Skanerlash
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Hozirda faol QR sessiyalar yo'q. Klinika mas'ulidan sessiya ochishni so'rang yoki yuqoridagi "QR Davomatni boshlash" tugmasidan sessiya oching.
                </p>
              )}

              {/* Manual token input */}
              <form onSubmit={handleManualSubmit} className="pt-2 border-t border-blue-200/60 flex items-center gap-2">
                <input
                  type="text"
                  value={manualToken}
                  onChange={e => setManualToken(e.target.value)}
                  placeholder="QR Tokenni kiriting (masalan: TMA-QR-...)"
                  className="flex-1 px-3 py-1.5 text-xs bg-white border rounded-lg font-mono focus:outline-blue-500"
                />
                <button
                  type="submit"
                  disabled={!manualToken.trim()}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shrink-0"
                >
                  Yuborish
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
