import React from 'react';

export type StatusVariant = 
  | 'active' 
  | 'success' 
  | 'warning' 
  | 'danger' 
  | 'neutral' 
  | 'info' 
  | 'purple';

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  showDot?: boolean;
  size?: 'sm' | 'md';
}

export function StatusBadge({
  label,
  variant = 'neutral',
  showDot = true,
  size = 'sm'
}: StatusBadgeProps) {
  const variantStyles: Record<StatusVariant, { text: string; dot: string; bg: string }> = {
    active: {
      text: 'text-emerald-700 font-medium',
      dot: 'bg-emerald-500',
      bg: 'bg-emerald-50/70 border-emerald-200/60'
    },
    success: {
      text: 'text-emerald-700 font-medium',
      dot: 'bg-emerald-500',
      bg: 'bg-emerald-50/70 border-emerald-200/60'
    },
    warning: {
      text: 'text-amber-700 font-medium',
      dot: 'bg-amber-500',
      bg: 'bg-amber-50/70 border-amber-200/60'
    },
    danger: {
      text: 'text-red-700 font-medium',
      dot: 'bg-red-500',
      bg: 'bg-red-50/70 border-red-200/60'
    },
    info: {
      text: 'text-blue-700 font-medium',
      dot: 'bg-blue-500',
      bg: 'bg-blue-50/70 border-blue-200/60'
    },
    purple: {
      text: 'text-purple-700 font-medium',
      dot: 'bg-purple-500',
      bg: 'bg-purple-50/70 border-purple-200/60'
    },
    neutral: {
      text: 'text-slate-600 font-medium',
      dot: 'bg-slate-400',
      bg: 'bg-slate-100/70 border-slate-200/60'
    }
  };

  const style = variantStyles[variant];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border ${style.bg} ${style.text} ${sizeClasses} whitespace-nowrap`}>
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot} shrink-0`} aria-hidden="true" />
      )}
      <span>{label}</span>
    </span>
  );
}
