import React from 'react';
import { Radio, Info, Calculator, CreditCard, Sparkles, ExternalLink } from 'lucide-react';

interface NavbarProps {
  activeTab: 'scanner' | 'card' | 'calculator' | 'guide';
  onSelectTab: (tab: 'scanner' | 'card' | 'calculator' | 'guide') => void;
  onOpenRecharge: () => void;
  hasActiveCard: boolean;
  nfcActive: boolean;
  isInIframe?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenRecharge,
  hasActiveCard,
  nfcActive,
  isInIframe,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-8">
        {/* Zone 1: Brand wordmark */}
        <button
          onClick={() => onSelectTab('scanner')}
          className="flex items-center gap-2 text-right cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg shrink-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm group-hover:bg-emerald-700 transition-colors shrink-0">
            <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-50" />
          </div>
          <div className="flex flex-col text-right">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-base sm:text-lg leading-tight whitespace-nowrap">
                רב-קו NFC
              </span>
              <span className="hidden xs:inline-block text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded text-left" dir="ltr">
                Reader
              </span>
            </div>
            <span className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-normal truncate max-w-[160px]">
              קריאת כרטיסי תחבורה
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (Desktop only, single-line) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onSelectTab('scanner')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'scanner'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600 dark:border-emerald-400'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4" />
            סורק כרטיסים
          </button>

          <button
            onClick={() => onSelectTab('card')}
            disabled={!hasActiveCard}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
              !hasActiveCard
                ? 'opacity-40 cursor-not-allowed'
                : activeTab === 'card'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600 dark:border-emerald-400'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            פרטי כרטיס וחוזים
          </button>

          <button
            onClick={() => onSelectTab('calculator')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'calculator'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600 dark:border-emerald-400'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calculator className="w-4 h-4" />
            מחשבון דרך שווה
          </button>

          <button
            onClick={() => onSelectTab('guide')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600 dark:border-emerald-400'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Info className="w-4 h-4" />
            מדריך טכנולוגיית NFC
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action (Responsive) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Top-up button only on desktop/tablet to prevent mobile header overflow */}
          {hasActiveCard && (
            <button
              onClick={onOpenRecharge}
              className="hidden sm:flex px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer items-center gap-1.5 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>טעינת רב-קו</span>
            </button>
          )}

          <button
            onClick={() => onSelectTab('scanner')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white rounded-lg transition-all shadow-sm cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              nfcActive
                ? 'bg-amber-600 hover:bg-amber-700 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>{nfcActive ? 'סורק...' : 'סריקה'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
