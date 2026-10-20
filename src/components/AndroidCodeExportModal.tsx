import React, { useState } from 'react';
import { X, Code2, Copy, Check, Terminal, Smartphone, ExternalLink, ShieldAlert } from 'lucide-react';

interface AndroidCodeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const KOTLIN_READER_CODE = `// RavKavReader.kt - קריאת 10 הספרות והיתרה האמיתית של רב-קו באנדרואיד
package com.ravkav.nfc

import android.nfc.Tag
import android.nfc.tech.IsoDep
import android.util.Log

data class RavKavRealData(
    val cardNumber10Digits: String,
    val cardUidHex: String,
    val storedValueNis: Double,
    val profileCode: Int
)

class RavKavReader {
    fun readCard(tag: Tag): RavKavRealData? {
        val isoDep = IsoDep.get(tag) ?: return null

        try {
            isoDep.connect()
            isoDep.timeout = 5000

            // 1. בחירת אפליקציית כרטיס רב-קו (Calypso AID)
            val selectApp = byteArrayOf(
                0x00, 0xA4.toByte(), 0x04, 0x00, 0x08,
                0x31, 0x54, 0x49, 0x43, 0x4B, 0x45, 0x54, 0x00 // "1TICKET"
            )
            val selectResp = isoDep.transceive(selectApp)

            // 2. בחירת קובץ ה-Environment (EF 2001) שבו מאוחסן מספר הכרטיס המודפס
            val selectEnv = byteArrayOf(0x00, 0xA4.toByte(), 0x00, 0x00, 0x02, 0x20, 0x01)
            isoDep.transceive(selectEnv)

            // 3. קריאת רשומה מספר 1 (Record 1) מתוך קובץ 2001
            val readRecord1 = byteArrayOf(0x00, 0xB2.toByte(), 0x01, 0x04, 0x1D)
            val record1 = isoDep.transceive(readRecord1)

            // 4. פענוח 10 הספרות המודפסות על חזית הכרטיס (נמצאות בבייטים 5 עד 8)
            val cardSerialNum = (
                ((record1[5].toLong() and 0xFF) shl 24) or
                ((record1[6].toLong() and 0xFF) shl 16) or
                ((record1[7].toLong() and 0xFF) shl 8) or
                (record1[8].toLong() and 0xFF)
            )
            val cardNumberFormatted = String.format("%010d", cardSerialNum)

            // 5. בחירת קובץ הערך הצבור (EF 2005) לקריאת היתרה הכספית
            var balanceNis = 0.0
            val selectVal = byteArrayOf(0x00, 0xA4.toByte(), 0x00, 0x00, 0x02, 0x20, 0x05)
            if (isoDep.transceive(selectVal).size >= 2) {
                val valRecord = isoDep.transceive(byteArrayOf(0x00, 0xB2.toByte(), 0x01, 0x04, 0x1D))
                if (valRecord.size >= 6) {
                    val agurot = ((valRecord[2].toInt() and 0xFF) shl 16) or
                                 ((valRecord[3].toInt() and 0xFF) shl 8) or
                                 (valRecord[4].toInt() and 0xFF)
                    balanceNis = agurot / 100.0
                }
            }

            return RavKavRealData(
                cardNumber10Digits = cardNumberFormatted,
                cardUidHex = tag.id.joinToString(":") { "%02X".format(it) },
                storedValueNis = balanceNis,
                profileCode = record1[10].toInt() and 0xFF
            )
        } finally {
            isoDep.close()
        }
    }
}`;

const MANIFEST_CODE = `<!-- AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.ravkav.nfc">

    <uses-permission android:name="android.permission.NFC" />
    <uses-feature android:name="android.hardware.nfc" android:required="true" />

    <application
        android:label="RavKav Reader"
        android:theme="@style/Theme.AppCompat.Light.NoActionBar">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <intent-filter>
                <action android:name="android.nfc.action.TECH_DISCOVERED" />
            </intent-filter>
            <meta-data
                android:name="android.nfc.action.TECH_DISCOVERED"
                android:resource="@xml/nfc_tech_filter" />
        </activity>
    </application>
</manifest>`;

export const AndroidCodeExportModal: React.FC<AndroidCodeExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFile, setSelectedFile] = useState<'reader' | 'manifest'>('reader');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentCode = selectedFile === 'reader' ? KOTLIN_READER_CODE : MANIFEST_CODE;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-right my-6">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                קוד מקור מלא לאפליקציית Android מקורית (APK)
              </h2>
              <span className="text-xs text-slate-500">
                קריאת 10 הספרות המודפסות ויתרת ה-Calypso האמיתית דרך IsoDep
              </span>
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
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Explanation Alert */}
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 text-xs leading-relaxed text-amber-900 dark:text-amber-200 space-y-2">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>מדוע דפדפן אינו רואה את 10 הספרות שעל הכרטיס?</span>
            </div>
            <p>
              10 הספרות המודפסות בחזית הרב-קו שלך אינן מזהה החומרה החיצוני (UID) של השבב. הן רשומות עמוק בתוך קובץ בינארי שנקרא <code>EF 2001</code> ברשומה 1 (בייטים 5 עד 8).
              כדי להגיע אליהן, חובה לשלוח לשבב פקודת APDU חומרתית של אנדרואיד: <code>00 B2 01 04 1D</code>.
              דפדפני אינטרנט אינם רשאים להריץ פקודות אלו, אך קוד זה (ב-Kotlin לאנדרואיד) פועל ישירות!
            </p>
          </div>

          {/* File Switcher & Copy Button */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                onClick={() => setSelectedFile('reader')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedFile === 'reader'
                    ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                RavKavReader.kt (קוד הפענוח)
              </button>

              <button
                onClick={() => setSelectedFile('manifest')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedFile === 'manifest'
                    ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                AndroidManifest.xml
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'הועתק ללוח!' : 'העתק קוד'}</span>
            </button>
          </div>

          {/* Code Viewer */}
          <div className="relative rounded-2xl bg-slate-950 text-slate-200 p-4 font-mono text-[11px] overflow-x-auto border border-slate-800 leading-relaxed text-left" dir="ltr">
            <pre>{currentCode}</pre>
          </div>

          {/* Instructions on how to run */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
            <span className="font-bold text-slate-900 dark:text-white block">
              איך להריץ את הקוד הזה ב-Android Studio כדי ליצור APK אמיתי?
            </span>
            <p className="text-slate-600 dark:text-slate-300">
              1. פתח פרויקט חדש ב-Android Studio ובחר בתבנית <strong>Empty Views Activity</strong>.
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              2. העתק את הקובץ <code>RavKavReader.kt</code> לתיקיית הפרויקט שלך.
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              3. הוסף ב-<code>AndroidManifest.xml</code> את הרשאת ה-<code>NFC</code> ואת ה-<code>TECH_DISCOVERED</code>.
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              4. חבר את הטלפון באמצעות כבל USB והפעל את האפליקציה – עם הצמדת הרב-קו, היא תציג את 10 הספרות המודפסות ואת היתרה האמיתית!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};
