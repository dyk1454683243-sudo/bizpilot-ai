import React from 'react';
import clsx from 'clsx';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  id?: string;
  className?: string;
}

export default function Select({
  label,
  error,
  options,
  id,
  className,
  ...rest
}: SelectProps) {
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
      <select
        id={id}
        className={clsx(
          'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900',
          'transition-colors duration-200 appearance-none',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
          'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%2364748b%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E")]',
          'bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10',
          error
            ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
            : 'border-slate-300 hover:border-slate-400',
          className
        )}
        {...rest}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1.5 text-sm text-rose-600">{error}</p>
      )}
    </div>
  );
}
