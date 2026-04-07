import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { customFetch } from '@/api-client-react/custom-fetch';
import { IconCheck } from '../components/Icons.jsx';

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid hsl(213,25%,90%)' }}>
      <div className="px-5 py-4 border-b" style={{ borderColor: 'hsl(213,25%,92%)' }}>
        <h2 className="font-bold text-[14px] text-foreground">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-foreground/55 uppercase tracking-widest mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-4 py-2.5 border border-border rounded-xl text-[13.5px] outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/10 ${className}`}
      {...props}
    />
  );
}

export default function Settings() {
  const { user, login, token } = useAuth();

  // Profile section
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [profileStatus, setProfileStatus] = useState(null); // null | 'saving' | 'saved' | 'error'
  const [profileError, setProfileError] = useState('');

  // Password section
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [passwordError, setPasswordError] = useState('');

  // Preferences (local only)
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    typeof Notification !== 'undefined' && Notification.permission === 'granted'
  );
  const [prefsSaved, setPrefsSaved] = useState(false);

  // Init profile from user
  useEffect(() => {
    if (user) {
      setProfile({ name: user.name || '', email: user.email || '' });
    }
  }, [user]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileStatus('saving');
    setProfileError('');
    try {
      const data = await customFetch('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({ name: profile.name, email: profile.email }),
      });
      // Update auth context with new user data
      setUser(data);
      setProfileStatus('saved');
      setTimeout(() => setProfileStatus(null), 3000);
    } catch (err) {
      setProfileError(err.message || 'Failed to save profile');
      setProfileStatus('error');
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (passwords.new !== passwords.confirm) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwords.new.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    setPasswordStatus('saving');
    try {
      await customFetch('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new }),
      });
      setPasswords({ current: '', new: '', confirm: '' });
      setPasswordStatus('saved');
      setTimeout(() => setPasswordStatus(null), 3000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password');
      setPasswordStatus('error');
    }
  };

  const handleEnableNotifications = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotificationsEnabled(perm === 'granted');
    }
  };

  const savePreferences = () => {
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 2500);
  };

  const StatusBanner = ({ status, error, successMsg = 'Changes saved!' }) => {
    if (!status) return null;
    if (status === 'saving') return (
      <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground animate-pulse">
        <div className="w-3.5 h-3.5 border-2 border-muted-foreground/40 border-t-primary rounded-full animate-spin" />
        Saving...
      </div>
    );
    if (status === 'saved') return (
      <div className="flex items-center gap-2 text-[12.5px] text-green-600 font-semibold">
        <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
          <IconCheck size={10} className="text-white" />
        </div>
        {successMsg}
      </div>
    );
    if (status === 'error') return (
      <div className="text-[12.5px] text-red-600">{error}</div>
    );
    return null;
  };

  return (
    <div className="max-w-xl space-y-4 ">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[1.9rem] font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-[13.5px] mt-1">Manage your account and preferences.</p>
      </div>

      {/* Avatar banner */}
      <div className="bg-white rounded-2xl p-5 flex items-center gap-4"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid hsl(213,25%,90%)' }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div>
          <div className="font-bold text-foreground text-[15px]">{user?.name}</div>
          <div className="text-muted-foreground text-[13px]">{user?.email}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-[11px] text-muted-foreground/70 font-medium">Active · Pro Member</span>
          </div>
        </div>
      </div>

      {/* Profile form */}
      <Section title="Profile Information">
        <form onSubmit={saveProfile} className="space-y-4">
          <Field label="Full Name">
            <Input
              type="text" value={profile.name} required
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Your full name"
            />
          </Field>
          <Field label="Email Address">
            <Input
              type="email" value={profile.email} required
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              placeholder="you@example.com"
            />
          </Field>
          <div className="flex items-center justify-between pt-1">
            <StatusBanner status={profileStatus} error={profileError} successMsg="Profile saved!" />
            <button
              type="submit"
              disabled={profileStatus === 'saving'}
              className="ml-auto px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:shadow-md hover:scale-[1.01] disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, hsl(222,47%,20%) 0%, hsl(222,47%,28%) 100%)' }}
            >
              Save Profile
            </button>
          </div>
        </form>
      </Section>

      {/* Change password */}
      <Section title="Change Password">
        <form onSubmit={savePassword} className="space-y-4">
          <Field label="Current Password">
            <Input
              type="password" value={passwords.current} required
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              placeholder="Enter your current password"
              autoComplete="current-password"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="New Password">
              <Input
                type="password" value={passwords.new} required minLength={6}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
              />
            </Field>
            <Field label="Confirm Password">
              <Input
                type="password" value={passwords.confirm} required
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                placeholder="Repeat new password"
                autoComplete="new-password"
              />
            </Field>
          </div>
          <div className="flex items-center justify-between pt-1">
            <StatusBanner status={passwordStatus} error={passwordError} successMsg="Password updated!" />
            <button
              type="submit"
              disabled={passwordStatus === 'saving'}
              className="ml-auto px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:shadow-md hover:scale-[1.01] disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, hsl(222,47%,20%) 0%, hsl(222,47%,28%) 100%)' }}
            >
              Update Password
            </button>
          </div>
        </form>
      </Section>

      {/* Preferences */}
      <Section title="Preferences">
        <div className="space-y-5">
          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13.5px] font-semibold text-foreground">Browser notifications</div>
              <div className="text-[12px] text-muted-foreground mt-0.5">Get reminders for upcoming deadlines</div>
            </div>
            <button
              onClick={notificationsEnabled ? undefined : handleEnableNotifications}
              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${notificationsEnabled ? 'bg-green-500' : 'bg-muted-foreground/25 hover:bg-muted-foreground/35'}`}
            >
              <div className={`absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-transform ${notificationsEnabled ? 'translate-x-[22px]' : 'translate-x-[3px]'}`} />
            </button>
          </div>




        </div>
      </Section>


      {/* Danger zone */}
      <div className="bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #FEE2E2' }}>
        <div className="px-5 py-4 border-b border-red-100">
          <h2 className="font-bold text-[14px] text-red-600">Danger Zone</h2>
        </div>
        <div className="p-5">
          <p className="text-[13px] text-muted-foreground mb-4">Sign out of your account on this device.</p>
          <button
            onClick={() => {
              localStorage.removeItem('sanctuary_access_token');
              localStorage.removeItem('sanctuary_refresh_token');
              window.location.href = '/login';
            }}
            className="px-5 py-2.5 rounded-xl border text-[13px] font-bold text-red-600 hover:bg-red-50 transition-colors"
            style={{ borderColor: '#FCA5A5' }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
