import { Home, QrCode, Send, Wallet, Clock } from 'lucide-react';
import type { Screen } from '@/types';

type Props = {
  active: Screen;
  onNavigate: (screen: Screen) => void;
};

const items: { id: Screen; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'scan', label: 'Scan', icon: QrCode },
  { id: 'send', label: 'Send', icon: Send },
  { id: 'balance', label: 'Balance', icon: Wallet },
  { id: 'history', label: 'History', icon: Clock },
];

export function BottomNav({ active, onNavigate }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="glass-strong border-t border-white/5">
        <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="flex flex-col items-center gap-1 px-3 py-1.5 btn-press no-select"
              >
                <div className={`relative transition-all duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? 'text-emerald-400' : 'text-slate-500'}
                  />
                  {isActive && (
                    <div className="absolute -inset-2 rounded-full bg-emerald-400/10 blur-md -z-10" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-semibold tracking-wide transition-colors duration-300 ${
                    isActive ? 'text-emerald-400' : 'text-slate-600'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
