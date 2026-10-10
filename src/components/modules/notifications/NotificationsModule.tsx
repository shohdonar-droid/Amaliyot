import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Check,
  Clock
} from 'lucide-react';
import { AppNotification } from '../../../types';
import { storageService } from '../../../services/storageService';
import { useToast } from '../../../context/ToastContext';
import { ActiveModule } from '../../layout/Sidebar';

interface NotificationsModuleProps {
  onNavigate: (module: ActiveModule) => void;
}

export function NotificationsModule({ onNavigate }: NotificationsModuleProps) {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<AppNotification[]>(() => storageService.getNotifications());

  const refreshList = () => {
    setNotifications(storageService.getNotifications());
  };

  useEffect(() => {
    const handleSync = () => refreshList();
    window.addEventListener('tma_state_changed', handleSync);
    return () => window.removeEventListener('tma_state_changed', handleSync);
  }, []);

  const handleMarkAsRead = (id: string) => {
    storageService.markNotificationAsRead(id);
    refreshList();
  };

  const handleMarkAllAsRead = () => {
    storageService.markAllNotificationsAsRead();
    refreshList();
    showToast('info', 'Barcha xabarlar o\'qildi', 'Bildirishnomalar yangilandi.');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Tizim bildirishnomalari
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Amaliyot buyruqlari, davomat ogohlantirishlari va kundaliklar bo'yicha xabarlar
          </p>
        </div>

        <button
          type="button"
          onClick={handleMarkAllAsRead}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <Check className="w-4 h-4" />
          <span>Barchasini o'qilgan deb belgilash</span>
        </button>
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        {notifications.map(notif => {
          let icon = <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />;
          let border = 'border-slate-200';

          if (notif.type === 'warning') {
            icon = <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />;
            border = 'border-amber-200 bg-amber-50/20';
          } else if (notif.type === 'alert') {
            icon = <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />;
            border = 'border-red-200 bg-red-50/20';
          }

          return (
            <div
              key={notif.id}
              onClick={() => {
                if (!notif.isRead) handleMarkAsRead(notif.id);
                if (notif.linkModule) onNavigate(notif.linkModule as ActiveModule);
              }}
              className={`p-4 rounded-xl border bg-white shadow-2xs hover:border-slate-300 transition-all cursor-pointer flex items-start gap-3.5 ${border} ${
                !notif.isRead ? 'ring-1 ring-blue-500/20' : 'opacity-85'
              }`}
            >
              {icon}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {notif.title}
                  </h4>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                  )}
                </div>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {notif.message}
                </p>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {notif.linkModule && (
                    <span className="font-medium text-blue-600 hover:underline">
                      Modulga o'tish →
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
