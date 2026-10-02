import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmText?: string;
  cancelLabel?: string;
  cancelText?: string;
  isDestructive?: boolean;
  variant?: string;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  confirmText,
  cancelLabel,
  cancelText,
  isDestructive = true,
  variant
}: ConfirmDialogProps) {
  const actualConfirmLabel = confirmLabel || confirmText || "Tasdiqlash";
  const actualCancelLabel = cancelLabel || cancelText || "Bekor qilish";
  const actualIsDestructive = variant === 'danger' || variant === 'destructive' || isDestructive;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full shrink-0 ${actualIsDestructive ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-600 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          {actualCancelLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors ${
            actualIsDestructive 
              ? 'bg-red-600 hover:bg-red-700 shadow-xs' 
              : 'bg-blue-600 hover:bg-blue-700 shadow-xs'
          }`}
        >
          {actualConfirmLabel}
        </button>
      </div>
    </Modal>
  );
}
