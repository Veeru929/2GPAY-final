import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Github,
  Info,
  Landmark,
  Lock,
  LogOut,
  Phone,
  Radio,
  Shield,
  User,
  WifiOff,
} from 'lucide-react';
import type { Screen } from '@/types';
import { BANKS } from '@/types';
import { supabase, getSetting, setSetting } from '@/lib/supabase';

type Props = {
  onNavigate: (screen: Screen) => void;
};

export function SettingsScreen({ onNavigate }: Props) {
  const [selectedBank, setSelectedBank] = useState('sbi');
  const [showBankList, setShowBankList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const b = await getSetting('bank_id');
        if (b) setSelectedBank(b);
      } catch { /* silent */ }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'User');
      }
    })();
  }, []);

  const handleBankChange = async (bankId: string) => {
    setSelectedBank(bankId);
    setShowBankList(false);
    setSaving(true);
    try {
      await setSetting('bank_id', bankId);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
    } catch {
      // silent
    } finally {
      setSigningOut(false);
    }
  };

  const currentBank = BANKS.find((b) => b.id === selectedBank) || BANKS[0];

  return (
    <div className="min-h-screen mesh-bg pb-24">
      <header className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => onNavigate('home')} className="w-9 h-9 rounded-full glass flex items-center justify-center btn-press">
          <ArrowLeft size={18} className="text-slate-300" />
        </button>
        <h1 className="text-base font-bold text-white">Settings</h1>
      </header>

      <div className="px-5 space-y-4">
        {/* Account */}
        <div className="animate-fade-in-up">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">Account</h2>
          <div className="rounded-2xl glass p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <User size={22} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{userName}</p>
                <p className="text-xs text-slate-500 truncate">{userEmail}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/15 text-rose-400 font-semibold text-sm btn-press disabled:opacity-50"
            >
              <LogOut size={16} />
              {signingOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>

        {/* How it works */}
        <div className="animate-fade-in-up">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">How Payments Work</h2>
          <div className="rounded-2xl glass p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                <Phone size={18} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Real Dialer Handoff</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  2G pay opens your phone dialer with the correct *99# USSD code. You complete the payment on your bank's official USSD screen — your PIN never touches this app.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bank Selection */}
        <div className="animate-fade-in-up stagger-1">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">Your Bank</h2>
          <button
            onClick={() => setShowBankList(!showBankList)}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl glass btn-press"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Landmark size={18} className="text-blue-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-white">{currentBank.name}</p>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">{currentBank.ussdCode}</p>
            </div>
            <ChevronRight size={18} className={`text-slate-600 transition-transform ${showBankList ? 'rotate-90' : ''}`} />
          </button>

          {showBankList && (
            <div className="mt-2 rounded-2xl glass overflow-hidden animate-fade-in">
              {BANKS.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => handleBankChange(bank.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 btn-press hover:bg-white/5 transition-colors ${
                    bank.id === selectedBank ? 'bg-emerald-500/5' : ''
                  } ${bank.id !== BANKS[0].id ? 'border-t border-white/5' : ''}`}
                >
                  <Landmark size={16} className="text-slate-500" />
                  <span className="flex-1 text-left text-sm text-slate-300">{bank.name}</span>
                  {bank.id === selectedBank && <Check size={16} className="text-emerald-400" strokeWidth={2.5} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* About */}
        <div className="animate-fade-in-up stagger-2">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">About 2G pay</h2>
          <div className="rounded-2xl glass p-4 space-y-3">
            <div className="flex items-center gap-3">
              <WifiOff size={16} className="text-emerald-400 flex-shrink-0" />
              <p className="text-xs text-slate-400 flex-1">Works without internet</p>
              <Check size={14} className="text-emerald-400" />
            </div>
            <div className="flex items-center gap-3">
              <Radio size={16} className="text-emerald-400 flex-shrink-0" />
              <p className="text-xs text-slate-400 flex-1">Uses *99# USSD channel</p>
              <Check size={14} className="text-emerald-400" />
            </div>
            <div className="flex items-center gap-3">
              <Lock size={16} className="text-emerald-400 flex-shrink-0" />
              <p className="text-xs text-slate-400 flex-1">PIN never enters this app</p>
              <Check size={14} className="text-emerald-400" />
            </div>
            <div className="flex items-center gap-3">
              <Shield size={16} className="text-emerald-400 flex-shrink-0" />
              <p className="text-xs text-slate-400 flex-1">Zero tracking, zero analytics</p>
              <Check size={14} className="text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="animate-fade-in-up stagger-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">More</h2>
          <div className="rounded-2xl glass overflow-hidden">
            <button onClick={() => onNavigate('setup')} className="w-full flex items-center gap-3 px-4 py-3.5 btn-press hover:bg-white/5 transition-colors">
              <Info size={18} className="text-slate-400" />
              <span className="flex-1 text-left text-sm text-slate-300">Setup Guide</span>
              <ChevronRight size={16} className="text-slate-600" />
            </button>
            <div className="h-px bg-white/5" />
            <button onClick={() => onNavigate('faq')} className="w-full flex items-center gap-3 px-4 py-3.5 btn-press hover:bg-white/5 transition-colors">
              <Info size={18} className="text-slate-400" />
              <span className="flex-1 text-left text-sm text-slate-300">FAQ</span>
              <ChevronRight size={16} className="text-slate-600" />
            </button>
            <div className="h-px bg-white/5" />
            <button onClick={() => onNavigate('privacy')} className="w-full flex items-center gap-3 px-4 py-3.5 btn-press hover:bg-white/5 transition-colors">
              <Shield size={18} className="text-slate-400" />
              <span className="flex-1 text-left text-sm text-slate-300">Privacy Policy</span>
              <ChevronRight size={16} className="text-slate-600" />
            </button>
          </div>
        </div>

        {/* Open Source */}
        <div className="animate-fade-in-up stagger-4">
          <div className="rounded-2xl bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 border border-white/5 p-4">
            <div className="flex items-center gap-3 mb-2">
              <Github size={18} className="text-emerald-400" />
              <p className="text-sm font-bold text-white">Open Source</p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every permission, every API call is open source. Verify it yourself before installing.
            </p>
          </div>
        </div>

        {/* Version */}
        <div className="text-center pb-4">
          <p className="text-xs text-slate-700">2G pay v1.0.0</p>
          <p className="text-xs text-slate-700 mt-1">Built for India. Works on any phone.</p>
        </div>

        {saving && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full glass-strong text-xs text-emerald-400 animate-fade-in z-50">
            Saving...
          </div>
        )}
      </div>
    </div>
  );
}
