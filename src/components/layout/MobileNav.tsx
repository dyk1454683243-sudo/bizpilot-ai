'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Receipt,
  MoreHorizontal,
  MessageSquare,
  Star,
  BarChart3,
  Settings,
  X,
} from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  MessageSquare,
  Calendar,
  Receipt,
  Star,
  BarChart3,
  Settings,
};

// The 4 primary nav items + More
const PRIMARY_ITEMS = [
  NAV_ITEMS[0], // Dashboard
  NAV_ITEMS[1], // Leads
  NAV_ITEMS[3], // Appointments
  NAV_ITEMS[4], // Invoices
];

const MORE_ITEMS = NAV_ITEMS.filter(
  (item) => !PRIMARY_ITEMS.some((p) => p.href === item.href)
);

export default function MobileNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {/* More sheet overlay */}
      {showMore && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowMore(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-900">
                More
              </span>
              <button
                onClick={() => setShowMore(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-3 pb-6">
              <ul className="space-y-1">
                {MORE_ITEMS.map((item) => {
                  const Icon = iconMap[item.icon];
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setShowMore(false)}
                        className={clsx(
                          'flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors',
                          isActive
                            ? 'bg-indigo-50 text-indigo-700 font-medium'
                            : 'text-slate-600 hover:bg-slate-50'
                        )}
                      >
                        {Icon && (
                          <Icon
                            className={clsx(
                              'h-5 w-5',
                              isActive ? 'text-indigo-600' : 'text-slate-400'
                            )}
                          />
                        )}
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 lg:hidden safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {PRIMARY_ITEMS.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-lg transition-colors',
                  isActive ? 'text-indigo-600' : 'text-slate-400'
                )}
              >
                {Icon && <Icon className="h-5 w-5" />}
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
          {/* More button */}
          <button
            onClick={() => setShowMore(true)}
            className={clsx(
              'flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-lg transition-colors',
              showMore ? 'text-indigo-600' : 'text-slate-400'
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
