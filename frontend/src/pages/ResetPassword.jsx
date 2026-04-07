import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { MemorizeLogo, IconCheck } from '../components/Icons.jsx';
import { useToast } from '@/hooks/use-toast';
import { customFetch } from '@/api-client-react/custom-fetch';

const features = [
  'Track memory tasks with smart reminders',
  'Visualize your memory progress analytics',
  'Focus timer for memorization sessions',
  'Install as a native app on any device',
];

export default function ResetPassword() {
  const [params] = useLocation();
  const token = new URLSearchParams(window.location.search).get('token');
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [validating, setValidating] = useState(true);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Invalid reset link');
        setValidating(false);
        return;
      }

      try {
        const response = await customFetch(`/api/auth/validate-reset-token?token=${token}`);
        if (response.ok) {
          setTokenValid(true);
        } else {
          setError('This reset link has expired. Please request a new one.');
        }
      } catch (err) {
        setError('Failed to validate reset link');
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(form.password);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.password || !form.confirmPassword) {
      setError('Please fill in both password fields');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await customFetch('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token,
          password: form.password,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        toast({
          title: 'Password reset successful!',
          description: 'You can now sign in with your new password.',
        });
        setTimeout(() => navigate('/login'), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Reset password error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-white font-bold">Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-black text-white mb-2">Invalid Link</h1>
          <p className="text-slate-300 mb-8">{error || 'This reset link is invalid or has expired.'}</p>
          <Link href="/forgot-password" className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:shadow-lg transition-all inline-block">
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

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
              <span className="text-white/70 text-xs font-medium">Secure password reset</span>
            </div>
            <h1 className="text-[2.4rem] font-bold text-white leading-[1.15] mb-4 tracking-tight">
              Create a<br />
              <span style={{ background: 'linear-gradient(90deg, #4ADE80, #22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                new password
              </span>
            </h1>
            <p className="text-white/50 text-sm leading-relaxed mb-8">
              Choose a strong password to secure your Memorize account.
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
            {[['100%', 'Secure'], ['AES', 'Encrypted'], ['Instant', 'Access']].map(([val, label]) => (
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
            {success ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-[1.6rem] font-bold text-foreground tracking-tight">Password reset!</h2>
                  <p className="text-muted-foreground text-sm mt-2">
                    Your password has been successfully reset. Signing you in...
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">Redirecting in 3 seconds...</p>
              </div>
            ) : (
              <>
                <div className="mb-7">
                  <h2 className="text-[1.6rem] font-bold text-foreground tracking-tight">New password</h2>
                  <p className="text-muted-foreground text-sm mt-1">Enter a strong password for your account</p>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-foreground/60 uppercase tracking-wider mb-1.5">New Password</label>
                    <div className="relative mb-2">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        placeholder="Min. 6 characters"
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
                    {form.password && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${strengthColors[Math.min(passwordStrength - 1, 4)]}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-wider">{strengthLabels[Math.min(passwordStrength - 1, 4)]}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-foreground/60 uppercase tracking-wider mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        required
                        autoComplete="new-password"
                        placeholder="Confirm your password"
                        className="w-full px-4 py-3 pr-10 border border-border rounded-xl text-[13.5px] outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/60 transition-colors"
                      >
                        {showConfirm ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        )}
                      </button>
                    </div>
                    {form.confirmPassword && form.password !== form.confirmPassword && (
                      <p className="text-[10px] text-red-600 font-bold mt-1">Passwords do not match</p>
                    )}
                    {form.confirmPassword && form.password === form.confirmPassword && (
                      <p className="text-[10px] text-emerald-600 font-bold mt-1">Passwords match ✓</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || form.password !== form.confirmPassword}
                    className="w-full py-3 rounded-xl text-[13.5px] font-bold text-white transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                    style={{ background: 'linear-gradient(135deg, hsl(222,47%,20%) 0%, hsl(222,47%,28%) 100%)', boxShadow: '0 2px 8px rgba(27,43,75,0.3)' }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Resetting...
                      </span>
                    ) : 'Reset Password'}
                  </button>
                </form>

                <p className="text-center text-[13px] text-muted-foreground mt-5">
                  <Link href="/login" className="font-bold text-primary hover:underline">Back to sign in</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
