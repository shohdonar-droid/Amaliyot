import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Clock,
  MapPin,
  Building2,
  Calendar,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  XCircle,
  Maximize2,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { Practice, PracticePlace, PracticeDepartment, AttendanceSession } from '../../../types';
import { storageService } from '../../../services/storageService';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { Modal } from '../../common/Modal';

interface QrGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  practices: Practice[];
  places: PracticePlace[];
  departments: PracticeDepartment[];
  initialPracticeId?: string;
  initialPlaceId?: string;
  onSessionCreated?: (session: AttendanceSession) => void;
}

export function QrGeneratorModal({
  isOpen,
  onClose,
  practices,
  places,
  departments,
  initialPracticeId,
  initialPlaceId,
  onSessionCreated
}: QrGeneratorModalProps) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [selectedPracticeId, setSelectedPracticeId] = useState<string>(initialPracticeId || practices[0]?.id || '');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>(initialPlaceId || places[0]?.id || '');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(5);
  const [practiceStartTime, setPracticeStartTime] = useState<string>('08:00');
  const [lateThresholdMinutes, setLateThresholdMinutes] = useState<number>(15);
  const [allowedRadius, setAllowedRadius] = useState<number>(300);

  // Active session state
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Timer interval ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Filter departments by place
  const placeDepartments = departments.filter(d => d.practicePlaceId === selectedPlaceId);

  // On open, check if there's already an active session for the selected place
  useEffect(() => {
    if (isOpen) {
      const active = storageService.getActiveAttendanceSession(selectedPlaceId, selectedPracticeId);
      if (active) {
        loadSession(active);
      } else {
        setActiveSession(null);
        setQrDataUrl('');
      }
    }
  }, [isOpen, selectedPlaceId, selectedPracticeId]);

  // Handle countdown
  useEffect(() => {
    if (activeSession && activeSession.status === 'ACTIVE') {
      const updateTimer = () => {
        const diff = Math.floor((new Date(activeSession.expiresAt).getTime() - Date.now()) / 1000);
        if (diff <= 0) {
          setRemainingSeconds(0);
          storageService.expireAttendanceSession(activeSession.id, currentUser?.uid || 'user', currentUser?.role);
          setActiveSession(prev => prev ? { ...prev, status: 'EXPIRED' } : null);
          showToast('warning', 'QR muddati tugadi', 'Sessiya vaqti tugadi, yangi kod yarating.');
          if (timerRef.current) clearInterval(timerRef.current);
        } else {
          setRemainingSeconds(diff);
        }
      };

      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [activeSession]);

  const loadSession = async (session: AttendanceSession) => {
    setActiveSession(session);
    try {
      const payload = JSON.stringify({
        token: session.token,
        sessionId: session.id,
        practiceId: session.practiceId,
        placeId: session.practicePlaceId,
        expiresAt: session.expiresAt
      });
      const url = await QRCode.toDataURL(payload, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error('Failed to generate QR', err);
    }
  };

  const handleStartSession = async () => {
    if (!currentUser) return;
    if (!selectedPracticeId || !selectedPlaceId) {
      showToast('error', 'Xatolik', 'Amaliyot va amaliyot joyini tanlang');
      return;
    }

    const dept = placeDepartments.find(d => d.id === selectedDeptId);

    const session = storageService.createAttendanceSession(
      {
        practiceId: selectedPracticeId,
        practicePlaceId: selectedPlaceId,
        departmentId: selectedDeptId,
        departmentName: dept?.name || 'Umumiy bo\'lim',
        durationMinutes,
        practiceStartTime,
        lateThresholdMinutes,
        allowedRadius
      },
      currentUser
    );

    await loadSession(session);
    showToast('success', 'QR sessiya boshlandi', `${durationMinutes} daqiqa davomida faol bo'ladi`);
    if (onSessionCreated) onSessionCreated(session);
  };

  const handleCancelSession = () => {
    if (!activeSession) return;
    storageService.cancelAttendanceSession(activeSession.id, currentUser?.uid || 'user', currentUser?.role);
    setActiveSession(null);
    setQrDataUrl('');
    showToast('info', 'Sessiya bekor qilindi', 'QR davomat to\'xtatildi');
  };

  const handleCopyToken = () => {
    if (!activeSession) return;
    navigator.clipboard.writeText(activeSession.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('info', 'Nusxalandi', 'Token xotiraga olindi');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedPlace = places.find(p => p.id === selectedPlaceId);
  const selectedPractice = practices.find(p => p.id === selectedPracticeId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Klinik QR Davomat Sessiyasi"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {!activeSession || activeSession.status !== 'ACTIVE' ? (
          /* Session Setup Form */
          <div className="space-y-4">
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-start gap-2.5">
              <Radio className="w-4 h-4 text-blue-600 mt-0.5 shrink-0 animate-pulse" />
              <div>
                <p className="font-semibold">Vaqtinchalik Dinamik QR Kod yaratish</p>
                <p className="text-blue-700 text-[11px] mt-0.5">
                  Talabalar klinikaga kelganda mobil kameradan skanerlash orqali davomat qiladi. Kod muddati tugagach, undan qayta foydalanib bo'lmaydi.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amaliyot buyrug'i *
                </label>
                <select
                  value={selectedPracticeId}
                  onChange={e => setSelectedPracticeId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-lg bg-slate-50 focus:bg-white"
                >
                  {practices.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.name.substring(0, 45)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Klinik baza (Shifoxona) *
                </label>
                <select
                  value={selectedPlaceId}
                  onChange={e => setSelectedPlaceId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-lg bg-slate-50 focus:bg-white"
                >
                  {places.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bo'lim (ixtiyoriy)
                </label>
                <select
                  value={selectedDeptId}
                  onChange={e => setSelectedDeptId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-lg bg-slate-50 focus:bg-white"
                >
                  <option value="">Barcha bo'limlar / Umumiy</option>
                  {placeDepartments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Davomat boshlanish vaqti
                </label>
                <input
                  type="time"
                  value={practiceStartTime}
                  onChange={e => setPracticeStartTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-lg bg-slate-50 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kechikish chegarasi (daqiqa)
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={lateThresholdMinutes}
                  onChange={e => setLateThresholdMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border rounded-lg bg-slate-50 focus:bg-white font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  {practiceStartTime} dan {lateThresholdMinutes} daqiqadan keyin (08:{lateThresholdMinutes.toString().padStart(2, '0')}) kelganlar <strong>LATE</strong> bo'ladi.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GPS ruxsat etilgan radius (metr)
                </label>
                <input
                  type="number"
                  min="50"
                  max="1000"
                  step="50"
                  value={allowedRadius}
                  onChange={e => setAllowedRadius(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border rounded-lg bg-slate-50 focus:bg-white font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Klinika markazidan {allowedRadius} metr radiusda bo'lishi shart.
                </span>
              </div>
            </div>

            {/* Duration Selector (Section 3: 5 / 10 / 15 daqiqa) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                QR kodning amal qilish muddati (Section 3 talabi) *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[5, 10, 15].map(duration => (
                  <button
                    key={duration}
                    type="button"
                    onClick={() => setDurationMinutes(duration)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                      durationMinutes === duration
                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>{duration} daqiqa</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Yopish
              </button>
              <button
                type="button"
                onClick={handleStartSession}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
              >
                <QrCode className="w-4 h-4" />
                <span>QR DAVOMATNI BOSHLASH</span>
              </button>
            </div>
          </div>
        ) : (
          /* Live QR Active Display */
          <div className="space-y-5">
            {/* Header info */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Sessiya Faol · QR Tayyor
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  {selectedPlace?.name}
                </h3>
                <p className="text-xs text-slate-300">
                  {activeSession.departmentName || 'Umumiy bo\'lim'} · {selectedPractice?.code}
                </p>
              </div>

              {/* Countdown badge */}
              <div className="flex flex-col items-center justify-center bg-slate-800/80 border border-slate-700 rounded-xl px-5 py-2 shrink-0">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Qolgan vaqt
                </span>
                <span className={`text-2xl font-mono font-bold ${
                  remainingSeconds < 60 ? 'text-red-400 animate-pulse' : 'text-emerald-400'
                }`}>
                  {formatTime(remainingSeconds)}
                </span>
              </div>
            </div>

            {/* QR Code Presentation Canvas */}
            <div className="flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-blue-300 rounded-2xl shadow-inner">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Davomat QR Kodi"
                  className="w-64 h-64 sm:w-72 sm:h-72 object-contain rounded-xl shadow-md border p-2 bg-white"
                />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
              )}

              <div className="mt-4 text-center">
                <p className="text-xs font-semibold text-slate-800">
                  Talabalar mobil kamerasidan skanerlasin
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Vaqt tugashi bilan QR avtomatik ravishda bekor bo'ladi
                </p>
              </div>

              {/* Session Token Bar */}
              <div className="mt-3 flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border text-xs">
                <span className="text-slate-500 font-mono text-[11px]">Token:</span>
                <span className="font-mono font-bold text-slate-800">{activeSession.token}</span>
                <button
                  type="button"
                  onClick={handleCopyToken}
                  className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                  title="Token nusxalash"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Info Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border">
                <span className="text-[10px] text-slate-500 block">Kechikish vaqti</span>
                <span className="font-semibold text-slate-800 font-mono">08:15 dan keyin</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border">
                <span className="text-[10px] text-slate-500 block">GPS Radius</span>
                <span className="font-semibold text-slate-800 font-mono">{activeSession.allowedRadius || 200} m</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border">
                <span className="text-[10px] text-slate-500 block">Mas'ul shaxs</span>
                <span className="font-semibold text-slate-800 truncate block">{activeSession.creatorName || 'Mas\'ul'}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t flex items-center justify-between">
              <button
                type="button"
                onClick={handleCancelSession}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
              >
                <XCircle className="w-4 h-4" />
                <span>Sessiyani to'xtatish</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleStartSession}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Yangilash</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg"
                >
                  Yopish
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
