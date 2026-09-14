import { useCallback, useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import {
  AlertCircle,
  ArrowRight,
  Check,
  ClipboardCheck,
  ImagePlus,
  Loader2,
  QrCode,
  ScanLine,
  X,
  Zap,
} from 'lucide-react';
import type { Screen } from '@/types';

type Props = {
  onNavigate: (screen: Screen) => void;
  onScanComplete: (upiId: string) => void;
};

type ScanState = 'idle' | 'starting' | 'scanning' | 'scanned' | 'denied' | 'error';

function extractUpiId(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Direct UPI ID
  if (/^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z0-9.\-_]{2,}$/.test(trimmed)) {
    return trimmed;
  }

  // upi://pay?pa=xxx@bank&...
  const paMatch = trimmed.match(/[?&]pa=([^&]+)/);
  if (paMatch) {
    const decoded = decodeURIComponent(paMatch[1]);
    if (/^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z0-9.\-_]{2,}$/.test(decoded)) {
      return decoded;
    }
  }

  // upi://xxx@bank
  const upiMatch = trimmed.match(/^upi:\/\/([^?&]+)/);
  if (upiMatch) {
    const decoded = decodeURIComponent(upiMatch[1]);
    if (/^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z0-9.\-_]{2,}$/.test(decoded)) {
      return decoded;
    }
  }

  // Any substring that looks like a UPI ID
  const generic = trimmed.match(/[a-zA-Z0-9.\-_]{2,}@[a-zA-Z0-9.\-_]{2,}/);
  if (generic) return generic[0];

  return null;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  }
}

export function ScanScreen({ onNavigate, onScanComplete }: Props) {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [upiId, setUpiId] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [manualMode, setManualMode] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [imageScanning, setImageScanning] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const handleDetected = useCallback(async (raw: string) => {
    const extracted = extractUpiId(raw);
    if (!extracted) {
      setError('QR code found, but no UPI ID could be extracted from it.');
      return;
    }

    stopCamera();
    setUpiId(extracted);
    setScanState('scanned');

    const ok = await copyToClipboard(extracted);
    setCopied(ok);
  }, [stopCamera]);

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(video, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const code = jsQR(imageData.data, width, height, { inversionAttempts: 'dontInvert' });

    if (code && code.data) {
      handleDetected(code.data);
      return;
    }

    rafRef.current = requestAnimationFrame(scanFrame);
  }, [handleDetected]);

  const startCamera = useCallback(async () => {
    setScanState('starting');
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      setScanState('scanning');
      rafRef.current = requestAnimationFrame(scanFrame);
    } catch (err) {
      const name = (err as DOMException)?.name;
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        setScanState('denied');
      } else {
        setScanState('error');
        setError('Could not start the camera. Try entering the UPI ID manually.');
      }
    }
  }, [scanFrame]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleRescan = () => {
    setUpiId('');
    setCopied(false);
    setError('');
    startCamera();
  };

  const handleProceed = () => {
    onScanComplete(upiId);
    onNavigate('send');
  };

  const handleManualSubmit = () => {
    const trimmed = manualInput.trim();
    if (!trimmed) {
      setError('Enter a UPI ID');
      return;
    }
    if (!trimmed.includes('@')) {
      setError('Invalid UPI ID format (e.g. name@bank)');
      return;
    }
    onScanComplete(trimmed);
    onNavigate('send');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageScanning(true);
    setError('');

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        setImageScanning(false);
        setError('Could not process the image.');
        return;
      }

      const maxDim = 1000;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = maxDim / Math.max(width, height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      const code = jsQR(imageData.data, width, height, { inversionAttempts: 'attemptBoth' });

      setImageScanning(false);

      if (code && code.data) {
        handleDetected(code.data);
      } else {
        setError('No QR code found in the image. Try a clearer photo.');
      }
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      setImageScanning(false);
      setError('Could not load the image.');
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen mesh-bg pb-24">
      <header className="px-5 pt-12 pb-4 flex items-center justify-between">
        <button onClick={() => onNavigate('home')} className="w-9 h-9 rounded-full glass flex items-center justify-center btn-press">
          <X size={18} className="text-slate-300" />
        </button>
        <h1 className="text-base font-bold text-white">Scan QR Code</h1>
        <div className="w-9" />
      </header>

      {!manualMode && (
        <div className="px-5">
          {/* Scanner viewport */}
          <div className="relative aspect-square max-w-sm mx-auto rounded-3xl overflow-hidden glass border border-white/5 animate-scale-in">
            {/* Live camera feed */}
            {(scanState === 'starting' || scanState === 'scanning') && (
              <video
                ref={videoRef}
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <canvas ref={canvasRef} className="hidden" />

            {/* Grid background for idle/denied/error states */}
            {(scanState === 'idle' || scanState === 'denied' || scanState === 'error') && (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: `linear-gradient(rgba(16,185,129,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.1) 1px, transparent 1px)`,
                  backgroundSize: '20px 20px',
                }} />
              </div>
            )}

            {/* Scanner corners + scan line */}
            {(scanState === 'starting' || scanState === 'scanning') && (
              <>
                <div className="absolute inset-12 z-20 pointer-events-none">
                  <div className="scanner-corner scanner-corner-tl" />
                  <div className="scanner-corner scanner-corner-tr" />
                  <div className="scanner-corner scanner-corner-bl" />
                  <div className="scanner-corner scanner-corner-br" />
                </div>
                <div className="absolute left-12 right-12 z-20 animate-scan-line pointer-events-none" style={{ height: '2px' }}>
                  <div className="h-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_rgba(16,185,129,0.8)]" />
                </div>
              </>
            )}

            {/* Scanned result overlay */}
            {scanState === 'scanned' && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/85 backdrop-blur-sm animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 animate-scale-in">
                  <Check size={32} className="text-emerald-400" strokeWidth={3} />
                </div>
                <p className="text-sm font-semibold text-white mb-1">UPI ID Detected</p>
                <p className="text-xs text-emerald-400 font-mono mb-2">{upiId}</p>
                {copied ? (
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <ClipboardCheck size={13} />
                    <span className="text-xs font-semibold">Copied to clipboard</span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Copy failed — UPI ID is shown above</p>
                )}
              </div>
            )}

            {/* Idle state */}
            {scanState === 'idle' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <QrCode size={64} className="text-slate-700" strokeWidth={1} />
                <p className="text-xs text-slate-600 mt-3 mb-4">Tap below to start camera</p>
                <button
                  onClick={startCamera}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 text-white text-sm font-semibold btn-press"
                >
                  Start Camera
                </button>
              </div>
            )}

            {/* Starting state */}
            {scanState === 'starting' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-900/60">
                <Loader2 size={28} className="text-emerald-400 animate-spin mb-2" />
                <p className="text-xs text-slate-400">Starting camera...</p>
              </div>
            )}

            {/* Denied state */}
            {scanState === 'denied' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6 text-center">
                <AlertCircle size={36} className="text-amber-400 mb-3" />
                <p className="text-sm font-semibold text-white mb-1">Camera permission needed</p>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Allow camera access to scan QR codes, or upload a photo of a QR code instead.
                </p>
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  <button onClick={startCamera} className="px-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 text-white text-sm font-semibold btn-press">
                    Try Again
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2.5 rounded-full glass border border-white/10 text-slate-300 text-sm font-medium btn-press">
                    Upload QR Photo
                  </button>
                </div>
              </div>
            )}

            {/* Error state */}
            {scanState === 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6 text-center">
                <AlertCircle size={36} className="text-rose-400 mb-3" />
                <p className="text-sm font-semibold text-white mb-1">Camera error</p>
                <p className="text-xs text-slate-500 mb-4">{error}</p>
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  <button onClick={startCamera} className="px-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 text-white text-sm font-semibold btn-press">
                    Retry Camera
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2.5 rounded-full glass border border-white/10 text-slate-300 text-sm font-medium btn-press">
                    Upload QR Photo
                  </button>
                </div>
              </div>
            )}

            {imageScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-slate-900/80">
                <Loader2 size={28} className="text-emerald-400 animate-spin mb-2" />
                <p className="text-xs text-slate-400">Scanning image...</p>
              </div>
            )}
          </div>

          {/* Status text */}
          <div className="text-center mt-6 h-6">
            {scanState === 'scanning' && <p className="text-sm text-emerald-400 animate-pulse">Scanning...</p>}
            {scanState === 'starting' && <p className="text-sm text-slate-500">Starting camera...</p>}
            {scanState === 'scanned' && (
              <p className="text-sm text-slate-400">
                {copied ? 'UPI ID copied — paste it in the USSD session' : 'UPI ID detected'}
              </p>
            )}
          </div>

          {/* Action buttons after scan */}
          {scanState === 'scanned' && (
            <div className="mt-4 space-y-3 animate-fade-in-up">
              <button
                onClick={handleProceed}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-white font-semibold text-sm btn-press animate-pulse-glow"
              >
                <Zap size={18} />
                Pay to {upiId}
                <ArrowRight size={16} />
              </button>
              <button
                onClick={handleRescan}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl glass border border-white/10 text-slate-300 font-medium text-sm btn-press"
              >
                <ScanLine size={16} />
                Scan Again
              </button>
            </div>
          )}

          {/* Controls while scanning */}
          {(scanState === 'scanning' || scanState === 'starting') && (
            <div className="mt-4 space-y-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl glass border border-white/10 text-slate-300 font-medium text-sm btn-press"
              >
                <ImagePlus size={16} />
                Upload QR Photo
              </button>
              <button
                onClick={() => { stopCamera(); setManualMode(true); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl glass border border-white/10 text-slate-300 font-medium text-sm btn-press"
              >
                Enter UPI ID Manually
              </button>
            </div>
          )}

          {/* Controls for idle/denied/error */}
          {(scanState === 'idle' || scanState === 'denied' || scanState === 'error') && (
            <div className="mt-4 space-y-3">
              <button
                onClick={() => setManualMode(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl glass border border-white/10 text-slate-300 font-medium text-sm btn-press"
              >
                Enter UPI ID Manually
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Manual Entry */}
      {manualMode && (
        <div className="px-5 mt-4 animate-fade-in-up">
          <div className="rounded-3xl glass p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center">
                <QrCode size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Enter UPI ID</p>
                <p className="text-xs text-slate-500">Type the recipient's UPI ID</p>
              </div>
            </div>

            <input
              type="text"
              value={manualInput}
              onChange={(e) => { setManualInput(e.target.value); setError(''); }}
              placeholder="name@bank"
              className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/50 border border-white/10 text-white text-sm font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/10 transition-all"
              autoFocus
            />

            {error && (
              <div className="flex items-center gap-2 mt-3 text-rose-400">
                <AlertCircle size={14} />
                <p className="text-xs">{error}</p>
              </div>
            )}

            <div className="mt-4 space-y-3">
              <button
                onClick={handleManualSubmit}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-white font-semibold text-sm btn-press"
              >
                <Check size={18} />
                Confirm UPI ID
              </button>
              <button
                onClick={() => { setManualMode(false); setManualInput(''); setError(''); }}
                className="w-full px-4 py-3 rounded-2xl glass border border-white/10 text-slate-400 font-medium text-sm btn-press"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="px-5 mt-6">
        <div className="rounded-2xl bg-blue-500/5 border border-blue-500/10 p-4 flex items-start gap-3">
          <AlertCircle size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400 leading-relaxed">
            Point your camera at any UPI QR code. The UPI ID is extracted and copied to your clipboard automatically — paste it in the USSD session. Works without internet. Not supported on Jio SIMs.
          </p>
        </div>
      </div>
    </div>
  );
}
