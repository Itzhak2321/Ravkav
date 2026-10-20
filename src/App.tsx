import React, { useState } from 'react';
import {
  Radio,
  CreditCard,
  Calculator,
  Info,
  Sparkles,
  ShieldCheck,
  PhoneCall,
  Bus,
  Train,
} from 'lucide-react';
import { RavKavCard } from './types/ravkav';
import { SAMPLE_CARDS } from './data/sampleCards';
import { Navbar } from './components/Navbar';
import { NfcScanner } from './components/NfcScanner';
import { CardDashboard } from './components/CardDashboard';
import { FareCalculator } from './components/FareCalculator';
import { RechargeModal } from './components/RechargeModal';
import { NfcGuideModal } from './components/NfcGuideModal';
import { AndroidCodeExportModal } from './components/AndroidCodeExportModal';
import { Code2 } from 'lucide-react';

export default function App() {
  const [activeCard, setActiveCard] = useState<RavKavCard>(SAMPLE_CARDS[0]);
  const [activeTab, setActiveTab] = useState<'scanner' | 'card' | 'calculator' | 'guide'>('scanner');
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isCodeExportOpen, setIsCodeExportOpen] = useState(false);
  const [isScanningActive, setIsScanningActive] = useState(false);

  const handleCardLoaded = (card: RavKavCard) => {
    setActiveCard(card);
    setActiveTab('card');
  };

  const handleCardUpdated = (updatedCard: RavKavCard) => {
    setActiveCard(updatedCard);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Bar Contract */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'guide') {
            setIsGuideOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenRecharge={() => setIsRechargeOpen(true)}
        hasActiveCard={!!activeCard}
        nfcActive={isScanningActive}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Editorial Sub-Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="relative h-44 sm:h-52 w-full overflow-hidden">
            <img
              src="/src/assets/images/ravkav_hero_banner_1792152227537.jpg"
              alt="תחבורה ציבורית בישראל"
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            {/* Measured contrast scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

            {/* Banner Text Overlays */}
            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 left-4 sm:left-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 text-white">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
                  <span>תחבורה ציבורית חכמה בישראל</span>
                  <span className="text-white/40">·</span>
                  <span>סורק כרטיסים חכם</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white drop-shadow-sm">
                  קריאה וניהול כרטיסי רב-קו בטכנולוגיית NFC
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl line-clamp-2">
                  בדוק יתרות ערך צבור, תוקף מנויים חודשיים והיסטוריית נסיעות באוטובוסים, דנקל, כפיר ורכבת ישראל.
                </p>
              </div>

              {/* Quick Jump Buttons */}
              <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  onClick={() => setIsCodeExportOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-purple-600/90 hover:bg-purple-600 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>קוד מקור לאפליקציית Android (APK)</span>
                </button>

                <button
                  onClick={() => setIsGuideOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md text-xs font-medium text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>איך סורקים ב-NFC?</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab View Switcher */}
        {activeTab === 'scanner' && (
          <NfcScanner
            onCardLoaded={handleCardLoaded}
            activeCard={activeCard}
            onOpenGuide={() => setIsGuideOpen(true)}
            onOpenRecharge={() => setIsRechargeOpen(true)}
          />
        )}

        {activeTab === 'card' && activeCard && (
          <CardDashboard
            card={activeCard}
            onOpenRecharge={() => setIsRechargeOpen(true)}
            onCardUpdated={handleCardUpdated}
          />
        )}

        {activeTab === 'calculator' && <FareCalculator />}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (Mobile Ergonomics) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-4 items-center h-16 pb-safe">
        <button
          onClick={() => setActiveTab('scanner')}
          className={`flex flex-col items-center justify-center h-full cursor-pointer transition-colors ${
            activeTab === 'scanner'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Radio className="w-5 h-5" />
          <span className="text-[10px] mt-1">סורק</span>
        </button>

        <button
          onClick={() => setActiveTab('card')}
          className={`flex flex-col items-center justify-center h-full cursor-pointer transition-colors ${
            activeTab === 'card'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span className="text-[10px] mt-1">כרטיס</span>
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex flex-col items-center justify-center h-full cursor-pointer transition-colors ${
            activeTab === 'calculator'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calculator className="w-5 h-5" />
          <span className="text-[10px] mt-1">מחשבון</span>
        </button>

        <button
          onClick={() => setIsGuideOpen(true)}
          className="flex flex-col items-center justify-center h-full cursor-pointer text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <Info className="w-5 h-5" />
          <span className="text-[10px] mt-1">מדריך</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 text-xs py-8 mb-16 md:mb-0 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
              ר
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              קורא רב-קו NFC חכם · מבוסס תקן Calypso ו-Web NFC
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>מוקד כל-קו: <strong>*8787</strong></span>
            <span>·</span>
            <span>רפורמת דרך שווה</span>
            <span>·</span>
            <span>סריקה מקומית מאובטחת</span>
          </div>
        </div>
      </footer>

      {/* Recharge Modal */}
      {activeCard && (
        <RechargeModal
          card={activeCard}
          isOpen={isRechargeOpen}
          onClose={() => setIsRechargeOpen(false)}
          onCardUpdated={handleCardUpdated}
        />
      )}

      {/* NFC Guide Modal */}
      <NfcGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Android Code Export Modal */}
      <AndroidCodeExportModal isOpen={isCodeExportOpen} onClose={() => setIsCodeExportOpen(false)} />
    </div>
  );
}
