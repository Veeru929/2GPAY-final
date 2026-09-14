import { useState } from 'react';
import { ArrowLeft, ChevronDown, HelpCircle } from 'lucide-react';
import type { Screen } from '@/types';

type Props = {
  onNavigate: (screen: Screen) => void;
};

const faqs = [
  {
    q: 'What is 2G pay?',
    a: '2G pay is an app that lets you send UPI payments without the internet. It works over your SIM card\'s voice channel using the *99# USSD service. You can scan QR codes, enter UPI IDs, check your balance, and view payment history — all offline.',
  },
  {
    q: 'How does it work without internet?',
    a: '2G pay uses the USSD (Unstructured Supplementary Service Data) channel, which works over your SIM\'s voice signal. No Wi-Fi or mobile data is needed. Your phone dials *99# and communicates with your bank through SMS-style menus over the voice channel.',
  },
  {
    q: 'How does the payment process work?',
    a: 'When you tap Send, 2G pay opens your phone dialer with *99*1*3# pre-filled. You complete the payment on your bank\'s USSD screen by following the menu prompts — verify the recipient, enter your UPI PIN, and confirm. Your PIN is never entered in or sent to the app. After completing the USSD session, come back and mark the payment as completed or failed.',
  },
  {
    q: 'Do I need to set up anything first?',
    a: 'Yes. Your SIM card must be registered for *99# services with your bank. If you have never used offline UPI before, dial *99# from your phone once to complete the one-time bank linking process. After that, 2G pay handles everything.',
  },
  {
    q: 'Which banks are supported?',
    a: '2G pay works with all banks that support the *99# USSD service. This includes SBI, HDFC, ICICI, Axis, PNB, Bank of Baroda, Canara, Kotak, Yes Bank, IDBI, and many more. Select your bank in Settings.',
  },
  {
    q: 'Does it work on Jio SIMs?',
    a: 'No. Jio does not support the *99# USSD service because it operates on an all-IP network without a traditional voice channel. 2G pay works on Airtel, Vi, BSNL, and other carriers that support USSD.',
  },
  {
    q: 'What are the transaction limits?',
    a: 'You can send ₹1 to ₹5,000 per transaction through *99*1*3# USSD. Up to 200 transactions are stored on-device with encryption. There is no limit on the number of transactions per day, but each is capped at ₹5,000.',
  },
  {
    q: 'Is my data safe?',
    a: 'Yes. 2G pay operates completely offline. Your UPI ID, payment amount, and optional note live in app memory during a session. On success, they are saved to an encrypted on-device history. No data is sent to any server. Zero analytics, zero tracking.',
  },
  {
    q: 'Can someone record my screen during payment?',
    a: 'Since 2G pay works entirely offline, it cannot monitor or block active screen recording, casting, or remote-desktop apps (AnyDesk, Zoom, TeamViewer). Always ensure no screen recording apps are running during a payment session.',
  },
  {
    q: 'Is 2G pay affiliated with NPCI or BHIM?',
    a: 'No. 2G pay is an independent app that uses the NPCI BHIM *99# USSD infrastructure for offline UPI payments. It is not affiliated with NPCI, BHIM, or any government entity. The *99# service is provided by your bank and NPCI.',
  },
  {
    q: 'What happens if a payment fails?',
    a: 'If a payment fails, it is saved to your history with a "failed" status. You can retry the payment by tapping the "Retry" button on the failed transaction in your history. The money is not debited from your account for failed transactions.',
  },
  {
    q: 'Can I delete my transaction history?',
    a: 'Yes. Swipe left on any transaction in the History screen to reveal the delete button. You can delete individual transactions at any time. All data is stored on-device, so deleting a transaction permanently removes it.',
  },
];

export function FAQScreen({ onNavigate }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen mesh-bg pb-24">
      <header className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={() => onNavigate('home')}
          className="w-9 h-9 rounded-full glass flex items-center justify-center btn-press"
        >
          <ArrowLeft size={18} className="text-slate-300" />
        </button>
        <h1 className="text-base font-bold text-white">FAQ</h1>
      </header>

      <div className="px-5">
        {/* Header card */}
        <div className="rounded-2xl glass p-5 mb-4 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center">
              <HelpCircle size={22} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Frequently Asked Questions</p>
              <p className="text-xs text-slate-500 mt-0.5">Everything you need to know about 2G pay</p>
            </div>
          </div>
        </div>

        {/* FAQ accordion */}
        <div className="space-y-2">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`rounded-2xl glass overflow-hidden animate-fade-in-up transition-all duration-300 ${
                  isOpen ? 'border-emerald-500/15' : ''
                }`}
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center gap-3 px-4 py-4 btn-press text-left"
                >
                  <span className={`text-xs font-mono ${isOpen ? 'text-emerald-400' : 'text-slate-600'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className={`flex-1 text-sm font-semibold ${isOpen ? 'text-white' : 'text-slate-300'}`}>
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <p className="px-4 pb-4 pl-12 text-xs text-slate-400 leading-relaxed whitespace-pre-line">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Still have questions */}
        <div className="mt-6 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 border border-white/5 p-5 text-center animate-fade-in-up">
          <p className="text-sm font-semibold text-white mb-1">Still have questions?</p>
          <p className="text-xs text-slate-500 mb-4">Check the setup guide for step-by-step instructions</p>
          <button
            onClick={() => onNavigate('setup')}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 text-white text-sm font-semibold btn-press"
          >
            View Setup Guide
          </button>
        </div>
      </div>
    </div>
  );
}
