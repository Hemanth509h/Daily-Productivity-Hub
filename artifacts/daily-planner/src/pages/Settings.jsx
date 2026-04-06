import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Settings() {
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    'Notification' in window && Notification.permission === 'granted'
  );
  const [focusDuration, setFocusDuration] = useState('25');

  const handleEnableNotifications = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotificationsEnabled(perm === 'granted');
    }
  };

  const sections = [
    {
      title: 'Account',
      items: [
        { label: 'Name', value: user?.name },
        { label: 'Email', value: user?.email },
        { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—' },
      ],
    },
  ];

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and preferences</p>
      </div>

      <div className="space-y-4">
        {/* Account */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h2 className="font-bold text-foreground mb-4">Account</h2>
          <div className="flex items-center gap-4 pb-4 border-b border-border">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
              style={{ background: 'hsl(222, 47%, 30%)' }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="font-semibold text-foreground">{user?.name}</div>
              <div className="text-sm text-muted-foreground">{user?.email}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Pro Member</div>
            </div>
          </div>
          <div className="pt-4 space-y-3">
            {[
              { label: 'Full Name', value: user?.name },
              { label: 'Email Address', value: user?.email },
            ].map((f) => (
              <div key={f.label}>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">{f.label}</label>
                <input
                  type="text"
                  defaultValue={f.value || ''}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h2 className="font-bold text-foreground mb-4">Notifications</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-foreground">Browser notifications</div>
                <div className="text-xs text-muted-foreground">Get reminders for upcoming deadlines</div>
              </div>
              <button
                onClick={notificationsEnabled ? undefined : handleEnableNotifications}
                className={`relative w-11 h-6 rounded-full transition-colors ${notificationsEnabled ? 'bg-green-500' : 'bg-muted-foreground/30'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notificationsEnabled ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Focus */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h2 className="font-bold text-foreground mb-4">Focus Mode</h2>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Default Focus Duration</label>
            <div className="flex gap-2">
              {['15', '25', '50'].map((d) => (
                <button
                  key={d}
                  onClick={() => setFocusDuration(d)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    focusDuration === d ? 'border-primary bg-primary text-white' : 'border-border hover:bg-muted'
                  }`}
                >
                  {d} min
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PWA */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h2 className="font-bold text-foreground mb-2">Install App</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Install Sanctuary on your device for a native app experience — works offline too.
          </p>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <span className="text-2xl">📱</span>
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground">Native App Available</div>
              <div className="text-xs text-muted-foreground">Click "Install App" in your browser's address bar or use the sidebar button</div>
            </div>
          </div>
        </div>

        {/* Danger */}
        <div className="bg-white rounded-xl border border-red-200 p-5">
          <h2 className="font-bold text-red-600 mb-4">Danger Zone</h2>
          <button
            onClick={logout}
            className="px-5 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
