import React from 'react';
import { Bus, Train, MapPin, Clock, ArrowLeftRight, CheckCircle2 } from 'lucide-react';
import { ValidationRecord } from '../types/ravkav';

interface TravelHistoryProps {
  validations: ValidationRecord[];
}

export const TravelHistory: React.FC<TravelHistoryProps> = ({ validations }) => {
  if (validations.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-2">
        <Clock className="w-8 h-8 text-slate-400 mx-auto" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">אין תיקופים אחרונים מתועדים</h3>
        <p className="text-xs text-slate-500">תיקופים עתידיים יופיעו כאן מיד עם הצמדת הכרטיס במכשירי התיקוף.</p>
      </div>
    );
  }

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return '';
    }
  };

  const getOperatorIcon = (op: string) => {
    if (op.includes('רכבת') || op.includes('דנקל') || op.includes('כפיר')) {
      return <Train className="w-4 h-4" />;
    }
    return <Bus className="w-4 h-4" />;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">תיקופים אחרונים בכרטיס</h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {validations.length} נסיעות מתועדות
        </span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {validations.map((v) => (
          <div
            key={v.id}
            className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            {/* Left/Start side: Icon + Line + Station */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                {getOperatorIcon(v.operator)}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {v.line}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    {v.operator}
                  </span>
                  {v.isTransferWindow && (
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <ArrowLeftRight className="w-3 h-3" />
                      מעבר 90 דק׳
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {v.station} ({v.city})
                  </span>
                  {v.vehicleNumber && (
                    <>
                      <span>·</span>
                      <span className="font-mono text-[11px]">רכב #{v.vehicleNumber}</span>
                    </>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 mt-0.5">
                  חוזה שחויב: {v.contractUsed}
                </div>
              </div>
            </div>

            {/* Right/End side: Time & Fare */}
            <div className="sm:text-left self-end sm:self-center shrink-0">
              <div className="font-mono text-sm font-bold text-slate-900 dark:text-white tabular-nums" dir="ltr">
                {v.fare === 0 ? '₪0.00 (פטור/מנוי)' : `₪${v.fare.toFixed(2)}`}
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5" dir="ltr">
                {formatDate(v.timestamp)} · {formatTime(v.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
