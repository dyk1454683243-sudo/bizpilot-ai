'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Calendar,
  Receipt,
  Star,
  BarChart3,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';
import Avatar from '@/components/ui/Avatar';

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

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-screen bg-white border-r border-slate-200 z-40',
        'flex flex-col transition-all duration-300 ease-in-out',
        'hidden lg:flex',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Logo */}
      <div
        className={clsx(
          'flex items-center h-16 border-b border-slate-100 flex-shrink-0',
          collapsed ? 'justify-center px-2' : 'px-6'
        )}
      >
        {collapsed ? (
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
        ) : (
          <Link href="/dashboard" className="flex items-center gap-1.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="text-xl font-bold">
              <span className="text-indigo-600">Biz</span>
              <span className="text-slate-800">Pilot</span>
            </span>
            <span className="ml-0.5 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-md uppercase">
              AI
            </span>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    'flex items-center rounded-lg transition-all duration-150',
                    collapsed
                      ? 'justify-center px-2 py-2.5'
                      : 'gap-3 px-3 py-2.5',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  {Icon && (
                    <Icon
                      className={clsx(
                        'h-5 w-5 flex-shrink-0',
                        isActive ? 'text-indigo-600' : 'text-slate-400'
                      )}
                    />
                  )}
                  {!collapsed && (
                    <span className="text-sm">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="px-3 pb-2">
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full py-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <ChevronsLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* User section */}
      <div
        className={clsx(
          'border-t border-slate-100 flex-shrink-0',
          collapsed ? 'px-2 py-3' : 'px-4 py-4'
        )}
      >
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <Avatar name={user?.name || 'User'} size="sm" />
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar name={user?.name || 'User'} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-slate-500">Owner</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
