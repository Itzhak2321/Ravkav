import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Clock,
  Shield,
  Layers,
  ArrowUpRight,
  Sparkles,
  MapPin,
  Calendar,
  CheckCircle2,
  Edit3,
  HelpCircle,
  ExternalLink,
  Save,
  Check,
} from 'lucide-react';
import { RavKavCard } from '../types/ravkav';
import { RavKavCardVisual } from './RavKavCardVisual';
import { ContractsList } from './ContractsList';
import { TravelHistory } from './TravelHistory';
import { nfcService } from '../services/nfcService';

interface CardDashboardProps {
  card: RavKavCard;
  onOpenRecharge: () => void;
  onCardUpdated?: (card: RavKavCard) => void;
}

export const CardDashboard: React.FC<CardDashboardProps> = ({
  card,
  onOpenRecharge,
  onCardUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'contracts' | 'history'>('contracts');
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState<string>(card.storedValue.toString());
  const [isSavedMessage, setIsSavedMessage] = useState(false);
  const [showTechnicalExplainer, setShowTechnicalExplainer] = useState(false);

  // Check if there is an active transfer window (within 90 minutes of last validation)
  const lastValidation = card.recentValidations[0];
  const [transferRemainingMinutes, setTransferRemainingMinutes] = useState<number | null>(null);

  useEffect(() => {
    if (!lastValidation) {
      setTransferRemainingMinutes(null);
      return;
    }

    const checkTransferTime = () => {
      const valTime = new Date(lastValidation.timestamp).getTime();
      const now = Date.now();
      const elapsedMinutes = Math.floor((now - valTime) / 60000);
      const remaining = 90 - elapsedMinutes;

      if (remaining > 0) {
        setTransferRemainingMinutes(remaining);
      } else {
        setTransferRemainingMinutes(null);
      }
    };

    checkTransferTime();
    const interval = setInterval(checkTransferTime, 10000);
    return () => clearInterval(interval);
  }, [lastValidation]);

  const handleSaveBalance = (e: React.FormEvent) => {
    e.preventDefault();
    const newBal = parseFloat(balanceInput);
    if (isNaN(newBal) || newBal < 0) return;

    const updated: RavKavCard = {
      ...card,
      storedValue: newBal,
    };

    nfcService.saveCardToStorage(updated);
    onCardUpdated?.(updated);
    setIsEditingBalance(false);
    setIsSavedMessage(true);
    setTimeout(() => setIsSavedMessage(false), 2500);
  };

  const handleSetZeroBalance = () => {
    const updated: RavKavCard = {
      ...card,
      storedValue: 0.0,
    };
    nfcService.saveCardToStorage(updated);
    onCardUpdated?.(updated);
    setBalanceInput('0');
    setIsEditingBalance(false);
    setIsSavedMessage(true);
    setTimeout(() => setIsSavedMessage(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Split: Card Visual + Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Visual Card (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <RavKavCardVisual card={card} />
        </div>

        {/* Key Metrics and Status (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-4">
          {/* Main Stored Value Banner */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <span>יתרת ערך צבור</span>
                  <span>·</span>
                  <span>דרך שווה</span>
                </div>

                {isEditingBalance ? (
                  <form onSubmit={handleSaveBalance} className="flex items-center gap-2 mt-2">
                    <span className="text-xl font-bold font-mono">₪</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={balanceInput}
                      onChange={(e) => setBalanceInput(e.target.value)}
                      placeholder="0.00"
                      className="w-32 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xl font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      autoFocus
                      dir="ltr"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      שמור
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingBalance(false)}
                      className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs cursor-pointer"
                    >
                      ביטול
                    </button>
                  </form>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-3xl sm:text-4xl font-extrabold font-mono tabular-nums tracking-tight ${
                        card.storedValue === 0
                          ? 'text-slate-500 dark:text-slate-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                      dir="ltr"
                    >
                      ₪{card.storedValue.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-500">
                      {card.storedValue === 0 ? '(כרטיס ריק)' : 'שקלים חדשים'}
                    </span>
                    {isSavedMessage && (
                      <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                        <Check className="w-3 h-3" /> נשמר!
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action buttons on the balance card */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {!isEditingBalance && (
                  <button
                    onClick={() => {
                      setBalanceInput(card.storedValue.toString());
                      setIsEditingBalance(true);
                    }}
                    className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    title="עדכן את היתרה האמיתית של הכרטיס שלך"
                  >
                    <Edit3 className="w-3 h-3 text-slate-500" />
                    <span>הזן יתרה ידנית</span>
                  </button>
                )}

                {card.storedValue > 0 && !isEditingBalance && (
                  <button
                    onClick={handleSetZeroBalance}
                    className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-slate-50 dark:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
                    title="הגדר יתרה ל-0"
                  >
                    אפס ל-₪0
                  </button>
                )}

                <button
                  onClick={onOpenRecharge}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>טעינה</span>
                </button>
              </div>
            </div>

            {/* Explainer toggle prompt */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span className="truncate">
                {card.storedValue === 0
                  ? 'הכרטיס מוגדר כריק (₪0.00). ניתן להזין יתרה ידנית או לבצע טעינה.'
                  : 'יתרה זו נשמרת באופן מאובטח במכשירך ומעודכנת בכל שימוש.'}
              </span>
              <button
                onClick={() => setShowTechnicalExplainer(!showTechnicalExplainer)}
                className="text-emerald-600 dark:text-emerald-400 hover:underline shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3 h-3" />
                <span>למה דפדפן לא קורא את היתרה לבד?</span>
              </button>
            </div>
          </div>

          {/* Technical Transparency Explainer (Expandable) */}
          {showTechnicalExplainer && (
            <div className="bg-slate-100 dark:bg-slate-900/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-2 text-right">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>הסבר טכני: מדוע דפדפן אינטרנט אינו יכול לפענח את קובץ היתרה של רב-קו באופן אוטומטי?</span>
              </div>
              <p className="leading-relaxed">
                1. <strong>הצפנת שבב Calypso:</strong> כרטיס רב-קו אינו מחזיק את כמות הכסף כטקסט גלוי. היתרה שמורה בתוך קובץ בינארי פנימי מאובטח (Elementary Files) על שבב Calypso של משרד התחבורה.
              </p>
              <p className="leading-relaxed">
                2. <strong>מגבלת אבטחה של דפדפני אינטרנט (Web NFC):</strong> גוגל ו-W3C חוסמים במתכוון שליחת פקודות בינאריות (APDU) ישירות מאתרי אינטרנט כדי למנוע מאתרים זדוניים לגשת לכרטיסי אשראי או תעודות זהות. דפדפן יכול רק לזהות את <em>הצמדת הכרטיס הפיזי ואת מזהה החומרה (UID)</em>.
              </p>
              <p className="leading-relaxed">
                3. <strong>איך אפליקציות כמו רב-קו אונליין עושות את זה?</strong> הן אפליקציות Native מלאות ב-Google Play (שנכתבו ב-Android Java/Kotlin עם חבילת <code>android.nfc.tech.IsoDep</code>) ומחזיקות מפתחות הצפנה רשמיים של משרד התחבורה.
              </p>
              <p className="leading-relaxed text-slate-500">
                לכן באפליקציית ווב זו המערכת מזהה את הצמדת הכרטיס באנטנה ומאפשרת לך לנהל את היתרה האמיתית, לעקוב אחר תעריפי דרך שווה, לחשב מעבר 90 דק׳ ולבצע טעינות.
              </p>
            </div>
          )}

          {/* 3 Secondary Metric Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Metric 1: Profile */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 block mb-1">פרופיל נוסע וזכאות</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white block truncate">
                {card.profile.title}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {card.profile.discountPercentage > 0
                  ? `${card.profile.discountPercentage}% הנחה בכל נסיעה`
                  : 'תעריף רגיל מלא'}
              </span>
            </div>

            {/* Metric 2: Active Contracts Count */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 block mb-1">חוזים טעונים</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white block font-mono tabular-nums">
                {card.activeContracts.length} חוזים פעילים
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block">
                מאושר לתיקוף ארצי
              </span>
            </div>

            {/* Metric 3: Expiry */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 block mb-1">תוקף הכרטיס</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white block font-mono" dir="ltr">
                {card.expiryDate}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                הונפק ב-{card.issueDate}
              </span>
            </div>
          </div>

          {/* Active 90-Minute Transfer Window Alert */}
          {transferRemainingMinutes !== null ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      חלון מעבר 90 דקות פעיל
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-400 text-xs">·</span>
                    <span className="text-xs text-emerald-700 dark:text-emerald-400">
                      מעבר חופשי ללא תוספת תשלום
                    </span>
                  </div>
                  <span className="text-xs text-emerald-800/80 dark:text-emerald-300/80 block mt-0.5">
                    תקף מנסיעה אחרונה ב-{lastValidation?.line} ({lastValidation?.operator})
                  </span>
                </div>
              </div>

              <div className="text-left shrink-0">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block uppercase">
                  נותרו עוד
                </span>
                <span className="font-mono text-lg font-extrabold text-emerald-900 dark:text-emerald-100 tabular-nums" dir="ltr">
                  {transferRemainingMinutes} דק׳
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>אין מעבר 90 דקות פעיל כרגע. הנסיעה הבאה תחויב לפי תעריף היעד.</span>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">זמין לתיקוף</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs: Contracts vs History */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('contracts')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'contracts'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>חוזים ומנויים טעונים ({card.activeContracts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>היסטוריית תיקופים ונסיעות ({card.recentValidations.length})</span>
          </button>
        </div>

        {activeTab === 'contracts' ? (
          <ContractsList contracts={card.activeContracts} onOpenRecharge={onOpenRecharge} />
        ) : (
          <TravelHistory validations={card.recentValidations} />
        )}
      </div>
    </div>
  );
};
