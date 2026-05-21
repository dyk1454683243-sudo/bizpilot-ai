import React from 'react';
import clsx from 'clsx';
import { getInitials } from '@/lib/utils';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
};

export default function Avatar({ name, size = 'md', className }: AvatarProps) {
  return (
    <div
      className={clsx(
        'inline-flex items-center justify-center rounded-full',
        'bg-gradient-to-br from-indigo-500 to-purple-600',
        'text-white font-semibold select-none flex-shrink-0',
        sizeStyles[size],
        className
      )}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}
