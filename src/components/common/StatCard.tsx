import React, { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  variant?: 'default' | 'alert' | 'warning' | 'success' | 'blue';
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  onClick
}: StatCardProps) {
  const variantBorder = {
    default: 'border-slate-200 hover:border-slate-300',
    blue: 'border-blue-200 bg-gradient-to-br from-blue-50/40 to-white hover:border-blue-300',
    alert: 'border-red-200 bg-gradient-to-br from-red-50/30 to-white hover:border-red-300',
    warning: 'border-amber-200 bg-gradient-to-br from-amber-50/30 to-white hover:border-amber-300',
    success: 'border-emerald-200 bg-gradient-to-br from-emerald-50/30 to-white hover:border-emerald-300'
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`p-5 bg-white rounded-xl border transition-all duration-150 ${variantBorder} ${
        onClick ? 'cursor-pointer hover:shadow-xs' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">
            {title}
          </p>
          <p className="mt-2 text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {value}
          </p>
        </div>
        {icon && (
          <div className="p-2.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-100 shrink-0">
            {icon}
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          {subtitle && <span className="truncate">{subtitle}</span>}
          {trend && (
            <span
              className={`font-medium tabular-nums ml-auto shrink-0 ${
                trend.isPositive ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {trend.value} {trend.label && <span className="text-slate-400 font-normal">{trend.label}</span>}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
