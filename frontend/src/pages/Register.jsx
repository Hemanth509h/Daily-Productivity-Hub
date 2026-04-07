import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useRegister } from '@/api-client-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { MemorizeLogo, IconCheck } from '../components/Icons.jsx';
import { useToast } from '@/hooks/use-toast';

const features = [
  'Unlimited memory tasks & projects',
  'Smart memory tracking',
  'Focus timer & memory analytics',
  'PWA — works offline too',
];

export default function Register() {
  const { login } = useAuth();
  const registerMutation = useRegister();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    registerMutation.mutate({ data: form }, {
      onSuccess: (data) => {
        login(data);
        toast({ title: 'Account created!', description: 'Welcome to Memorize.' });
        navigate('/');
      },
      onError: (err) => setError(err?.data?.error || 'Registration failed. Please try again.'),
    });
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'hsl(213,33%,95%)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex w-[440px] flex-shrink-0 flex-col relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, hsl(222,55%,14%) 0%, hsl(222,47%,20%) 60%, hsl(235,50%,24%) 100%)' }}>

        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #4F46E5, transparent 70%)' }} />
        <div className="absolute bottom-20 -left-16 w-48 h-48 rounded-full opacity-8" style={{ background: 'radial-gradient(circle, #22C55E, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative z-10 flex flex-col h-full p-10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15">
              <MemorizeLogo size={36} />
            </div>
            <div>
              <div className="text-white font-bold text-base tracking-tight">Memorizes</div>
              <div className="text-white/50 text-[10px] font-semibold tracking-[0.2em] uppercase">Remember Always</div>
            </div>
          </div>

          <div className="mt-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-white/70 text-xs font-medium">Free to join</span>
            </div>
            <h1 className="text-[2.4rem] font-bold text-white leading-[1.15] mb-4 tracking-tight">
              Start your <span style={{ background: 'linear-gradient(90deg, #4ADE80, #22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>memory</span><br /> journey today.
            </h1>
            <p className="text-white/50 text-sm leading-relaxed mb-8">
              Join Memorize and take control of your memory, tasks, and knowledge.
            </p>
            <div className="space-y-3">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(74,222,128,0.2)', border: '1px solid rgba(74,222,128,0.3)' }}>
                    <IconCheck size={11} style={{ color: '#4ADE80' }} />
                  </div>
                  <span className="text-white/60 text-[13px]">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">Productivity Tip</div>
            <p className="text-white/65 text-[12.5px] leading-relaxed italic">
              "The secret of getting ahead is getting started. Break big tasks into small, focused blocks."
            </p>
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

          <div className="bg-white rounded-2xl p-8"
            style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)', border: '1px solid hsl(213,25%,90%)' }}>
            <div className="mb-7">
              <h2 className="text-[1.6rem] font-bold text-foreground tracking-tight">Create account</h2>
              <p className="text-muted-foreground text-sm mt-1">Join Memorizes today — it's free</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-foreground/60 uppercase tracking-wider mb-1.5">First Name</label>
                  <input
                    type="text" value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    required autoComplete="given-name"
                    placeholder="John"
                    className="w-full px-4 py-3 border border-border rounded-xl text-[13.5px] outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-foreground/60 uppercase tracking-wider mb-1.5">Last Name</label>
                  <input
                    type="text" value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    required autoComplete="family-name"
                    placeholder="Doe"
                    className="w-full px-4 py-3 border border-border rounded-xl text-[13.5px] outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>
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
                <label className="block text-[11px] font-bold text-foreground/60 uppercase tracking-wider mb-1.5">Password</label>
                <input
                  type="password" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required minLength={6} autoComplete="new-password"
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-3 border border-border rounded-xl text-[13.5px] outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <button
                type="submit" disabled={registerMutation.isPending}
                className="w-full py-3 rounded-xl text-[13.5px] font-bold text-white transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 mt-1"
                style={{ background: 'linear-gradient(135deg, hsl(222,47%,20%) 0%, hsl(222,47%,28%) 100%)', boxShadow: '0 2px 8px rgba(27,43,75,0.3)' }}
              >
                {registerMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-[13px] text-muted-foreground mt-5">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-primary hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
