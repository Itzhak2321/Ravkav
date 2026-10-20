import React, { useState } from 'react';
import { Calculator, Bus, Train, ArrowLeftRight, Check, HelpCircle } from 'lucide-react';

interface TierOption {
  distance: string;
  busFare: number;
  trainFare: number;
  colorName: string;
}

const FARE_TIERS: TierOption[] = [
  { distance: 'עד 15 ק"מ (עירוני ומקומי)', busFare: 6.0, trainFare: 9.5, colorName: 'צהוב' },
  { distance: '15 עד 40 ק"מ', busFare: 12.5, trainFare: 18.0, colorName: 'כחול' },
  { distance: '40 עד 75 ק"מ', busFare: 17.0, trainFare: 24.0, colorName: 'ירוק' },
  { distance: '75 עד 120 ק"מ', busFare: 27.0, trainFare: 37.0, colorName: 'חום' },
  { distance: 'מעל 120 ק"מ (בין-עירוני ארוך)', busFare: 38.5, trainFare: 48.0, colorName: 'אדום' },
];

export const FareCalculator: React.FC = () => {
  const [selectedTransit, setSelectedTransit] = useState<'bus' | 'light_rail' | 'train'>('bus');
  const [selectedTierIndex, setSelectedTierIndex] = useState<number>(0);
  const [selectedDiscount, setSelectedDiscount] = useState<number>(0);

  const tier = FARE_TIERS[selectedTierIndex];
  let basePrice = tier.busFare;

  if (selectedTransit === 'light_rail') {
    // Light rail (Dankal / Kfir) is 6 NIS up to 15km, 8 NIS for extended rings
    basePrice = selectedTierIndex === 0 ? 6.0 : 8.0;
  } else if (selectedTransit === 'train') {
    basePrice = tier.trainFare;
  }

  const finalPrice = Math.max(0, basePrice * (1 - selectedDiscount / 100));

  return (
    <div className="space-y-6">
      {/* Interactive Fare Calculator */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Calculator className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            מחשבון תעריפי נסיעה ארציים (רפורמת "דרך שווה")
          </h2>
        </div>

        {/* Step 1: Transit Mode */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            1. בחר אמצעי תחבורה:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedTransit('bus')}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                selectedTransit === 'bus'
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-600 font-bold'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Bus className="w-5 h-5" />
              <span className="text-xs">אוטובוס עירוני / בין-עירוני</span>
            </button>

            <button
              onClick={() => setSelectedTransit('light_rail')}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                selectedTransit === 'light_rail'
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-600 font-bold'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Train className="w-5 h-5" />
              <span className="text-xs">רכבת קלה (דנקל / כפיר)</span>
            </button>

            <button
              onClick={() => setSelectedTransit('train')}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                selectedTransit === 'train'
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-600 font-bold'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Train className="w-5 h-5" />
              <span className="text-xs">רכבת ישראל</span>
            </button>
          </div>
        </div>

        {/* Step 2: Distance Tier */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            2. בחר מרחק אווירי לנסיעה:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {FARE_TIERS.map((t, idx) => (
              <button
                key={t.distance}
                onClick={() => setSelectedTierIndex(idx)}
                className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between ${
                  selectedTierIndex === idx
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-600'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <span className="text-xs font-semibold block">{t.distance}</span>
                  <span className="text-[10px] text-slate-500">אזור {t.colorName}</span>
                </div>
                {selectedTierIndex === idx && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Passenger Profile */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            3. פרופיל נוסע והנחות זכאות:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'רגיל (ללא הנחה)', disc: 0 },
              { label: 'נוער עד גיל 18 (50%)', disc: 50 },
              { label: 'אזרח ותיק (50%)', disc: 50 },
              { label: 'זהב-קו 75+ (חינם)', disc: 100 },
              { label: 'סטודנט רגיל (33%)', disc: 33 },
              { label: 'סטודנט מורחב (50%)', disc: 50 },
              { label: 'זכאי ביטוח לאומי (50%)', disc: 50 },
              { label: 'עיוור / מלווה (100%)', disc: 100 },
            ].map((p) => (
              <button
                key={p.label}
                onClick={() => setSelectedDiscount(p.disc)}
                className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer text-xs ${
                  selectedDiscount === p.disc
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Calculated Result Card */}
        <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-500 block">מחיר לתשלום בכרטיס הרב-קו:</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums" dir="ltr">
                ₪{finalPrice.toFixed(2)}
              </span>
              {selectedDiscount > 0 && (
                <span className="text-xs text-slate-400 line-through font-mono" dir="ltr">
                  ₪{basePrice.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500 block mt-1">
              כולל מעבר חופשי של 90 דקות באזור המקומי (עד 15 ק"מ).
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-right space-y-1">
            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-600" />
              <span>כלל מעבר 90 דקות:</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              נסיעה באוטובוס/רכבת קלה עד 15 ק"מ מאפשרת החלפת קווים בלתי מוגבלת ללא תוספת תשלום במשך 90 דקות מרגע התיקוף הראשון.
            </p>
          </div>
        </div>
      </div>

      {/* Official Tariff Reference Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            טבלת תעריפי בסיס - משרד התחבורה
          </h3>
          <span className="text-xs text-slate-500">תעריף רגיל למבוגר</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">טווח מרחק</th>
                <th className="p-3">אזור תעריפי</th>
                <th className="p-3">אוטובוס / רכבת קלה</th>
                <th className="p-3">רכבת ישראל</th>
                <th className="p-3">מעבר 90 דקות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {FARE_TIERS.map((row) => (
                <tr key={row.distance} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3 font-medium text-slate-900 dark:text-white">{row.distance}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">אזור {row.colorName}</td>
                  <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200" dir="ltr">
                    ₪{row.busFare.toFixed(2)}
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200" dir="ltr">
                    ₪{row.trainFare.toFixed(2)}
                  </td>
                  <td className="p-3 text-emerald-600 dark:text-emerald-400">
                    {row.distance.includes('15') ? 'תקף (חינם)' : 'לפי תחשיב מקטע'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
