import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useGetDashboardSummary } from '@workspace/api-client-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
  IconDashboard, IconTasks, IconCalendar, IconSettings,
  IconClock, IconUpcoming, IconAlert, IconSmartphone, SanctuaryLogo
} from './Icons.jsx';

const NavItem = ({ href, icon: Icon, label, badge, active, danger }) => (
  <Link href={href}>
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all mx-2 group ${
      active
        ? 'text-white font-semibold shadow-sm'
        : 'text-white/55 hover:text-white/90 hover:bg-white/6'
    }`}
      style={active ? { background: 'rgba(255,255,255,0.13)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)' } : {}}>
      <div className={`flex-shrink-0 ${active ? 'text-white' : 'text-white/50 group-hover:text-white/75'}`}>
        <Icon size={17} />
      </div>
      <span className="text-[13px] flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none ${
          label === 'Overdue' ? 'bg-red-500/90 text-white' : 'bg-white/15 text-white'
        }`}>
          {badge}
        </span>
      )}
    </div>
  </Link>
);

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { data: summary } = useGetDashboardSummary();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(true);

  React.useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setShowInstall(false);
    }
  };

  return (
    <aside className="w-[210px] flex-shrink-0 flex flex-col h-full relative overflow-hidden" style={{ background: 'hsl(222, 47%, 17%)' }}>
      {/* Subtle top gradient shimmer */}
      <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)' }} />

      {/* Logo */}
      <div className="px-4 py-5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <SanctuaryLogo size={36} />
          <div>
            <div className="text-white font-bold text-[14px] leading-tight tracking-tight">The Sanctuary</div>
            <div className="text-white/40 text-[9.5px] font-semibold tracking-[0.2em] uppercase mt-0.5">Daily Focus</div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px mb-3" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll space-y-0.5">
        <div className="px-5 pb-2 pt-1">
          <span className="text-white/25 text-[9.5px] font-bold tracking-[0.18em] uppercase">Menu</span>
        </div>
        <NavItem href="/" icon={IconDashboard} label="Dashboard" active={location === '/'} />
        <NavItem href="/tasks" icon={IconTasks} label="Tasks" active={location === '/tasks' || location.startsWith('/tasks/')} />
        <NavItem href="/calendar" icon={IconCalendar} label="Calendar" active={location === '/calendar'} />
        <NavItem href="/settings" icon={IconSettings} label="Settings" active={location === '/settings'} />

        {/* View section */}
        <div className="px-5 pt-5 pb-2">
          <span className="text-white/25 text-[9.5px] font-bold tracking-[0.18em] uppercase">View</span>
        </div>
        <NavItem href="/" icon={IconClock} label="Today" badge={summary?.todayCount} active={false} />
        <NavItem href="/tasks?view=upcoming" icon={IconUpcoming} label="Upcoming" active={false} />
        <NavItem href="/tasks?status=overdue" icon={IconAlert} label="Overdue" badge={summary?.overdueCount} active={false} />
      </nav>

      {/* User info at bottom */}
      <div className="flex-shrink-0 px-3 pb-2 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white/6 cursor-pointer transition-colors">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-[12px] font-semibold truncate">{user?.name || 'User'}</div>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-white/35 text-[10px]">Active</span>
            </div>
          </div>
          <button onClick={logout} className="text-white/25 hover:text-white/70 transition-colors p-1 rounded">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
