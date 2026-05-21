import React from 'react';
import clsx from 'clsx';

/* ---- Table Wrapper ---- */

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div
      className={clsx(
        'w-full overflow-x-auto rounded-xl border border-slate-200',
        className
      )}
    >
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

/* ---- TableHeader ---- */

export function TableHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <thead
      className={clsx(
        'bg-slate-50/80 sticky top-0 z-10',
        className
      )}
    >
      {children}
    </thead>
  );
}

/* ---- TableBody ---- */

export function TableBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tbody className={clsx('divide-y divide-slate-100', className)}>
      {children}
    </tbody>
  );
}

/* ---- TableRow ---- */

export function TableRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tr
      className={clsx(
        'hover:bg-slate-50/60 transition-colors duration-150',
        className
      )}
    >
      {children}
    </tr>
  );
}

/* ---- TableHead ---- */

export function TableHead({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={clsx(
        'px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider',
        className
      )}
    >
      {children}
    </th>
  );
}

/* ---- TableCell ---- */

export function TableCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={clsx(
        'px-4 py-3 text-slate-700 whitespace-nowrap',
        className
      )}
    >
      {children}
    </td>
  );
}
