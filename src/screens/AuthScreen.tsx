import { useState } from 'react';
import { Loader2, ShieldCheck, WifiOff, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (signInError) throw signInError;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mesh-bg flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        {/* Logo + hero */}
        <div className="flex flex-col items-center mb-8 animate-fade-in-up">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center mb-4 animate-float">
            <WifiOff size={36} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-1">2G pay</h1>
          <p className="text-sm text-slate-400 text-center">
            Pay anyone, no internet needed.
          </p>
        </div>

        {/* Sign-in card */}
        <div className="rounded-3xl glass p-6 animate-fade-in-up stagger-1">
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-white mb-1">Sign in to continue</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your transaction history and settings are tied to your account, so they follow you across devices.
            </p>
          </div>

          {/* Google sign-in button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl bg-white text-slate-800 font-semibold text-sm btn-press disabled:opacity-50 transition-all hover:bg-slate-100"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin text-slate-500" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {loading ? 'Connecting...' : 'Continue with Google'}
          </button>

          {error && (
            <p className="text-xs text-rose-400 text-center mt-4 leading-relaxed">{error}</p>
          )}
        </div>

        {/* Trust indicators */}
        <div className="mt-6 space-y-2.5 animate-fade-in-up stagger-2">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl glass">
            <ShieldCheck size={16} className="text-emerald-400 flex-shrink-0" />
            <p className="text-xs text-slate-400">Your PIN never enters this app — only your bank's USSD screen</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl glass">
            <Zap size={16} className="text-emerald-400 flex-shrink-0" />
            <p className="text-xs text-slate-400">Works without internet via *99# USSD</p>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-700 mt-6">
          By continuing, you agree to 2G pay's Privacy Policy.
        </p>
      </div>
    </div>
  );
}
