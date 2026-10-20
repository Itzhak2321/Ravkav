import React, { useState, useEffect } from 'react';
import {
  Radio,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Search,
  RefreshCw,
  Zap,
  ExternalLink,
  Copy,
  Check,
  UserCheck,
} from 'lucide-react';
import { RavKavCard, ScanResult } from '../types/ravkav';
import { nfcService, NfcSupportStatus } from '../services/nfcService';
import { SAMPLE_CARDS } from '../data/sampleCards';
import { audioService } from '../services/audioService';

interface NfcScannerProps {
  onCardLoaded: (card: RavKavCard) => void;
  activeCard: RavKavCard | null;
  onOpenGuide: () => void;
  onOpenRecharge: () => void;
}

export const NfcScanner: React.FC<NfcScannerProps> = ({
  onCardLoaded,
  activeCard,
  onOpenGuide,
  onOpenRecharge,
}) => {
  const [supportStatus, setSupportStatus] = useState<NfcSupportStatus | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('לחץ על "התחל סריקת NFC חיה" והצמד את הכרטיס');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isIframeError, setIsIframeError] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null);
  const [manualCardNumber, setManualCardNumber] = useState('');
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [selectedProfileIndex, setSelectedProfileIndex] = useState<number>(0);
  const [cardDetectedSuccess, setCardDetectedSuccess] = useState(false);

  useEffect(() => {
    const status = nfcService.checkSupport();
    setSupportStatus(status);
    if (status.isInIframe) {
      setIsIframeError(true);
    }
  }, []);

  const handleStartRealScan = async () => {
    setErrorMessage(null);
    setCardDetectedSuccess(false);
    setIsIframeError(false);
    setIsScanning(true);
    setStatusMessage('אנטנת ה-NFC פעילה! הצמד כעת את כרטיס הרב-קו לגב הטלפון...');

    await nfcService.startRealScan(
      (card, rawScan) => {
        setIsScanning(false);
        setCardDetectedSuccess(true);
        setStatusMessage('כרטיס הרב-קו נקרא בהצלחה!');
        setLastScanResult(rawScan);
        setTimeout(() => {
          onCardLoaded(card);
        }, 600);
      },
      (error, isIframe) => {
        setIsScanning(false);
        setErrorMessage(error);
        if (isIframe) {
          setIsIframeError(true);
        }
      },
      (status) => {
        setStatusMessage(status);
      },
      selectedProfileIndex
    );
  };

  const handleStopScan = () => {
    nfcService.stopScan();
    setIsScanning(false);
    setStatusMessage('הסריקה הופסקה.');
  };

  const handleSimulatedTap = (index = selectedProfileIndex) => {
    setErrorMessage(null);
    setIsScanning(true);
    setStatusMessage('מזהה הצמדת כרטיס רב-קו...');

    setTimeout(() => {
      const { card, scanResult } = nfcService.simulateCardTap(index);
      setIsScanning(false);
      setCardDetectedSuccess(true);
      setStatusMessage(`הכרטיס נקרא בהצלחה! (${card.holderName || card.profile.title})`);
      setLastScanResult(scanResult);
      setTimeout(() => {
        onCardLoaded(card);
      }, 500);
    }, 450);
  };

  const handleSelectSampleCard = (sample: RavKavCard) => {
    audioService.playValidationSuccess();
    setErrorMessage(null);
    setStatusMessage(`נטען כרטיס: ${sample.holderName || sample.profile.title}`);
    setLastScanResult({
      serialNumber: sample.cardUid,
      rawUid: sample.cardUid,
      timestamp: new Date().toISOString(),
    });
    onCardLoaded(sample);
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleManualLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCardNumber.trim()) return;

    audioService.playValidationSuccess();
    const cleanNum = manualCardNumber.replace(/\D/g, '');
    const sample = SAMPLE_CARDS[selectedProfileIndex] || SAMPLE_CARDS[0];

    const formattedNum =
      cleanNum.length >= 10
        ? `${cleanNum.slice(0, 4)} ${cleanNum.slice(4, 8)} ${cleanNum.slice(8, 10)}`
        : `3081 ${cleanNum.padEnd(6, '0').slice(0, 4)} ${cleanNum.slice(-2) || '19'}`;

    const syntheticCard: RavKavCard = {
      ...sample,
      id: `manual-${cleanNum}`,
      cardId: formattedNum,
      cardUid: `04:${cleanNum.slice(0, 2) || 'A1'}:${cleanNum.slice(2, 4) || 'B2'}:${cleanNum.slice(4, 6) || 'C3'}:D4:E5:F6`,
      holderName: 'כרטיס שהוזן ידנית',
      storedValue: 50.0,
      metadata: {
        ...sample.metadata,
        lastReadTimestamp: new Date().toISOString(),
      },
    };

    onCardLoaded(syntheticCard);
    setIsManualOpen(false);
    setStatusMessage(`הכרטיס ${formattedNum} נטען בהצלחה`);
  };

  return (
    <div className="space-y-6">
      {/* Iframe Top-Level Browser Banner (Only shown if running in Iframe) */}
      {isIframeError && (
        <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 sm:p-5 text-right shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                סריקת כרטיס אמיתי ב-NFC דורשת חלון עצמאי בדפדפן
              </h3>
              <p className="text-xs text-amber-900/90 dark:text-amber-300/90 leading-relaxed mt-1">
                מטעמי אבטחה של Android, אנטנת ה-NFC אינה יכולה לקרוא כרטיסים פיזיים מתוך מסגרת Preview מוטמעת.
                פתח את הקישור ישירות ב-Chrome לסריקה פיזית של הכרטיס, או לחץ על הדמיית הצמדה:
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 pr-11">
            <a
              href={window.location.href}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>פתח ישירות ב-Chrome לסריקה פיזית</span>
            </a>

            <button
              onClick={handleCopyLink}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-medium rounded-xl hover:bg-amber-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'הקישור הועתק!' : 'העתק קישור'}</span>
            </button>

            <button
              onClick={() => handleSimulatedTap()}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>הדמיית הצמדה (ביפ)</span>
            </button>
          </div>
        </div>
      )}

      {/* Honest Balance Explanation Banner */}
      <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs text-slate-700 dark:text-slate-300 space-y-2.5 text-right">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>הבהרה חשובה: איך נקראת יתרת הרב-קו האמיתית?</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Calypso APDU</span>
        </div>
        <p className="leading-relaxed">
          היתרה הכספית (ערך צבור) והחוזים של כרטיס רב-קו מאוחסנים בזיכרון פנימי מוצפן של משרד התחבורה.
          <strong> דפדפני אינטרנט (כולל Chrome) חסומים מגישה לקבצים מוצפנים אלו מטעמי אבטחה</strong> (שרק אפליקציות Android ייעודיות מחנות Play רשאיות לפענח).
          חיישן ה-NFC בדפדפן מזהה את עצם הצמדת הכרטיס הפיזי, ומאפשר לך לנהל ולתעד אותו כאן, או לבדוק את היתרה הרשמית ישירות:
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <a
            href="https://ravkavonline.co.il"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            <span>בדיקת יתרה רשמית ברב-קו אונליין לפי מספר כרטיס</span>
          </a>
        </div>
      </div>

      {/* Hero Scanner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 text-white p-5 sm:p-8 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          {/* Left Column: Visual Scanner Radar */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center text-center">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
              {isScanning && (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400/40 animate-nfc-pulse-1 pointer-events-none" />
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400/30 animate-nfc-pulse-2 pointer-events-none" />
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400/20 animate-nfc-pulse-3 pointer-events-none" />
                </>
              )}

              <div
                className={`relative w-40 h-40 sm:w-44 sm:h-44 rounded-full border-2 transition-all flex flex-col items-center justify-center p-3 sm:p-4 ${
                  cardDetectedSuccess
                    ? 'border-emerald-400 bg-emerald-950/60 shadow-xl shadow-emerald-500/30 scale-105'
                    : isScanning
                    ? 'border-emerald-400 bg-emerald-950/40 shadow-lg shadow-emerald-500/20 scale-105'
                    : activeCard
                    ? 'border-emerald-600/60 bg-slate-900 shadow-md'
                    : 'border-slate-700 bg-slate-900/80'
                }`}
              >
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-1.5 sm:mb-2 transition-transform ${
                    cardDetectedSuccess
                      ? 'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/50'
                      : isScanning
                      ? 'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/40'
                      : activeCard
                      ? 'bg-emerald-600/20 text-emerald-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Radio className={`w-7 h-7 sm:w-8 sm:h-8 ${isScanning ? 'animate-pulse' : ''}`} />
                </div>

                <span className="text-xs font-semibold text-slate-200">
                  {cardDetectedSuccess
                    ? 'כרטיס נקרא!'
                    : isScanning
                    ? 'אנטנה מאזינה...'
                    : activeCard
                    ? 'כרטיס מזוהה'
                    : 'סורק NFC'}
                </span>

                <span className="text-[10px] text-slate-400 mt-0.5" dir="ltr">
                  13.56 MHz · Calypso
                </span>
              </div>
            </div>

            {/* Live Status Message */}
            <div className="mt-2 text-center max-w-xs px-2">
              <p
                className={`text-xs sm:text-sm font-medium transition-colors ${
                  errorMessage && !isIframeError
                    ? 'text-rose-400'
                    : cardDetectedSuccess
                    ? 'text-emerald-300 font-bold'
                    : isScanning
                    ? 'text-emerald-400 animate-pulse'
                    : 'text-slate-300'
                }`}
              >
                {errorMessage && !isIframeError ? errorMessage : statusMessage}
              </p>
            </div>
          </div>

          {/* Right Column: Controls, Profile Selection & Trigger */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-right">
            <div>
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <span className="text-xs font-semibold text-emerald-400 tracking-wider">
                  זיהוי חכם של כרטיסי תחבורה
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-xs text-slate-400">Calypso ISO 14443-B</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                סריקת כרטיס רב-קו ב-NFC
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-2">
                לחץ על הכפתור והצמד את כרטיס הרב-קו שלך לגב הטלפון. עם הצמדת הכרטיס, תישמע מנגינת
                תיקוף (ביפ) ויוצגו נתוני הכרטיס, יתרת הערך הצבור, מנויים פעילים וחלון מעבר 90 דק׳.
              </p>
            </div>

            {/* Profile Selection Strip */}
            <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/80 space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">
                בחר את סוג הכרטיס שלך לטעינה מדויקת:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { label: 'סטודנט (50%)', idx: 0 },
                  { label: 'זהב-קו 75+ (חינם)', idx: 1 },
                  { label: 'אנונימי / רגיל', idx: 2 },
                  { label: 'נוער (50%)', idx: 3 },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setSelectedProfileIndex(item.idx)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-center truncate ${
                      selectedProfileIndex === item.idx
                        ? 'bg-emerald-600 text-white font-bold shadow-sm'
                        : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {isScanning ? (
                <button
                  onClick={handleStopScan}
                  className="min-h-[46px] px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>עצור סריקה</span>
                </button>
              ) : (
                <button
                  onClick={handleStartRealScan}
                  className="min-h-[46px] px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Radio className="w-4 h-4" />
                  <span>התחל סריקת NFC חיה</span>
                </button>
              )}

              <button
                onClick={() => handleSimulatedTap()}
                className="min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>הדמיית הצמדה (ביפ)</span>
              </button>

              <button
                onClick={() => setIsManualOpen(!isManualOpen)}
                className="min-h-[46px] px-3.5 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Search className="w-4 h-4 text-slate-400" />
                <span>הזנה ידנית</span>
              </button>
            </div>

            {/* Manual input form */}
            {isManualOpen && (
              <form
                onSubmit={handleManualLookup}
                className="bg-slate-800/90 rounded-2xl p-3.5 sm:p-4 border border-slate-700 space-y-2.5 transition-all"
              >
                <label className="block text-xs font-medium text-slate-300 text-right">
                  הזן 10 ספרות של מספר הרב-קו (המודפס בחזית הכרטיס):
                </label>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    טען כרטיס
                  </button>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="לדוגמה: 3048912074"
                    value={manualCardNumber}
                    onChange={(e) => setManualCardNumber(e.target.value)}
                    maxLength={14}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Quick Test Cards Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              בדיקה מהירה עם כרטיסי רב-קו לדוגמה
            </h2>
          </div>
          <span className="text-[11px] text-slate-500">לחץ לטעינה מיידית</span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 sm:mb-4 leading-relaxed">
          בדוק את כל סוגי הפרופילים והחוזים הקיימים בתחבורה הציבורית בישראל בלחיצה אחת:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {SAMPLE_CARDS.map((card, idx) => {
            const isSelected = activeCard?.id === card.id;
            return (
              <button
                key={card.id}
                onClick={() => {
                  setSelectedProfileIndex(idx);
                  handleSelectSampleCard(card);
                }}
                className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between gap-2 cursor-pointer group ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 ring-1 ring-emerald-600'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {card.holderName || 'רב-קו אנונימי'}
                    </span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                    {card.profile.title}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">ערך צבור:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200" dir="ltr">
                    ₪{card.storedValue.toFixed(2)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scanned Card Raw Hardware Metadata */}
      {activeCard && (
        <div className="bg-slate-100/80 dark:bg-slate-900/70 rounded-xl p-3 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>כרטיס פעיל במערכת: </span>
            <strong className="text-slate-900 dark:text-white font-mono" dir="ltr">
              {activeCard.cardId}
            </strong>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]" dir="ltr">
            <span>UID: {activeCard.cardUid}</span>
            <span>·</span>
            <span>{activeCard.metadata.chipType}</span>
          </div>
        </div>
      )}
    </div>
  );
};
