import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: string;
}

export default function Badge({ children, className, variant }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variant,
        className
      )}
    >
      {children}
    </span>
  );
}
