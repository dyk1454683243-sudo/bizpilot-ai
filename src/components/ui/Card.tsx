import React from 'react';
import clsx from 'clsx';
import { TrendingUp, TrendingDown } from 'lucide-react';

/* ---- Card ---- */

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  header?: string;
  headerAction?: React.ReactNode;
  padding?: boolean;
}

export default function Card({
  children,
  className,
  hover = false,
  header,
  headerAction,
  padding = true,
}: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl shadow-sm border border-slate-200',
        'transition-shadow duration-200',
        hover && 'hover:shadow-md',
        className
      )}
    >
      {header && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">{header}</h3>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={clsx(padding && 'p-6')}>{children}</div>
    </div>
  );
}

/* ---- StatCard ---- */

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatCard({
  icon,
  label,
  value,
  trend,
  trendUp,
  className,
}: StatCardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl shadow-sm border border-slate-200 p-6',
        'hover:shadow-md transition-shadow duration-200',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {value}
          </div>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trendUp !== undefined &&
                (trendUp ? (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
                ))}
              <span
                className={clsx(
                  'text-xs font-medium',
                  trendUp === true && 'text-emerald-600',
                  trendUp === false && 'text-rose-600',
                  trendUp === undefined && 'text-slate-500'
                )}
              >
                {trend}
              </span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
          {icon}
        </div>
      </div>
    </div>
  );
}
