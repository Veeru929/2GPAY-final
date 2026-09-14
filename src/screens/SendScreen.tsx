import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ExternalLink,
  History,
  Phone,
  Radio,
  RotateCcw,
  ShieldCheck,
  X,
  Zap,
} from 'lucide-react';
import type { Screen } from '@/types';
import { addTransaction, updateTransactionStatus } from '@/lib/supabase';

type Props = {
  onNavigate: (screen: Screen) => void;
  scannedUpiId: string | null;
};

type Phase = 'form' | 'awaiting';

type PaymentDraft = {
  upiId: string;
  amount: string;
  note: string;
  transactionId: string | null;
};

function openUssdDialer() {
  window.location.href = 'tel:*99*1*3%23';
}

export function SendScreen({ onNavigate, scannedUpiId }: Props) {
  const [upiId, setUpiId] = useState(scannedUpiId || '');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [phase, setPhase] = useState<Phase>('form');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<PaymentDraft | null>(null);

  useEffect(() => {
    if (scannedUpiId) setUpiId(scannedUpiId);
  }, [scannedUpiId]);

  const handleSend = async () => {
    setError('');
    const recipient = upiId.trim();
    const parsedAmount = Number(amount);

    if (!recipient || !recipient.includes('@')) {
      setError('Enter a valid UPI ID, such as name@bank');
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount < 1 || parsedAmount > 5000) {
      setError('Enter an amount between ₹1 and ₹5,000');
      return;
    }

    const nextDraft: PaymentDraft = {
      upiId: recipient,
      amount,
      note: note.trim(),
      transactionId: null,
    };

    setDraft(nextDraft);
    setPhase('awaiting');
    openUssdDialer();
    setSaving(true);

    try {
      const transaction = await addTransaction({
        upi_id: recipient,
        amount: parsedAmount,
        note: note.trim(),
        status: 'pending',
        mode: 'manual',
      });
      setDraft((current) => current ? { ...current, transactionId: transaction.id } : current);
    } catch {
      setError('The dialer opened, but this payment could not be saved to history.');
    } finally {
      setSaving(false);
    }
  };

  const finishPayment = async (status: 'success' | 'failed') => {
    if (!draft) return;
    setError('');
    setSaving(true);

    try {
      if (draft.transactionId) {
        await updateTransactionStatus(draft.transactionId, status);
      } else {
        await addTransaction({
          upi_id: draft.upiId,
          amount: Number(draft.amount),
          note: draft.note,
          status,
          mode: 'manual',
        });
      }
      if (status === 'success') {
        setPhase('form');
        setUpiId('');
        setAmount('');
        setNote('');
        setDraft(null);
      } else {
        setPhase('form');
        setDraft(null);
      }
    } catch {
      setError('Could not update payment history. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setPhase('form');
    setDraft(null);
    setError('');
  };

  if (phase === 'awaiting' && draft) {
    return (
      <div className="min-h-screen mesh-bg flex flex-col items-center justify-center px-5 pb-8">
        <div className="w-full max-w-sm">
          <div className="relative flex flex-col items-center mb-8 animate-scale-in">
            <div className="relative w-32 h-32 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-pulse-glow" />
              <div className="absolute inset-2 rounded-full border-2 border-emerald-500/10 animate-spin-slow" style={{ borderTopColor: 'rgba(16,185,129,0.4)' }} />
              <Phone size={38} className="text-emerald-400" />
            </div>
          </div>

          <div className="rounded-3xl glass p-6 animate-fade-in-up">
            <div className="text-center mb-5">
              <p className="text-sm font-mono text-emerald-400 mb-1">*99*1*3#</p>
              <p className="text-xs text-slate-400">Your phone dialer should now be open</p>
            </div>

            <div className="rounded-2xl bg-blue-500/10 border border-blue-400/15 p-4 mb-5">
              <div className="flex items-start gap-3">
                <ExternalLink size={17} className="text-blue-300 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-100">Complete the payment in USSD</p>
                  <p className="text-xs text-blue-200/70 mt-1 leading-relaxed">
                    Choose your bank, verify the recipient and amount, then enter your UPI PIN on the bank screen. Never enter your PIN here.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs mb-5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Sending to</span>
                <span className="font-mono text-emerald-400">{draft.upiId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Amount</span>
                <span className="font-bold text-white">₹{draft.amount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">History status</span>
                <span className="text-amber-400">Waiting for confirmation</span>
              </div>
            </div>

            <button
              onClick={openUssdDialer}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-white font-semibold text-sm btn-press"
            >
              <Phone size={17} />
              Open Dialer Again
            </button>
            <p className="text-center text-[11px] text-slate-600 mt-3">
              If nothing opened, your browser or carrier may not support USSD links. Dial *99# manually.
            </p>
          </div>

          <div className="mt-4 space-y-3">
            <p className="text-center text-xs font-semibold text-slate-400">What happened?</p>
            <button
              onClick={() => finishPayment('success')}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-300 font-semibold text-sm btn-press disabled:opacity-50"
            >
              <Check size={18} />
              Payment completed
            </button>
            <button
              onClick={() => finishPayment('failed')}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl glass border border-white/10 text-slate-300 font-medium text-sm btn-press disabled:opacity-50"
            >
              <X size={17} />
              Payment failed or cancelled
            </button>
            <button
              onClick={reset}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-slate-500 text-sm btn-press disabled:opacity-50"
            >
              <RotateCcw size={15} />
              Decide later
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 mt-4 text-rose-400">
              <AlertCircle size={14} />
              <p className="text-xs">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-bg pb-24">
      <header className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => onNavigate('home')} className="w-9 h-9 rounded-full glass flex items-center justify-center btn-press">
          <ArrowLeft size={18} className="text-slate-300" />
        </button>
        <h1 className="text-base font-bold text-white">Send Money</h1>
      </header>

      <div className="px-5">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 mb-4 animate-fade-in">
          <Radio size={14} className="text-emerald-400" />
          <span className="text-xs font-mono text-emerald-400">*99*1*3#</span>
          <span className="text-xs text-slate-500">— real bank USSD</span>
          <span className="ml-auto text-xs text-slate-600">Dialer handoff</span>
        </div>

        <div className="rounded-3xl glass p-5 animate-fade-in-up">
          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">UPI ID</label>
            <input
              type="text"
              value={upiId}
              onChange={(event) => { setUpiId(event.target.value); setError(''); }}
              placeholder="name@bank"
              className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/50 border border-white/10 text-white text-sm font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/10 transition-all"
            />
          </div>

          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-500">₹</span>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                max="5000"
                value={amount}
                onChange={(event) => { setAmount(event.target.value); setError(''); }}
                placeholder="0"
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-900/50 border border-white/10 text-white text-2xl font-bold placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/10 transition-all"
              />
            </div>
            <div className="flex gap-2 mt-2">
              {[100, 200, 500, 1000].map((value) => (
                <button key={value} onClick={() => setAmount(String(value))} className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs text-slate-400 btn-press hover:border-emerald-500/20 hover:text-emerald-400 transition-all">
                  ₹{value}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Note (optional)</label>
            <input
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Add a note"
              maxLength={50}
              className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/50 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/10 transition-all"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 mb-4 text-rose-400">
              <AlertCircle size={14} />
              <p className="text-xs">{error}</p>
            </div>
          )}

          <button
            onClick={handleSend}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-white font-semibold text-sm btn-press animate-pulse-glow"
          >
            <Phone size={18} />
            Open Bank Dialer
          </button>
        </div>

        <div className="mt-4 flex items-start gap-2 px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/5">
          <ShieldCheck size={15} className="text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500">Your PIN is never stored or sent to this website. It is entered only in the bank’s official USSD screen.</p>
        </div>
        <div className="mt-3 flex items-start gap-2 px-4 py-3 rounded-2xl bg-amber-500/5 border border-amber-500/10">
          <Zap size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400">After the dialer opens, follow the bank prompts. Check the recipient and amount before entering your PIN.</p>
        </div>
        <button onClick={() => onNavigate('history')} className="w-full mt-4 flex items-center justify-center gap-2 text-xs text-slate-500 btn-press">
          <History size={14} />
          View payment history
        </button>
      </div>
    </div>
  );
}
