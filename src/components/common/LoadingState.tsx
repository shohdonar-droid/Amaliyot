import React from 'react';
import { AlertCircle, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingState({
  message = "Ma'lumotlar yuklanmoqda...",
  subMessage,
  size = 'md',
  className = ''
}: LoadingStateProps) {
  const spinnerSize = size === 'sm' ? 'w-5 h-5 border-2' : size === 'lg' ? 'w-10 h-10 border-3' : 'w-7 h-7 border-2.5';
  
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-slate-50/60 border border-slate-200/80 ${className}`}>
      <div className={`${spinnerSize} border-blue-600 border-t-transparent rounded-full animate-spin mb-3`} />
      <p className="text-xs font-bold text-slate-800 tracking-wide uppercase">
        {message}
      </p>
      {subMessage && (
        <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
          {subMessage}
        </p>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Ma'lumotlarni yuklashda xatolik",
  message,
  onRetry,
  className = ''
}: ErrorStateProps) {
  return (
    <div className={`p-6 rounded-2xl bg-rose-50/80 border border-rose-200 text-center flex flex-col items-center justify-center ${className}`}>
      <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-bold text-rose-900 mb-1">
        {title}
      </h4>
      <p className="text-xs text-rose-700/90 max-w-md mb-4 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Qayta urinish</span>
        </button>
      )}
    </div>
  );
}

export function SyncBadge() {
  const [sync, setSync] = React.useState<{ status: 'synced' | 'syncing' | 'error'; error: string | null }>({
    status: 'synced',
    error: null
  });

  React.useEffect(() => {
    const handleSyncStatus = (e: any) => {
      if (e?.detail) {
        setSync({ status: e.detail.status, error: e.detail.error });
      }
    };
    window.addEventListener('tma_sync_status_changed', handleSyncStatus);
    return () => window.removeEventListener('tma_sync_status_changed', handleSyncStatus);
  }, []);

  if (sync.status === 'syncing') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200 animate-pulse">
        <div className="w-2 h-2 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span>Bulut bilan saqlanmoqda...</span>
      </div>
    );
  }

  if (sync.status === 'error') {
    return (
      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200" title={sync.error || 'Lokal saqlandi'}>
        <ShieldAlert className="w-3 h-3 text-amber-600" />
        <span>Lokalda himoyalangan</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
      <span>Sinxronlashgan</span>
    </div>
  );
}
