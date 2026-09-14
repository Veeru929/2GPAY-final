import { useState } from 'react';
import {
  ArrowLeft,
  Smartphone,
  Radio,
  Landmark,
  Zap,
  Download,
  QrCode,
  Phone,
  ChevronDown,
} from 'lucide-react';
import type { Screen } from '@/types';

type Props = {
  onNavigate: (screen: Screen) => void;
};

const steps = [
  {
    icon: Smartphone,
    title: 'Check your SIM',
    desc: '2G pay works on any phone with a SIM that supports *99# USSD. Not supported on Jio.',
    detail: 'Airtel, Vi, BSNL, and most carriers support USSD. If unsure, dial *99# from your phone — if you see a menu, you\'re good to go.',
  },
  {
    icon: Landmark,
    title: 'Link your bank',
    desc: 'Dial *99# once to link your bank account for offline UPI.',
    detail: 'Dial *99# from your phone. Follow the menu to select your bank and confirm. This is a one-time setup. After linking, 2G pay handles everything.',
  },
  {
    icon: Download,
    title: 'Install 2G pay',
    desc: 'Add the PWA to your home screen or install the Android app.',
    detail: 'On Android: open this page in Chrome, tap the menu, and select "Add to Home Screen". On iPhone: tap Share, then "Add to Home Screen". The app works offline after first load.',
  },
  {
    icon: Phone,
    title: 'Understand the flow',
    desc: '2G pay opens your dialer with the right *99# code. You complete the payment on the bank screen.',
    detail: "When you tap Send, 2G pay opens your phone dialer with *99*1*3# pre-filled. Follow the bank's USSD menu to verify the recipient, enter your UPI PIN, and confirm. Then come back to the app and mark the payment as completed or failed.",
  },
  {
    icon: QrCode,
    title: 'Start paying',
    desc: 'Scan a QR code or enter a UPI ID to send your first payment.',
    detail: 'Tap "Scan & Pay" on the home screen to scan any UPI QR code, or enter a UPI ID manually. Enter the amount, tap "Open Bank Dialer", and complete the payment on the USSD screen.',
  },
];

export function SetupScreen({ onNavigate }: Props) {
  const [openStep, setOpenStep] = useState<number | null>(0);

  return (
    <div className="min-h-screen mesh-bg pb-24">
      <header className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={() => onNavigate('home')}
          className="w-9 h-9 rounded-full glass flex items-center justify-center btn-press"
        >
          <ArrowLeft size={18} className="text-slate-300" />
        </button>
        <h1 className="text-base font-bold text-white">Setup Guide</h1>
      </header>

      <div className="px-5">
        {/* Hero */}
        <div className="rounded-3xl glass p-6 mb-4 animate-fade-in-up relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} className="text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Quick Setup</span>
            </div>
            <h2 className="text-lg font-bold text-white mb-1">Get started in 2 minutes</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Follow these steps to start sending UPI payments without internet.
            </p>
          </div>
        </div>

        {/* Timeline steps */}
        <div className="space-y-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isOpen = openStep === i;
            const isLast = i === steps.length - 1;
            return (
              <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className={`rounded-2xl glass overflow-hidden transition-all duration-300 ${
                  isOpen ? 'border-emerald-500/15' : ''
                }`}>
                  <button
                    onClick={() => setOpenStep(isOpen ? null : i)}
                    className="w-full flex items-center gap-3 px-4 py-4 btn-press text-left"
                  >
                    {/* Step number / icon */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        isOpen
                          ? 'bg-gradient-to-br from-emerald-400 to-cyan-500'
                          : 'bg-white/5'
                      }`}>
                        {isOpen ? (
                          <Icon size={18} className="text-white" />
                        ) : (
                          <span className="text-sm font-bold text-slate-400">{i + 1}</span>
                        )}
                      </div>
                      {!isLast && (
                        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-3 bg-white/5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${isOpen ? 'text-white' : 'text-slate-300'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{step.desc}</p>
                    </div>

                    <ChevronDown
                      size={16}
                      className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isOpen ? 'max-h-60' : 'max-h-0'
                    }`}
                  >
                    <p className="px-4 pb-4 pl-16 text-xs text-slate-400 leading-relaxed">
                      {step.detail}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* USSD Code reference */}
        <div className="mt-4 rounded-2xl glass p-5 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-3">
            <Radio size={16} className="text-emerald-400" />
            <p className="text-sm font-bold text-white">USSD Quick Reference</p>
          </div>
          <div className="space-y-2">
            {[
              { code: '*99#', label: 'Main menu' },
              { code: '*99*1*3#', label: 'Send money (UPI ID)' },
              { code: '*99*3#', label: 'Check balance' },
            ].map((item) => (
              <div key={item.code} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02]">
                <span className="text-xs font-mono text-emerald-400">{item.code}</span>
                <span className="text-xs text-slate-500">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 border border-white/5 p-5 text-center animate-fade-in-up">
          <p className="text-sm font-semibold text-white mb-1">All set?</p>
          <p className="text-xs text-slate-500 mb-4">Start your first offline payment now</p>
          <button
            onClick={() => onNavigate('scan')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 text-white text-sm font-semibold btn-press"
          >
            <QrCode size={16} />
            Scan & Pay
          </button>
        </div>
      </div>
    </div>
  );
}
