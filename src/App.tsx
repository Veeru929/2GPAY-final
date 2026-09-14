import { useState, useEffect } from 'react';
import type { Screen } from '@/types';
import { HomeScreen } from '@/screens/HomeScreen';
import { ScanScreen } from '@/screens/ScanScreen';
import { SendScreen } from '@/screens/SendScreen';
import { BalanceScreen } from '@/screens/BalanceScreen';
import { HistoryScreen } from '@/screens/HistoryScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { FAQScreen } from '@/screens/FAQScreen';
import { PrivacyScreen } from '@/screens/PrivacyScreen';
import { SetupScreen } from '@/screens/SetupScreen';
import { BottomNav } from '@/components/BottomNav';

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [scannedUpiId, setScannedUpiId] = useState<string | null>(null);

  const navigate = (s: Screen) => {
    setScreen(s);
    window.scrollTo(0, 0);
  };

  const handleScanComplete = (upiId: string) => {
    setScannedUpiId(upiId);
  };

  const navScreens: Screen[] = ['home', 'scan', 'send', 'balance', 'history'];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return <HomeScreen onNavigate={navigate} />;
      case 'scan':
        return <ScanScreen onNavigate={navigate} onScanComplete={handleScanComplete} />;
      case 'send':
        return <SendScreen onNavigate={navigate} scannedUpiId={scannedUpiId} />;
      case 'balance':
        return <BalanceScreen onNavigate={navigate} />;
      case 'history':
        return <HistoryScreen onNavigate={navigate} />;
      case 'settings':
        return <SettingsScreen onNavigate={navigate} />;
      case 'faq':
        return <FAQScreen onNavigate={navigate} />;
      case 'privacy':
        return <PrivacyScreen onNavigate={navigate} />;
      case 'setup':
        return <SetupScreen onNavigate={navigate} />;
      default:
        return <HomeScreen onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <div className="max-w-md mx-auto min-h-screen relative">
        {renderScreen()}
        {navScreens.includes(screen) && (
          <BottomNav active={screen} onNavigate={navigate} />
        )}
      </div>
    </div>
  );
}

export default App;
