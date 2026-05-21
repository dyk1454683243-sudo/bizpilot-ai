'use client';

import React from 'react';
import clsx from 'clsx';

interface Tab {
  value: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={clsx('border-b border-slate-200', className)}>
      <nav className="flex gap-0 -mb-px overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = tab.value === activeTab;
          return (
            <button
              key={tab.value}
              onClick={() => onChange(tab.value)}
              className={clsx(
                'relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500',
                isActive
                  ? 'text-indigo-600'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {tab.label}
              {/* Active indicator */}
              <span
                className={clsx(
                  'absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-200',
                  isActive ? 'bg-indigo-600' : 'bg-transparent'
                )}
              />
            </button>
          );
        })}
      </nav>
    </div>
  );
}
