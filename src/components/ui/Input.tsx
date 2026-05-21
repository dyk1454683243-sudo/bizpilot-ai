import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  id?: string;
  className?: string;
}

export default function Input({
  label,
  error,
  id,
  className,
  ...rest
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={clsx(
          'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900',
          'placeholder:text-slate-400',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
          error
            ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
            : 'border-slate-300 hover:border-slate-400',
          className
        )}
        {...rest}
      />
      {error && (
        <p className="mt-1.5 text-sm text-rose-600">{error}</p>
      )}
    </div>
  );
}
