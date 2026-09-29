import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newToast: ToastItem = { id, type, title, message };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div 
        aria-live="polite" 
        className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map(toast => {
          let borderClass = 'border-slate-200';
          let icon = <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />;

          if (toast.type === 'success') {
            borderClass = 'border-emerald-200 bg-white text-emerald-950 shadow-emerald-50/50';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />;
          } else if (toast.type === 'warning') {
            borderClass = 'border-amber-200 bg-white text-amber-950 shadow-amber-50/50';
            icon = <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />;
          } else if (toast.type === 'error') {
            borderClass = 'border-red-200 bg-white text-red-950 shadow-red-50/50';
            icon = <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />;
          } else {
            borderClass = 'border-blue-200 bg-white text-slate-900 shadow-blue-50/50';
            icon = <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border bg-white shadow-lg shadow-slate-200/50 transition-all transform animate-in slide-in-from-top-2 duration-200 ${borderClass}`}
            >
              {icon}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 leading-tight">
                  {toast.title}
                </p>
                {toast.message && (
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {toast.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-1 -mr-1 -mt-1 rounded-md transition-colors"
                title="Yopish"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
