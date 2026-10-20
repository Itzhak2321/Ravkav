import React from 'react';
import { Layers, Calendar, CheckCircle, ShieldCheck, Plus, Sparkles } from 'lucide-react';
import { ActiveContract } from '../types/ravkav';

interface ContractsListProps {
  contracts: ActiveContract[];
  onOpenRecharge: () => void;
}

export const ContractsList: React.FC<ContractsListProps> = ({ contracts, onOpenRecharge }) => {
  if (contracts.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">אין חוזים טעונים בכרטיס זה</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          לא נמצאו מנויים חודשיים או חוזי ערך צבור. ניתן להטעין כרטיס זה בערך צבור או חופשי חודשי מיידית.
        </p>
        <button
          onClick={onOpenRecharge}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-500 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          הטען חוזה ראשון
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contracts.map((contract) => (
          <div
            key={contract.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {contract.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>קוד חוזה: {contract.code}</span>
                      <span>·</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        פעיל ותקף
                      </span>
                    </div>
                  </div>
                </div>

                <span className="font-mono text-sm font-bold text-slate-900 dark:text-white shrink-0" dir="ltr">
                  ₪{contract.pricePaid.toFixed(2)}
                </span>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl mt-3 leading-relaxed">
                <span className="text-slate-500 block text-[10px] mb-0.5">אזור כיסוי ותחבורה:</span>
                {contract.coverage}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span dir="ltr">{contract.validFrom}</span>
                <span>—</span>
                <span dir="ltr">{contract.validUntil}</span>
              </div>

              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                מאושר במערכת
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={onOpenRecharge}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          הוסף חוזה נסיעה חדש / חופשי ארצי
        </button>
      </div>
    </div>
  );
};
