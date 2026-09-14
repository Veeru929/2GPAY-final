import { ArrowLeft, Shield, Lock, Eye, WifiOff, Database, FileText } from 'lucide-react';
import type { Screen } from '@/types';

type Props = {
  onNavigate: (screen: Screen) => void;
};

const sections = [
  {
    icon: WifiOff,
    title: 'Offline by Design',
    body: '2G pay operates completely offline. No internet connection is used at any point during a payment session. Your SIM card\'s voice channel handles all communication through *99*1*3# (send) and *99*3# (balance) USSD codes.'
  },
  {
    icon: Lock,
    title: 'Encrypted History',
    body: 'Up to 200 successful transactions are stored on-device with encryption. Your UPI ID, payment amount, and optional note are saved locally. This data never leaves your phone.',
  },
  {
    icon: Eye,
    title: 'No Tracking',
    body: '2G pay does not collect analytics, track usage, or send any data to any server. Zero analytics. Zero tracking. Every API call is open source and verifiable on GitHub.',
  },
  {
    icon: Shield,
    title: 'PIN Security',
    body: 'Your UPI PIN is entered only on your bank\'s USSD screen — never in the 2G pay app. It is never stored on-device, never sent to any server, and never touches the app memory.'
  },
  {
    icon: Database,
    title: 'Data We Store',
    body: 'Only the following is stored: recipient UPI ID, payment amount, optional note, transaction status, and timestamp. No personal information beyond what you enter for a payment. Balance checks are stored locally on your device only.'
  },
  {
    icon: Eye,
    title: 'Screen Recording',
    body: 'Since 2G pay works entirely offline, it cannot monitor or block active screen recording, casting, or remote-desktop apps (AnyDesk, Zoom, TeamViewer). Always ensure no screen recording apps are running during a payment.',
  },
  {
    icon: FileText,
    title: 'Open Source',
    body: 'Every permission, every API call, and every line of code is open source. You can verify the entire codebase before installing. There are no hidden network calls or background data collection.',
  },
];

export function PrivacyScreen({ onNavigate }: Props) {
  return (
    <div className="min-h-screen mesh-bg pb-24">
      <header className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={() => onNavigate('home')}
          className="w-9 h-9 rounded-full glass flex items-center justify-center btn-press"
        >
          <ArrowLeft size={18} className="text-slate-300" />
        </button>
        <h1 className="text-base font-bold text-white">Privacy Policy</h1>
      </header>

      <div className="px-5">
        {/* Hero */}
        <div className="rounded-3xl glass p-6 mb-4 animate-fade-in-up relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center mb-4">
              <Shield size={28} className="text-white" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Your data stays on your phone.</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              2G pay is built with privacy as the foundation. No servers, no tracking, no analytics.
              Everything happens on your device.
            </p>
            <p className="text-xs text-slate-600 mt-3">Last updated: September 2026</p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {sections.map((section, i) => {
            const Icon = section.icon;
            return (
              <div
                key={section.title}
                className={`rounded-2xl glass p-4 animate-fade-in-up stagger-${(i % 8) + 1}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center">
                    <Icon size={18} className="text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-white mb-1">{section.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{section.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-4 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 border border-white/5 p-5 animate-fade-in-up">
          <h3 className="text-sm font-bold text-white mb-3">In Summary</h3>
          <div className="space-y-2">
            {[
              'No internet connection used',
              'No analytics or tracking',
              'PIN never stored',
              'History encrypted on-device',
              'Fully open source',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <Shield size={10} className="text-emerald-400" strokeWidth={3} />
                </div>
                <p className="text-xs text-slate-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
