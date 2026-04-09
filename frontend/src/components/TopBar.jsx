import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Link } from 'wouter';
import { IconSearch, IconBell, IconPlus, MemorizeLogo } from './Icons.jsx';
import { requestNotificationPermission } from '../lib/notifications.js';
import QuickAddModal from './QuickAddModal.jsx';

export default function TopBar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  useEffect(() => {
    // Check if browser supports notifications and update state
    const updateNotificationState = () => {
      if ('Notification' in window) {
        const isGranted = Notification.permission === 'granted';
        setNotificationEnabled(isGranted);
      }
    };
    
    updateNotificationState();
  }, []);

  const handleNotificationToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (!('Notification' in window)) {
        alert('Your browser does not support notifications');
        return;
      }

      // If already granted, just toggle off (visual only)
      if (Notification.permission === 'granted') {
        setNotificationEnabled(!notificationEnabled);
        return;
      }

      // If permission is default, request it
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        const granted = permission === 'granted';
        setNotificationEnabled(granted);
        
        if (granted) {
          // Send a test notification
          try {
            new Notification('Notifications Enabled! 🎉', {
              body: 'You will now receive task reminders',
              icon: '/logo.png',
            });
          } catch (err) {
            console.error('Error sending test notification:', err);
          }
        }
        return;
      }

      // If already denied, show message
      if (Notification.permission === 'denied') {
        alert('Notifications are blocked. Please enable them in browser settings.');
      }
    } catch (error) {
      console.error('Error handling notification toggle:', error);
      alert('Error handling notifications');
    }
  };

  return (
    <>
      <header className="h-14 md:h-16 flex items-center px-3 md:px-8 gap-2 md:gap-6 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 flex-shrink-0 sticky top-0 z-30">
        {/* Logo - visible on mobile */}
        <Link href="/" className="flex items-center gap-2 md:hidden flex-shrink-0 group">
          <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
            <MemorizeLogo size={20} />
          </div>
          <span className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">Memorizes</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-xl relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none">
            <IconSearch size={16} strokeWidth={2.5} />
          </span>
          <input
            type="search"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 text-[13.5px] rounded-xl border-none outline-none focus:ring-4 focus:ring-primary/5 placeholder:text-slate-400 font-medium transition-all"
            style={{ background: 'rgba(241, 245, 249, 0.7)' }}
          />
        </div>

        {/* Button Group */}
        <div className="flex items-center gap-2">
          {/* Quick Add */}
          <button
            onClick={() => setShowQuickAdd(true)}
            className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-[13px] transition-all hover:shadow-lg hover:scale-105 active:scale-95"
          >
            <IconPlus size={16} strokeWidth={3} />
            <span className="hidden md:inline">Quick Add</span>
          </button>

          {/* Bell */}
          <button
            onClick={handleNotificationToggle}
            className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
              notificationEnabled 
                ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' 
                : 'bg-slate-100/50 text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            title={notificationEnabled ? 'Notifications enabled' : 'Enable notifications'}
          >
            <IconBell size={18} strokeWidth={2} />
            <span className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full border border-white ${notificationEnabled ? 'bg-green-500' : 'bg-slate-300'}`} />
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1" />

          {/* User */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-2xl transition-all hover:bg-slate-100/50"
            >
              <div className="text-right hidden sm:block">
                <div className="text-[12px] font-bold text-slate-900 leading-tight">{user?.name || 'Explorer'}</div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Focus Mode: ON</div>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[13px] font-black shadow-md"
                style={{ background: 'linear-gradient(135deg, hsl(222,47%,20%), hsl(222,47%,30%))' }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </button>
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full mt-2 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 z-50 min-w-[220px] p-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 mb-1">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Sanctuary Account</div>
                    <div className="text-[13px] font-bold text-slate-900 truncate">{user?.email}</div>
                  </div>
                  <div className="h-px bg-slate-50 mx-2 mb-1" />
                  <Link href="/settings" onClick={() => setShowUserMenu(false)}>
                    <div className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all cursor-pointer">
                      Profile Settings
                    </div>
                  </Link>
                  <button
                    onClick={() => { setShowUserMenu(false); logout(); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    Terminate Session
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
      {showQuickAdd && <QuickAddModal onClose={() => setShowQuickAdd(false)} />}
    </>
  );
}
