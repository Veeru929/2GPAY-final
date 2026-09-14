import { useEffect, useState, useRef } from 'react';
import {
  ArrowLeft,
  Trash2,
  RotateCcw,
  Check,
  X,
  Clock,
  AlertCircle,
  Inbox,
  Loader2,
} from 'lucide-react';
import type { Screen } from '@/types';
import {
  getTransactions,
  deleteTransaction,
  updateTransactionStatus,
  type Transaction,
} from '@/lib/supabase';

export function HistoryScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');
  const touchStart = useRef<number>(0);
  const [touchX, setTouchX] = useState<Record<string, number>>({});

  const load = async () => {
    setLoading(true);
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setSwipedId(null);
    } catch {
      // silent
    }
  };

  const handleRetry = async (id: string) => {
    try {
      await updateTransactionStatus(id, 'success');
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: 'success' } : t))
      );
    } catch {
      // silent
    }
  };

  const filtered = transactions.filter((t) => filter === 'all' || t.status === filter);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return `Today, ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (d.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen mesh-bg pb-24">
      <header className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={() => onNavigate('home')}
          className="w-9 h-9 rounded-full glass flex items-center justify-center btn-press"
        >
          <ArrowLeft size={18} className="text-slate-300" />
        </button>
        <h1 className="text-base font-bold text-white">Payment History</h1>
      </header>

      <div className="px-5">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          {(['all', 'success', 'failed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all btn-press ${
                filter === f
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  : 'glass text-slate-500 border border-white/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center pt-20">
            <Loader2 size={32} className="text-emerald-400 animate-spin mb-3" />
            <p className="text-xs text-slate-500">Loading history...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <Inbox size={28} className="text-slate-600" />
            </div>
            <p className="text-sm font-semibold text-slate-400 mb-1">No transactions yet</p>
            <p className="text-xs text-slate-600 mb-5">Your payments will appear here</p>
            <button
              onClick={() => onNavigate('send')}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 text-white text-sm font-semibold btn-press"
            >
              Make First Payment
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((tx, i) => (
              <div
                key={tx.id}
                className="relative overflow-hidden rounded-2xl animate-fade-in-up"
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                {/* Delete background */}
                <div className="absolute inset-0 flex items-center justify-end px-4 bg-rose-500/10 rounded-2xl">
                  <button
                    onClick={() => handleDelete(tx.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/20 text-rose-400 text-xs font-semibold btn-press"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>

                {/* Swipeable card */}
                <div
                  className="relative glass rounded-2xl p-4 transition-transform duration-300"
                  style={{
                    transform: swipedId === tx.id ? 'translateX(-80px)' : `translateX(${touchX[tx.id] || 0}px)`,
                  }}
                  onTouchStart={(e) => {
                    touchStart.current = e.touches[0].clientX;
                  }}
                  onTouchMove={(e) => {
                    const diff = e.touches[0].clientX - touchStart.current;
                    if (diff < 0 && diff > -100) {
                      setTouchX((prev) => ({ ...prev, [tx.id]: diff }));
                    }
                  }}
                  onTouchEnd={() => {
                    const x = touchX[tx.id] || 0;
                    if (x < -40) {
                      setSwipedId(tx.id);
                    } else {
                      setSwipedId(null);
                    }
                    setTouchX((prev) => ({ ...prev, [tx.id]: 0 }));
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Status icon */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                        tx.status === 'success'
                          ? 'bg-emerald-500/10'
                          : tx.status === 'failed'
                          ? 'bg-rose-500/10'
                          : 'bg-amber-500/10'
                      }`}
                    >
                      {tx.status === 'success' ? (
                        <Check size={18} className="text-emerald-400" strokeWidth={2.5} />
                      ) : tx.status === 'failed' ? (
                        <X size={18} className="text-rose-400" strokeWidth={2.5} />
                      ) : (
                        <Clock size={18} className="text-amber-400" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate font-mono">{tx.upi_id}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-slate-500">{formatDate(tx.created_at)}</p>
                        {tx.note && (
                          <>
                            <span className="text-slate-700">·</span>
                            <p className="text-xs text-slate-500 truncate">{tx.note}</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Amount + mode */}
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${
                        tx.status === 'success' ? 'text-white' : 'text-slate-600'
                      }`}>
                        ₹{Number(tx.amount).toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-slate-600 capitalize mt-0.5">{tx.mode}</p>
                    </div>
                  </div>

                  {/* Retry for failed */}
                  {tx.status === 'failed' && (
                    <button
                      onClick={() => handleRetry(tx.id)}
                      className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/15 text-amber-400 text-xs font-semibold btn-press"
                    >
                      <RotateCcw size={12} />
                      Retry Payment
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <AlertCircle size={14} className="text-slate-500 flex-shrink-0" />
            <p className="text-xs text-slate-500">
              Swipe left on any transaction to delete. Up to 200 transactions stored on-device.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
