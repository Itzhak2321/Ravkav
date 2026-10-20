import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, Wallet, Layers, ShieldCheck, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RavKavCard, ActiveContract } from '../types/ravkav';
import { audioService } from '../services/audioService';

interface RechargeModalProps {
  card: RavKavCard;
  isOpen: boolean;
  onClose: () => void;
  onCardUpdated: (updatedCard: RavKavCard) => void;
}

export const RechargeModal: React.FC<RechargeModalProps> = ({
  card,
  isOpen,
  onClose,
  onCardUpdated,
}) => {
  const [rechargeType, setRechargeType] = useState<'stored_value' | 'monthly'>('stored_value');
  const [selectedAmount, setSelectedAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<{
    amount: number;
    description: string;
    receiptNumber: string;
    newBalance: number;
  } | null>(null);

  if (!isOpen) return null;

  const discountMultiplier = 1 - (card.profile.discountPercentage / 100);

  const calculateMonthlyPrice = () => {
    const basePrice = 255.0; // Standard national monthly pass
    if (card.cardType === 'senior_gold') return 0;
    return basePrice * discountMultiplier;
  };

  const handleExecuteRecharge = () => {
    setIsProcessing(true);

    setTimeout(() => {
      let updatedCard = { ...card };
      let rechargeAmount = 0;
      let description = '';

      if (rechargeType === 'stored_value') {
        rechargeAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
        if (isNaN(rechargeAmount) || rechargeAmount <= 0) rechargeAmount = 50;

        const newBalance = card.storedValue + rechargeAmount;
        updatedCard = {
          ...card,
          storedValue: newBalance,
        };
        description = `טעינת ערך צבור - ₪${rechargeAmount.toFixed(2)}`;
      } else {
        const price = calculateMonthlyPrice();
        rechargeAmount = price;
        const newContract: ActiveContract = {
          id: `contract-${Date.now()}`,
          name: 'חופשי חודשי ארצי (משולב עד 40 ק"מ)',
          type: 'monthly',
          validFrom: new Date().toLocaleDateString('he-IL'),
          validUntil: new Date(Date.now() + 30 * 24 * 3600 * 1000).toLocaleDateString('he-IL'),
          isActive: true,
          coverage: 'אוטובוסים, דנקל ורכבת ישראל',
          pricePaid: price,
          code: 'MONTHLY_NATIONWIDE',
        };

        updatedCard = {
          ...card,
          activeContracts: [newContract, ...card.activeContracts.filter((c) => c.type !== 'monthly')],
        };
        description = `חופשי חודשי ארצי - ₪${price.toFixed(2)}`;
      }

      // Audio & Confetti
      audioService.playRechargeSuccess();
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      const receipt = {
        amount: rechargeAmount,
        description,
        receiptNumber: `RK-${Math.floor(100000 + Math.random() * 900000)}`,
        newBalance: updatedCard.storedValue,
      };

      setSuccessReceipt(receipt);
      setIsProcessing(false);
      onCardUpdated(updatedCard);
    }, 700);
  };

  const handleClose = () => {
    setSuccessReceipt(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-right">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                טעינת כרטיס רב-קו
              </h2>
              <span className="text-xs text-slate-500 font-mono" dir="ltr">
                כרטיס: {card.cardId}
              </span>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {successReceipt ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                הכרטיס נטען בהצלחה!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                הנתונים נצרבו בהצלחה לשבב הכרטיס והועברו למערכת משרד התחבורה.
              </p>
            </div>

            {/* Receipt Card */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 text-right space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">מספר אסמכתא:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {successReceipt.receiptNumber}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">מוצר שנרכש:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {successReceipt.description}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">יתרת ערך צבור חדשה:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm" dir="ltr">
                  ₪{successReceipt.newBalance.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              סגור וצפה בכרטיס
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Type selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setRechargeType('stored_value')}
                className={`py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  rechargeType === 'stored_value'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Wallet className="w-4 h-4" />
                ערך צבור (נסיעות בודדות)
              </button>

              <button
                type="button"
                onClick={() => setRechargeType('monthly')}
                className={`py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  rechargeType === 'monthly'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Layers className="w-4 h-4" />
                חופשי חודשי ארצי
              </button>
            </div>

            {rechargeType === 'stored_value' ? (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  בחר סכום לטעינת ערך צבור:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[30, 50, 100, 150].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount('');
                      }}
                      className={`py-2.5 rounded-xl text-sm font-mono font-bold transition-all border cursor-pointer ${
                        selectedAmount === amt && !customAmount
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-600'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                      dir="ltr"
                    >
                      ₪{amt}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">או הזן סכום מותאם אישית (₪):</label>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    placeholder="לדוגמה: 75"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    dir="ltr"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white block">
                      חופשי חודשי ארצי (דרך שווה)
                    </span>
                    <span className="text-xs text-slate-500">
                      נסיעות בלתי מוגבלות באוטובוסים, רכבת קלה ורכבת ישראל עד 40 ק"מ
                    </span>
                  </div>
                  <div className="text-left font-mono" dir="ltr">
                    <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                      ₪{calculateMonthlyPrice().toFixed(2)}
                    </span>
                  </div>
                </div>

                {card.profile.discountPercentage > 0 && (
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 p-2 rounded-lg flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>
                      הוחלה הנחת פרופיל {card.profile.title} ({card.profile.discountPercentage}% הנחה)!
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Profile note */}
            <div className="text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
              <span>יתרה נוכחית: ₪{card.storedValue.toFixed(2)}</span>
              <span>פרופיל: {card.profile.title}</span>
            </div>

            {/* Execute Button */}
            <button
              onClick={handleExecuteRecharge}
              disabled={isProcessing}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {isProcessing ? (
                <span>צורב נתונים לשבב ה-NFC...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>אישור וטעינה ישירה לכרטיס</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
