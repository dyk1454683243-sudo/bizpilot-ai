'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Menu,
  User,
  Settings,
  CreditCard,
  LogOut,
  Check,
  CheckCheck,
} from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants';
import { getGreeting } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import Avatar from '@/components/ui/Avatar';
import clsx from 'clsx';

interface TopbarProps {
  onMenuClick: () => void;
}

interface NotificationItem {
  id: string;
  text: string;
  read: boolean;
  time: string;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  // Dropdown open states
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Refs for tracking DOM elements to detect clicking outside
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Initial dummy notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: '1', text: 'New lead added', read: false, time: '5 mins ago' },
    { id: '2', text: 'Payment pending from Rahul', read: false, time: '1 hr ago' },
    { id: '3', text: 'Appointment scheduled today', read: false, time: '2 hrs ago' },
    { id: '4', text: 'AI report is ready', read: false, time: '5 hrs ago' },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Derive page title from navigation paths
  const currentNav = NAV_ITEMS.find((item) =>
    item.href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(item.href)
  );
  const pageTitle = currentNav?.label || 'Dashboard';

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'success');
  };

  const handleToggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const notif = notifications.find((n) => n.id === id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
    if (notif) {
      if (notif.read) {
        showToast('Notification marked as unread', 'info');
      } else {
        showToast('Notification marked as read', 'success');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Logged out successfully', 'info');
      router.push('/login');
    } catch (err: any) {
      showToast(err.message || 'Logout failed', 'error');
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = (e.target as HTMLInputElement).value;
      if (query.trim()) {
        showToast(`Search for "${query}" simulated (Demo Mode)`, 'info');
      }
    }
  };

  // Click-Outside Listener logic
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // If clicking outside notifications area, close it
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
      // If clicking outside profile area, close it
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6 relative">
        {/* Left: Hamburger + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-slate-900 leading-tight">
                {pageTitle}
              </h1>
              <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider select-none shrink-0" title="Data is local and simulated for this MVP preview">
                Demo Mode
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block mt-0.5">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}! 👋
            </p>
          </div>
        </div>

        {/* Right: Search + Notifications + Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search leads, invoices..."
                onKeyDown={handleSearchKeyDown}
                className="w-64 pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg
                           placeholder:text-slate-400 text-slate-700
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                           transition-colors"
              />
            </div>
          </div>

          {/* Mobile search toggle */}
          <button 
            onClick={() => showToast('Mobile search activated (Demo Mode)', 'info')}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Notifications Container */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className={clsx(
                "relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer",
                notificationsOpen && "bg-slate-100 text-slate-700"
              )}
            >
              <Bell className="h-5 w-5" />
              {/* Badge count */}
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-rose-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center px-1 ring-2 ring-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-slide-up origin-top-right">
                {/* Dropdown Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                  <span className="text-sm font-semibold text-slate-800">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={(e) => handleMarkAllRead(e)}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Mark all as read
                    </button>
                  )}
                </div>

                {/* Notifications list */}
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-slate-400">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={(e) => handleToggleRead(n.id, e)}
                        className={clsx(
                          "px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors hover:bg-slate-50",
                          !n.read && "bg-indigo-50/20"
                        )}
                      >
                        <div className="mt-1 flex-shrink-0">
                          <div
                            className={clsx(
                              "w-2 h-2 rounded-full",
                              n.read ? "bg-slate-300" : "bg-indigo-600 ring-4 ring-indigo-100"
                            )}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={clsx(
                              "text-xs text-slate-700 leading-normal",
                              !n.read && "font-medium text-slate-900"
                            )}
                          >
                            {n.text}
                          </p>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            {n.time}
                          </span>
                        </div>
                        {!n.read && (
                          <button
                            title="Mark as read"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleRead(n.id, e);
                            }}
                            className="text-slate-400 hover:text-indigo-600 transition-colors self-center p-0.5 rounded cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Container */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-shadow cursor-pointer"
            >
              <Avatar name={user?.name || 'User'} size="sm" className="hover:opacity-90" />
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-slide-up origin-top-right">
                {/* Dropdown Header with Name & Role */}
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {user?.email || 'user@example.com'}
                  </p>
                  <span className="inline-block px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-semibold rounded-md mt-1.5">
                    Owner
                  </span>
                </div>

                {/* Profile Links */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      router.push('/dashboard/settings');
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      router.push('/dashboard/settings');
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      router.push('/dashboard/billing');
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <CreditCard className="h-4 w-4 text-slate-400" />
                    Billing
                  </button>
                </div>

                <div className="border-t border-slate-100 my-1" />

                {/* Logout Trigger */}
                <div className="py-0.5">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors font-medium cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 text-rose-500" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
