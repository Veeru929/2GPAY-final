import { useEffect, useState } from 'react';
import {
  QrCode,
  Send,
  Wallet,
  Clock,
  Shield,
  Zap,
  Lock,
  WifiOff,
  Settings,
  HelpCircle,
  ChevronRight,
  ArrowRight,
  Signal,
  Radio,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import type { Screen } from '@/types';
import { getTransactions } from '@/lib/supabase';

type Props = {
  onNavigate: (screen: Screen) => void;
};

export function HomeScreen({ onNavigate }: Props) {
  const [recentCount, setRecentCount] = useState(0);
  const [totalSent, setTotalSent] = useState(0);

  useEffect(() => {
    getTransactions().then((txns) => {
      setRecentCount(txns.length);
      const total = txns
        .filter((t) => t.status === 'success')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      setTotalSent(total);
    }).catch(() => {});
  }, []);

  const features = [
    { icon: QrCode, title: 'Scan QR', desc: 'Scan any UPI QR code', screen: 'scan' as Screen, color: 'from-emerald-400 to-teal-500' },
    { icon: Send, title: 'Send Money', desc: 'Pay via UPI ID', screen: 'send' as Screen, color: 'from-cyan-400 to-blue-500' },
    { icon: Wallet, title: 'Check Balance', desc: 'Straight from your bank', screen: 'balance' as Screen, color: 'from-teal-400 to-emerald-500' },
    { icon: Clock, title: 'History', desc: 'Encrypted on-device', screen: 'history' as Screen, color: 'from-blue-400 to-cyan-500' },
  ];

  return (
    <div className="min-h-screen mesh-bg pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-6">
        <div className="flex items-center justify-between animate-fade-in">
          <Logo size="md" />
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="relative">
                <WifiOff size={14} className="text-emerald-400" />
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <span className="text-xs font-semibold text-emerald-400">Offline</span>
            </div>
            <button
              onClick={() => onNavigate('settings')}
              className="w-9 h-9 rounded-full glass flex items-center justify-center btn-press"
            >
              <Settings size={16} className="text-slate-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-5 mb-8">
        <div className="relative overflow-hidden rounded-3xl glass border border-white/5 p-6 animate-fade-in-up">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Signal size={14} className="text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400 tracking-wider uppercase">
                USSD *99# Active
              </span>
            </div>
            <h1 className="text-3xl font-extrabold leading-tight text-white mb-2">
              Pay anyone,
              <br />
              <span className="gradient-text">no internet needed.</span>
            </h1>
            <p className="text-sm text-slate-400 mb-5 leading-relaxed">
              2G pay uses your SIM's voice channel to send UPI payments through *99#.
              Zero bytes of data. Works on any phone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => onNavigate('scan')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-white font-semibold text-sm btn-press animate-pulse-glow"
              >
                <QrCode size={18} />
                Scan & Pay
              </button>
              <button
                onClick={() => onNavigate('send')}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl glass border border-white/10 text-white font-semibold text-sm btn-press"
              >
                <Send size={18} />
                Send
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-5 mb-8">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl glass p-4 animate-fade-in-up stagger-1">
            <p className="text-xs text-slate-500 font-medium mb-1">Transactions</p>
            <p className="text-2xl font-bold text-white">{recentCount}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">stored on-device</p>
          </div>
          <div className="rounded-2xl glass p-4 animate-fade-in-up stagger-2">
            <p className="text-xs text-slate-500 font-medium mb-1">Total Sent</p>
            <p className="text-2xl font-bold text-white">
              ₹{totalSent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-[10px] text-slate-600 mt-0.5">via *99# USSD</p>
          </div>
        </div>
      </section>

      {/* Quick Actions Grid */}
      <section className="px-5 mb-8">
        <h2 className="text-sm font-bold text-slate-300 mb-3 px-1">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <button
                key={f.title}
                onClick={() => onNavigate(f.screen)}
                className={`group rounded-2xl glass p-4 text-left btn-press animate-fade-in-up stagger-${i + 3} hover:border-emerald-500/20 transition-all duration-300`}
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={20} className="text-white" strokeWidth={2.5} />
                </div>
                <p className="text-sm font-bold text-white mb-0.5">{f.title}</p>
                <p className="text-xs text-slate-500">{f.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="px-5 mb-8">
        <h2 className="text-sm font-bold text-slate-300 mb-3 px-1">How It Works</h2>
        <div className="rounded-2xl glass p-5 animate-fade-in-up">
          <div className="space-y-4">
            {[
              { step: '01', title: 'Scan or enter UPI ID', desc: 'Scan any QR code or type a UPI ID manually', icon: QrCode },
              { step: '02', title: '2G pay dials *99*1*3#', desc: 'Your phone connects via USSD voice channel', icon: Radio },
              { step: '03', title: 'Enter your PIN', desc: 'Confirm the payment with your UPI PIN', icon: Lock },
              { step: '04', title: 'Payment complete', desc: 'Money sent. Saved to encrypted history', icon: Zap },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className={`flex items-start gap-3 animate-fade-in-up stagger-${i + 1}`}>
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                    <Icon size={16} className="text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-emerald-400/60">{s.step}</span>
                      <p className="text-sm font-semibold text-white">{s.title}</p>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why 2G pay */}
      <section className="px-5 mb-8">
        <h2 className="text-sm font-bold text-slate-300 mb-3 px-1">Why 2G pay?</h2>
        <div className="space-y-3">
          {[
            { icon: WifiOff, title: 'Zero Internet', desc: 'No Wi-Fi, no mobile data. Just a SIM with voice signal.' },
            { icon: Shield, title: 'Encrypted & Private', desc: 'Up to 200 transactions stored on-device with encryption.' },
            { icon: Zap, title: 'Lightning Fast', desc: 'Same modern feel as GPay or PhonePe. Type, scan, tap.' },
            { icon: Lock, title: 'No Tracking', desc: 'Zero analytics, zero tracking. Every call is on GitHub.' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={`flex items-center gap-4 rounded-2xl glass p-4 animate-fade-in-up stagger-${i + 1}`}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center">
                  <Icon size={20} className="text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer Links */}
      <section className="px-5 mb-6">
        <div className="rounded-2xl glass overflow-hidden animate-fade-in-up">
          {[
            { label: 'Setup Guide', icon: Settings, screen: 'setup' as Screen },
            { label: 'FAQ', icon: HelpCircle, screen: 'faq' as Screen },
            { label: 'Privacy Policy', icon: Shield, screen: 'privacy' as Screen },
          ].map((link, i) => {
            const Icon = link.icon;
            return (
              <button
                key={link.label}
                onClick={() => onNavigate(link.screen)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 btn-press hover:bg-white/5 transition-colors ${
                  i > 0 ? 'border-t border-white/5' : ''
                }`}
              >
                <Icon size={18} className="text-slate-400" />
                <span className="flex-1 text-left text-sm font-medium text-slate-300">{link.label}</span>
                <ChevronRight size={16} className="text-slate-600" />
              </button>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 mb-6">
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/15 p-5 text-center animate-fade-in-up">
          <p className="text-sm font-semibold text-white mb-1">Ready to pay offline?</p>
          <p className="text-xs text-slate-500 mb-4">Scan a QR code to get started in seconds</p>
          <button
            onClick={() => onNavigate('scan')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 text-white text-sm font-semibold btn-press"
          >
            Start Payment
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 text-center">
        <p className="text-xs text-slate-600">
          2G pay works over *99# USSD. Not supported on Jio.
        </p>
        <p className="text-xs text-slate-700 mt-1">
          Built for India. Works on any phone.
        </p>
      </footer>
    </div>
  );
}
