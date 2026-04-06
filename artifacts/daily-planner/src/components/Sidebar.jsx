import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useGetDashboardSummary } from '@workspace/api-client-react';
import { useAuth } from '../contexts/AuthContext.jsx';

const NavItem = ({ href, icon, label, badge, active }) => (
  <Link href={href}>
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-colors mx-2 ${
      active
        ? 'bg-white/15 text-white font-medium'
        : 'text-sidebar-foreground/70 hover:bg-white/8 hover:text-white'
    }`}>
      <span className="text-lg">{icon}</span>
      <span className="text-sm">{label}</span>
      {badge != null && badge > 0 && (
        <span className={`ml-auto text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
          label === 'Overdue' ? 'bg-red-500 text-white' : 'bg-white/20 text-white'
        }`}>
          {badge}
        </span>
      )}
    </div>
  </Link>
);

export default function Sidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();
  const { data: summary } = useGetDashboardSummary();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(true);

  React.useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
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
    <aside className="w-[210px] flex-shrink-0 flex flex-col h-full" style={{ background: 'hsl(222, 47%, 18%)' }}>
      {/* Logo */}
      <div className="px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#4ADE80"/>
              <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" fill="#22C55E" opacity="0.5"/>
              <path d="M12 9v6M9 12h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div className="text-white font-semibold text-sm leading-tight">The Sanctuary</div>
            <div className="text-white/50 text-[10px] font-medium tracking-widest uppercase">Daily Focus</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll pt-2 space-y-0.5">
        <NavItem href="/" icon="⊞" label="Dashboard" active={location === '/'} />
        <NavItem href="/tasks" icon="✓" label="Tasks" active={location === '/tasks' || location.startsWith('/tasks/')} />
        <NavItem href="/calendar" icon="📅" label="Calendar" active={location === '/calendar'} />
        <NavItem href="/settings" icon="⚙" label="Settings" active={location === '/settings'} />

        {/* View section */}
        <div className="px-4 pt-5 pb-2">
          <span className="text-white/35 text-[10px] font-semibold tracking-widest uppercase">View</span>
        </div>
        <NavItem href="/?view=today" icon="📅" label="Today" badge={summary?.todayCount} active={false} />
        <NavItem href="/?view=upcoming" icon="📆" label="Upcoming" active={false} />
        <NavItem href="/tasks?status=overdue" icon="⏰" label="Overdue" badge={summary?.overdueCount} active={false} />
      </nav>

      {/* Install Banner */}
      {showInstall && (
        <div className="mx-3 mb-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm">📱</span>
            <span className="text-white text-xs font-semibold">Native App</span>
          </div>
          <p className="text-white/50 text-[11px] mb-2.5 leading-relaxed">
            Install Sanctuary for a seamless desktop experience.
          </p>
          <button
            onClick={handleInstall}
            className="w-full py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'hsl(222, 47%, 30%)' }}
          >
            Install App
          </button>
        </div>
      )}
    </aside>
  );
}
