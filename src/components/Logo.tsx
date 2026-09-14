import { WifiOff } from 'lucide-react';

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = {
    sm: { box: 'w-8 h-8', text: 'text-base', icon: 16 },
    md: { box: 'w-10 h-10', text: 'text-lg', icon: 20 },
    lg: { box: 'w-14 h-14', text: 'text-2xl', icon: 28 },
  };
  const d = dims[size];

  return (
    <div className="flex items-center gap-2 no-select">
      <div className={`${d.box} rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/20 to-transparent" />
        <WifiOff size={d.icon} className="text-white relative z-10" strokeWidth={2.5} />
      </div>
      <span className={`${d.text} font-extrabold tracking-tight text-white`}>
        2G<span className="text-emerald-400">pay</span>
      </span>
    </div>
  );
}

export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <div
      className="rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center relative overflow-hidden"
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/20 to-transparent" />
      <WifiOff size={size * 0.5} className="text-white relative z-10" strokeWidth={2.5} />
    </div>
  );
}
