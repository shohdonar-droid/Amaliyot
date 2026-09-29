import React, { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
      <div className="p-3.5 rounded-full bg-slate-100 text-slate-400 mb-3.5">
        {icon || <Inbox className="w-8 h-8 stroke-[1.5]" />}
      </div>
      <h4 className="text-base font-semibold text-slate-800">
        {title}
      </h4>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
