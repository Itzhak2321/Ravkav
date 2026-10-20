import React, { useState } from 'react';
import { Wifi, RotateCcw, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { RavKavCard } from '../types/ravkav';

interface RavKavCardVisualProps {
  card: RavKavCard;
  isScanning?: boolean;
}

export const RavKavCardVisual: React.FC<RavKavCardVisualProps> = ({ card, isScanning }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const getGradientClass = () => {
    switch (card.cardType) {
      case 'senior_gold':
        return 'ravkav-card-gold text-amber-950';
      case 'youth':
        return 'ravkav-card-youth text-white';
      case 'anonymous':
        return 'ravkav-card-anon text-white';
      default:
        return 'ravkav-card-gradient text-white';
    }
  };

  const isGold = card.cardType === 'senior_gold';

  return (
    <div className="w-full max-w-md mx-auto perspective-1000 select-none">
      <div
        className={`relative w-full aspect-[1.586/1] rounded-2xl shadow-xl transition-transform duration-700 transform-style-3d cursor-pointer ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
        title="לחץ להיפוך הכרטיס"
      >
        {/* FRONT SIDE */}
        <div
          className={`absolute inset-0 w-full h-full rounded-2xl p-5 flex flex-col justify-between overflow-hidden backface-hidden border border-white/20 shadow-2xl ${getGradientClass()}`}
        >
          {/* Background Texture & Wave Watermarks */}
          <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay">
            <img
              src="/src/assets/images/ravkav_card_texture_1792152226221.jpg"
              alt="כרטיס חכם"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full border border-white/20 pointer-events-none" />
          <div className="absolute -top-6 -right-6 w-36 h-36 rounded-full border border-white/15 pointer-events-none" />

          {/* Top Header Row */}
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <span className="font-black text-xs tracking-tighter">רב-קו</span>
              </div>
              <div>
                <span className={`text-[11px] font-bold tracking-wider uppercase block ${isGold ? 'text-amber-900' : 'text-emerald-100'}`}>
                  מדינת ישראל · משרד התחבורה
                </span>
                <span className="text-xs font-semibold">
                  {card.cardType === 'senior_gold'
                    ? 'זהב-קו · 75+ נסיעות חינם'
                    : card.cardType === 'anonymous'
                    ? 'רב-קו אנונימי'
                    : 'כרטיס תחבורה חכם אישי'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-mono" dir="ltr">
                <Wifi className="w-3.5 h-3.5 rotate-90 text-white" />
                <span>NFC</span>
              </div>
              <button
                type="button"
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(!isFlipped);
                }}
                aria-label="הפוך כרטיס"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Middle Row: Smartcard Chip & Contactless Indicator */}
          <div className="relative z-10 flex items-center justify-between my-auto pt-2">
            {/* Metallic Gold Chip */}
            <div className="w-12 h-9 rounded-md bg-gradient-to-tr from-amber-300 via-yellow-200 to-amber-400 border border-amber-500/50 shadow-inner p-1 relative overflow-hidden">
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-0.5 opacity-60">
                <div className="border border-amber-800/40 rounded-sm"></div>
                <div className="border border-amber-800/40 rounded-sm"></div>
                <div className="border border-amber-800/40 rounded-sm"></div>
                <div className="border border-amber-800/40 rounded-sm"></div>
                <div className="border border-amber-800/40 rounded-sm"></div>
                <div className="border border-amber-800/40 rounded-sm"></div>
              </div>
            </div>

            {/* Profile highlight */}
            <div className="text-left font-mono">
              <span className="text-[10px] block opacity-75">פרופיל זכאות</span>
              <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm inline-block">
                {card.profile.title}
              </span>
            </div>
          </div>

          {/* Bottom Row: Card ID, Name, Expiry */}
          <div className="relative z-10 pt-2 border-t border-white/20 flex items-end justify-between">
            <div>
              <div className="font-mono text-base sm:text-lg font-bold tracking-widest text-shadow drop-shadow-sm" dir="ltr">
                {card.cardId}
              </div>
              <div className="text-xs font-medium opacity-90 mt-0.5">
                {card.holderName || 'נוסע כללי (אנונימי)'}
              </div>
            </div>

            <div className="text-left">
              <span className="text-[9px] uppercase tracking-wider block opacity-70">תוקף / EXP</span>
              <span className="font-mono text-xs font-semibold" dir="ltr">
                {card.expiryDate}
              </span>
            </div>
          </div>

          {/* Live Scanner Ring Indicator */}
          {isScanning && (
            <div className="absolute inset-0 border-2 border-white/80 rounded-2xl animate-pulse pointer-events-none" />
          )}
        </div>

        {/* BACK SIDE */}
        <div
          className={`absolute inset-0 w-full h-full rounded-2xl p-5 flex flex-col justify-between overflow-hidden backface-hidden border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl [transform:rotateY(180deg)]`}
        >
          {/* Magnetic Stripe */}
          <div className="absolute top-4 left-0 right-0 h-10 bg-slate-950 border-y border-slate-800" />

          <div className="relative z-10 pt-12 flex flex-col gap-2">
            {/* Signature & Barcode Strip */}
            <div className="bg-slate-100 text-slate-900 rounded px-3 py-1.5 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono italic">חתימת בעל הכרטיס</span>
              <span className="font-mono text-xs font-semibold" dir="ltr">
                {card.cardId.replace(/\s+/g, '')}
              </span>
            </div>

            {/* Hardware UID & Chip Information */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-500 block">UID זיהוי חומרה:</span>
                <span className="text-emerald-400 font-bold" dir="ltr">
                  {card.cardUid}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">תקן שבב חכם:</span>
                <span className="text-slate-200 truncate block">Calypso ISO 14443-B</span>
              </div>
            </div>
          </div>

          {/* Back Footer */}
          <div className="relative z-10 text-[9px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-2">
            <div>
              <span>מוקד מידע ארצי לתחבורה ציבורית: </span>
              <span className="font-bold text-white font-mono" dir="ltr">
                *8787
              </span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>כרטיס מאומת</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-2">
        <span className="text-xs text-slate-500 dark:text-slate-400 inline-flex items-center gap-1">
          <RotateCcw className="w-3 h-3" />
          לחץ על הכרטיס כדי לראות את הצד האחורי (נתוני שבב וברקוד)
        </span>
      </div>
    </div>
  );
};
