import { useState } from 'react';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  ExternalLink,
  Phone,
  Radio,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import type { Screen } from '@/types';

type Phase = 'idle' | 'awaiting' | 'result';

type BalanceEntry = {
  amount: string;
  timestamp: string;
};

const STORAGE_KEY = '2gpay_last_balance';

function loadLastBalance(): BalanceEntry | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BalanceEntry) : null;
  } catch {
    return null;
  }
}

function saveLastBalance(entry: BalanceEntry) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // ignore quota errors
  }
}

function openBalanceDialer() {
  window.location.href = 'tel:*99*3%23';
}

export function BalanceScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [manualBalance, setManualBalance] = useState('');
  const [showBalance, setShowBalance] = useState(true);
  const [lastBalance, setLastBalance] = useState<BalanceEntry | null>(loadLastBalance);

  const handleCheck = () => {
    setPhase('awaiting');
    openBalanceDialer();
  };

  const confirmBalance = () => {
    const trimmed = manualBalance.trim();
    if (!trimmed) return;
    const entry: BalanceEntry = {
      amount: trimmed,
      timestamp: new Date().toISOString(),
    };
    saveLastBalance(entry);
    setLastBalance(entry);
    setManualBalance('');
    setPhase('result');
  };

  return (
    <div className="min-h-screen mesh-bg pb-24">
      <header className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => onNavigate('home')} className="w-9 h-9 rounded-full glass flex items-center justify-center btn-press">
          <ArrowLeft size={18} className="text-slate-300" />
        </button>
        <h1 className="text-base font-bold text-white">Check Balance</h1>
      </header>

      <div className="px-5">
        {phase === 'idle' && (
          <div className="animate-fade-in-up">
            <div className="rounded-3xl glass p-8 text-center">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center mb-5 animate-float">
                <Wallet size={36} className="text-white" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Check Your Balance</h2>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                2G pay opens your phone dialer with *99*3#. Your bank sends the balance via USSD — no internet needed.
              </p>

              <button
                onClick={handleCheck}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-white font-semibold text-sm btn-press animate-pulse-glow"
              >
                <Phone size={18} />
                Open Bank Dialer
              </button>
            </div>

            <div className="mt-4 flex items-start gap-2 px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <ShieldCheck size={15} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500">Your balance is shown on the bank's USSD screen. 2G pay never reads it automatically — you enter it below to save for reference.</p>
            </div>

            {lastBalance && (
              <div className="mt-4 rounded-2xl glass p-4">
                <p className="text-xs text-slate-500 mb-1">Last checked balance</p>
                <p className="text-2xl font-bold text-white">₹{lastBalance.amount}</p>
                <p className="text-xs text-slate-600 mt-1">
                  {new Date(lastBalance.timestamp).toLocaleString('en-IN')}
                </p>
              </div>
            )}
          </div>
        )}

        {phase === 'awaiting' && (
          <div className="flex flex-col items-center justify-center pt-12 animate-fade-in">
            <div className="relative w-32 h-32 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-pulse-glow" />
              <div className="absolute inset-2 rounded-full border-2 border-emerald-500/10 animate-spin-slow" style={{ borderTopColor: 'rgba(16,185,129,0.4)' }} />
              <Phone size={38} className="text-emerald-400" />
            </div>

            <div className="w-full max-w-sm rounded-2xl glass p-5">
              <div className="text-center mb-4">
                <p className="text-sm font-mono text-emerald-400">*99*3#</p>
                <p className="text-xs text-slate-400 mt-1">Your phone dialer should now be open</p>
              </div>

              <div className="rounded-2xl bg-blue-500/10 border border-blue-400/15 p-4 mb-5">
                <div className="flex items-start gap-3">
                  <ExternalLink size={17} className="text-blue-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-blue-100">Read the balance on USSD</p>
                    <p className="text-xs text-blue-200/70 mt-1 leading-relaxed">
                      Your bank will display your balance on the USSD screen. Note the amount, then enter it below.
                    </p>
                  </div>
                </div>
              </div>

              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Enter balance shown (₹)</label>
              <input
                type="text"
                inputMode="numeric"
                value={manualBalance}
                onChange={(e) => setManualBalance(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="e.g. 12,500"
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/50 border border-white/10 text-white text-lg font-bold placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/10 transition-all"
              />

              <button
                onClick={confirmBalance}
                disabled={!manualBalance.trim()}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-white font-semibold text-sm btn-press disabled:opacity-50"
              >
                <ShieldCheck size={18} />
                Save Balance
              </button>
              <button
                onClick={openBalanceDialer}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl glass border border-white/10 text-slate-300 font-medium text-sm btn-press"
              >
                <Radio size={16} />
                Open Dialer Again
              </button>
              <p className="text-center text-[11px] text-slate-600 mt-3">
                If nothing opened, dial *99*3# manually on your phone.
              </p>
            </div>
          </div>
        )}

        {phase === 'result' && lastBalance && (
          <div className="pt-8 animate-fade-in-up">
            <div className="rounded-3xl glass p-8 text-center relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-emerald-500/10 blur-3xl" />

              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 flex items-center justify-center mb-4 animate-scale-in">
                  <ShieldCheck size={32} className="text-emerald-400" strokeWidth={2.5} />
                </div>

                <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Available Balance</p>

                <div className="flex items-center justify-center gap-2 mb-1">
                  {showBalance ? (
                    <p className="text-4xl font-extrabold gradient-text-emerald animate-scale-in">
                      ₹{lastBalance.amount}
                    </p>
                  ) : (
                    <p className="text-4xl font-extrabold text-slate-700">₹•••••</p>
                  )}
                  <button onClick={() => setShowBalance(!showBalance)} className="p-1.5 rounded-lg hover:bg-white/5 btn-press">
                    {showBalance ? <EyeOff size={16} className="text-slate-500" /> : <Eye size={16} className="text-slate-500" />}
                  </button>
                </div>

                <p className="text-xs text-slate-600 mt-2 mb-6">
                  Via *99*3# USSD • {new Date(lastBalance.timestamp).toLocaleString('en-IN')}
                </p>

                <button
                  onClick={() => setPhase('idle')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl glass border border-white/10 text-slate-300 font-medium text-sm btn-press"
                >
                  <Phone size={16} />
                  Check Again
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button onClick={() => onNavigate('send')} className="rounded-2xl glass p-4 text-center btn-press">
                <Wallet size={20} className="text-emerald-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-white">Send Money</p>
              </button>
              <button onClick={() => onNavigate('history')} className="rounded-2xl glass p-4 text-center btn-press">
                <Radio size={20} className="text-cyan-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-white">View History</p>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
