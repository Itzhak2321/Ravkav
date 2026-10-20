import React from 'react';
import { X, Radio, Smartphone, ShieldCheck, Cpu, AlertTriangle, HelpCircle } from 'lucide-react';

interface NfcGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NfcGuideModal: React.FC<NfcGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-right my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                מדריך: קריאת כרטיסי רב-קו באמצעות NFC
              </h2>
              <span className="text-xs text-slate-500">מידע טכני, אופן ההצמדה והגדרות דפדפן</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: How to scan */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              איך להצמיד את הכרטיס לקריאה מוצלחת?
            </h3>
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 text-xs leading-relaxed text-slate-700 dark:text-slate-300 space-y-2">
              <p>
                <strong>1. מיקום האנטנה:</strong> ברוב מכשירי האנדרואיד המודרניים (Samsung Galaxy, Google Pixel, Xiaomi),
                אנטנת ה-NFC ממוקמת בגב המכשיר — בסמוך למערך המצלמות העליון או במרכז הגב.
              </p>
              <p>
                <strong>2. הצמדה יציבה:</strong> יש להצמיד את כרטיס הרב-קו בצורה שטוחה וישירה לגב המכשיר ולהחזיק אותו
                למשך שניה אחת ברציפות עד להשמע צליל התיקוף (ביפ).
              </p>
              <p>
                <strong>3. כיסויים ומגנים:</strong> מגיני טלפון עבים במיוחד או כאלה המכילים לוחית מתכת לרכב עלולים לחסום
                את תדרי ה-13.56 MHz של ה-NFC. מומלץ להסירם במידת הצורך.
              </p>
            </div>
          </div>

          {/* Section 2: Technical specifications */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600" />
              טכנולוגיית כרטיסי הרב-קו בישראל (Calypso / Mifare)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">
                  תקן Calypso (ISO 14443-B)
                </span>
                <span className="text-slate-600 dark:text-slate-400 leading-relaxed block">
                  כרטיסי הרב-קו האישיים בישראל מבוססים על תקן Calypso הבינלאומי (בדומה לכרטיס ה-Navigo בפריז).
                  כרטיסים אלו כוללים שבב קריפטוגרפי מאובטח הפועל בתדר 13.56MHz.
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">
                  תקן Web NFC בדפדפן
                </span>
                <span className="text-slate-600 dark:text-slate-400 leading-relaxed block">
                  ממשק ה-Web NFC API של ארגון W3C מאפשר לאפליקציות ווב ב-Chrome לאנדרואיד לקרוא את מזהה החומרה (UID)
                  והודעות NDEF ישירות ללא צורך בהתקנת אפליקציה מחנות האפליקציות.
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Browser Compatibility & Tips */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              תאימות דפדפנים ומערכות הפעלה
            </h3>
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 text-xs leading-relaxed text-amber-900 dark:text-amber-200 space-y-2">
              <p>
                • <strong>Android + Chrome:</strong> תמיכה מלאה בסריקה חיה של כרטיסי רב-קו באמצעות ממשק Web NFC.
                יש לוודא ש-NFC דולק בווילון ההגדרות המהירות של אנדרואיד.
              </p>
              <p>
                • <strong>חלון עצמאי (Top-Level Browsing Context):</strong> מטעמי אבטחה מחמירים במערכת Android,
                חיישן ה-NFC מורשה לפעול רק כאשר האתר פתוח ישירות בלשונית עצמאית בדפדפן, ולא בתוך מסגרת Preview מוטמעת.
              </p>
              <p>
                • <strong>iPhone (iOS):</strong> חברת Apple חוסמת כרגע את הגישה ל-Web NFC דרך דפדפן Safari (תומכת רק
                באפליקציות Native ב-Swift). עבור משתמשי אייפון ומחשבים, המערכת מציעה מצב הדגמה אינטראקטיבי מלא עם כל סוגי
                הכרטיסים והחוזים.
              </p>
              <p>
                • <strong>מחשבים שולחניים:</strong> מחשבים אינם מצוידים באנטנת NFC; השתמש בכרטיסי הדוגמה או בהזנה ידנית.
              </p>
            </div>
          </div>

          {/* Section 4: Privacy & Security */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              אבטחת מידע ופרטיות
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              הקריאה מתבצעת ישירות מקומית במכשירך בלבד (Client-side). כרטיסי רב-קו מוגנים במפתחות הצפנה תעשייתיים (DES/AES)
              המונעים חיוב או פעולות בלתי מורשות ללא מסוף תחבורה מורשה של משרד התחבורה.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            הבנתי, תודה!
          </button>
        </div>
      </div>
    </div>
  );
};
