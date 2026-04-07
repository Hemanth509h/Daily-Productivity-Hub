import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useLogin } from '@/api-client-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { MemorizeLogo, IconCheck } from '../components/Icons.jsx';
import { useToast } from '@/hooks/use-toast';

const features = [
  'Track memory tasks with smart reminders',
  'Visualize your memory progress analytics',
  'Focus timer for memorization sessions',
  'Install as a native app on any device',
];

export default function Login() {
  const { login } = useAuth();
  const loginMutation = useLogin();
  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!form.email || !form.password) {
      setError('Please fill in all fields');
      return;
    }

    loginMutation.mutate({ data: form }, {
      onSuccess: (data) => {
        login(data);
        if (rememberMe) localStorage.setItem('sanctuary_remember_email', form.email);
        toast({ title: 'Welcome back!', description: 'You have signed in successfully.' });
        navigate('/');
      },
      onError: (err) => setError(err?.data?.error || 'Invalid credentials. Please try again.'),
    });
  };

  React.useEffect(() => {
    const savedEmail = localStorage.getItem('sanctuary_remember_email');
    if (savedEmail) {
      setForm(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex" style={{ background: 'hsl(213,33%,95%)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex w-[440px] flex-shrink-0 flex-col relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, hsl(222,55%,14%) 0%, hsl(222,47%,20%) 60%, hsl(235,50%,24%) 100%)' }}>

        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #4F46E5, transparent 70%)' }} />
        <div className="absolute bottom-20 -left-16 w-48 h-48 rounded-full opacity-8" style={{ background: 'radial-gradient(circle, #22C55E, transparent 70%)' }} />
        <div className="absolute top-1/2 right-8 w-32 h-32 rounded-full opacity-8" style={{ background: 'radial-gradient(circle, #818CF8, transparent 70%)' }} />

        {/* Dot grid pattern */}
        <div className="absolute inset-0 opacity-[0.035]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15">
              <MemorizeLogo size={36} />
            </div>
            <div>
              <div className="text-white font-bold text-base tracking-tight">Memorizes</div>
              <div className="text-white/50 text-[10px] font-semibold tracking-[0.2em] uppercase">Remember Always</div>
            </div>
          </div>

          {/* Main copy */}
          <div className="mt-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/70 text-xs font-medium">Your focus companion</span>
            </div>
            <h1 className="text-[2.4rem] font-bold text-white leading-[1.15] mb-4 tracking-tight">
              Your personal<br />
              <span style={{ background: 'linear-gradient(90deg, #4ADE80, #22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                memory
              </span><br />
              companion.
            </h1>
            <p className="text-white/50 text-sm leading-relaxed mb-8">
              Enhance your memory, stay organized, and build habits that lead to lasting knowledge.
            </p>

            {/* Features */}
            <div className="space-y-3">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(74,222,128,0.2)', border: '1px solid rgba(74,222,128,0.3)' }}>
                    <IconCheck size={11} style={{ color: '#4ADE80' }} />
                  </div>
                  <span className="text-white/60 text-[13px]">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 pb-2">
            {[['100%', 'Uptime'], ['PWA', 'Ready'], ['Free', 'To Use']].map(([val, label]) => (
              <div key={label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-white font-bold text-base">{val}</div>
                <div className="text-white/35 text-[11px] mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-purple-500/20">
              <MemorizeLogo size={28} />
            </div>
            <div>
              <div className="font-bold text-foreground text-sm">Memorizes</div>
              <div className="text-foreground/50 text-[10px] font-semibold">Never Forget</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8" style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)', border: '1px solid hsl(213,25%,90%)' }}>
            <div className="mb-7">
              <h2 className="text-[1.6rem] font-bold text-foreground tracking-tight">Welcome back</h2>
              <p className="text-muted-foreground text-sm mt-1">Sign in to continue</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-foreground/60 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-border rounded-xl text-[13.5px] outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-foreground/60 uppercase tracking-wider">Password</label>
                  <Link href="/forgot-password" className="text-[11px] text-primary font-medium hover:underline">Forgot?</Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-10 border border-border rounded-xl text-[13.5px] outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/60 transition-colors"
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2.5 py-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded accent-primary cursor-pointer"
                />
                <label htmlFor="remember" className="text-[12px] text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors">
                  Remember me
                </label>
              </div>
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full py-3 rounded-xl text-[13.5px] font-bold text-white transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                style={{ background: 'linear-gradient(135deg, hsl(222,47%,20%) 0%, hsl(222,47%,28%) 100%)', boxShadow: '0 2px 8px rgba(27,43,75,0.3)' }}
              >
                {loginMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

           

            <p className="text-center text-[13px] text-muted-foreground mt-5">
              Don't have an account?{' '}
              <Link href="/register" className="font-bold text-primary hover:underline">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
