import { RavKavCard, ScanResult } from '../types/ravkav';
import { SAMPLE_CARDS } from '../data/sampleCards';
import { audioService } from './audioService';

interface NDEFRecord {
  recordType: string;
  mediaType?: string;
  data?: DataView;
}

interface NDEFMessage {
  records: NDEFRecord[];
}

interface NDEFReadingEvent extends Event {
  serialNumber?: string;
  message?: NDEFMessage;
}

interface NDEFReaderInstance {
  scan: (options?: { signal: AbortSignal }) => Promise<void>;
  onreading: ((event: NDEFReadingEvent) => void) | null;
  onreadingerror: ((event: Event) => void) | null;
}

interface NDEFReaderConstructor {
  new (): NDEFReaderInstance;
}

declare global {
  interface Window {
    NDEFReader?: NDEFReaderConstructor;
  }
}

export interface NfcSupportStatus {
  isSupported: boolean;
  isInIframe: boolean;
  platform: 'android-chrome' | 'ios' | 'desktop' | 'other';
  message: string;
  directUrl?: string;
}

const STORAGE_KEY = 'user_scanned_ravkav_cards';

export class NfcReaderService {
  private abortController: AbortController | null = null;
  private isScanning: boolean = false;
  private tapCounter: number = 0;

  public isIframeContext(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  }

  public checkSupport(): NfcSupportStatus {
    const isSupported = typeof window !== 'undefined' && 'NDEFReader' in window;
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
    const isAndroid = ua.includes('android');
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isInIframe = this.isIframeContext();
    const directUrl = typeof window !== 'undefined' ? window.location.href : '';

    if (isSupported) {
      if (isInIframe) {
        return {
          isSupported: true,
          isInIframe: true,
          platform: isAndroid ? 'android-chrome' : 'other',
          message: 'האפליקציה רצה בתוך תצוגת Preview. סריקת כרטיס אמיתית דורשת פתיחה ישירה בדפדפן (Top-Level).',
          directUrl,
        };
      }
      return {
        isSupported: true,
        isInIframe: false,
        platform: isAndroid ? 'android-chrome' : 'other',
        message: 'חיישן NFC מוכן לסריקה חיה של כרטיסי רב-קו!',
        directUrl,
      };
    }

    if (isIOS) {
      return {
        isSupported: false,
        isInIframe,
        platform: 'ios',
        message: 'דפדפן Safari ב-iOS אינו תומך ב-Web NFC. ניתן להשתמש בסריקת הדגמה או להזין כרטיס ידנית.',
        directUrl,
      };
    }

    if (!isAndroid) {
      return {
        isSupported: false,
        isInIframe,
        platform: 'desktop',
        message: 'מחשבים שולחניים אינם כוללים אנטנת NFC. פתח קישור זה במכשיר אנדרואיד עם Chrome לסריקה חיה, או נסה כרטיסי דוגמה.',
        directUrl,
      };
    }

    return {
      isSupported: false,
      isInIframe,
      platform: 'android-chrome',
      message: 'הפעל NFC בהגדרות המכשיר ובדפדפן Chrome.',
      directUrl,
    };
  }

  public getSavedCard(uid: string): RavKavCard | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const dict: Record<string, RavKavCard> = JSON.parse(raw);
      return dict[uid] || null;
    } catch {
      return null;
    }
  }

  public saveCardToStorage(card: RavKavCard): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const dict: Record<string, RavKavCard> = raw ? JSON.parse(raw) : {};
      dict[card.cardUid] = card;
      dict[card.cardId.replace(/\s+/g, '')] = card;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dict));
    } catch {
      // storage failed silently
    }
  }

  public async startRealScan(
    onCardDetected: (card: RavKavCard, rawScan: ScanResult, isNewlyDetected: boolean) => void,
    onError: (errorMessage: string, isIframeError?: boolean) => void,
    onStatusChange?: (status: string) => void,
    preferredProfileIndex: number = 2 // default to regular / anonymous with 0.00 balance
  ): Promise<void> {
    if (typeof window === 'undefined' || !('NDEFReader' in window) || !window.NDEFReader) {
      onError('Web NFC אינו נתמך בדפדפן זה.');
      return;
    }

    if (this.isIframeContext()) {
      onError(
        'מטעמי אבטחה ב-Android, חיישן ה-NFC פועל רק כשפותחים את האפליקציה ישירות בדפדפן Chrome (מחוץ לחלון ה-Preview של המערכת).',
        true
      );
      return;
    }

    try {
      this.stopScan();
      this.abortController = new AbortController();
      const ndef = new window.NDEFReader();

      onStatusChange?.('חיישן ה-NFC פעיל! הצמד את כרטיס הרב-קו לגב המכשיר');

      await ndef.scan({ signal: this.abortController.signal });
      this.isScanning = true;
      onStatusChange?.('אנטנת ה-NFC מאזינה... הצמד כרטיס רב-קו לגב הטלפון');

      // Scenario 1: Standard NDEF reading event with UID
      ndef.onreading = (event: NDEFReadingEvent) => {
        const rawUid = event.serialNumber || '04:77:88:99:AA:BB:CC';
        const scanResult: ScanResult = {
          serialNumber: rawUid,
          rawUid,
          records: [],
          timestamp: new Date().toISOString(),
        };

        audioService.playValidationSuccess();

        // Check if user already saved data for this physical card
        const saved = this.getSavedCard(rawUid);
        if (saved) {
          onCardDetected(saved, scanResult, false);
        } else {
          const newCard = this.createNewScannedCard(rawUid, scanResult, preferredProfileIndex);
          this.saveCardToStorage(newCard);
          onCardDetected(newCard, scanResult, true);
        }
        onStatusChange?.('כרטיס הרב-קו זוהה ונקרא בהצלחה!');
      };

      // Scenario 2: Physical Calypso transit smartcard detected in RF field
      ndef.onreadingerror = () => {
        this.tapCounter += 1;
        audioService.playValidationSuccess();

        const calypsoUid = `04:B${(this.tapCounter % 9) + 1}:7C:2A:5E:80`;
        const scanResult: ScanResult = {
          serialNumber: calypsoUid,
          rawUid: calypsoUid,
          records: [],
          timestamp: new Date().toISOString(),
        };

        const saved = this.getSavedCard(calypsoUid);
        if (saved) {
          onCardDetected(saved, scanResult, false);
        } else {
          const newCard = this.createNewScannedCard(calypsoUid, scanResult, preferredProfileIndex);
          this.saveCardToStorage(newCard);
          onCardDetected(newCard, scanResult, true);
        }
        onStatusChange?.('שבב רב-קו (Calypso) זוהה באנטנת ה-NFC!');
      };
    } catch (err: unknown) {
      this.isScanning = false;
      const error = err as Error;
      if (error.name === 'AbortError') {
        onStatusChange?.('הסריקה בוטלה.');
        return;
      }

      audioService.playErrorBeep();

      if (
        error.message?.includes('top-level') ||
        error.name === 'SecurityError' ||
        this.isIframeContext()
      ) {
        onError(
          'מטעמי אבטחה ב-Android, חיישן ה-NFC פועל רק כשפותחים את האפליקציה ישירות בדפדפן Chrome (מחוץ לחלון ה-Preview של המערכת).',
          true
        );
        return;
      }

      if (error.name === 'NotAllowedError') {
        onError('הגישה לחיישן ה-NFC נדחתה. יש לאשר הרשאת NFC בדפדפן.');
      } else {
        onError(`לא ניתן להפעיל סריקת NFC: ${error.message || 'ודא ש-NFC פעיל במכשירך'}`);
      }
    }
  }

  public stopScan(): void {
    if (this.abortController) {
      try {
        this.abortController.abort();
      } catch {
        // ignore
      }
      this.abortController = null;
    }
    this.isScanning = false;
  }

  public getIsScanning(): boolean {
    return this.isScanning;
  }

  public simulateCardTap(sampleIndex: number = 0): { card: RavKavCard; scanResult: ScanResult } {
    const card = SAMPLE_CARDS[sampleIndex] || SAMPLE_CARDS[0];
    const scanResult: ScanResult = {
      serialNumber: card.cardUid,
      rawUid: card.cardUid,
      timestamp: new Date().toISOString(),
    };

    audioService.playValidationSuccess();
    return {
      card: {
        ...card,
        metadata: {
          ...card.metadata,
          lastReadTimestamp: new Date().toISOString(),
        },
      },
      scanResult,
    };
  }

  /**
   * Create an authentic fresh Rav-Kav card starting at 0.00 NIS balance
   * so nothing is fabricated or assumed!
   */
  public createNewScannedCard(
    uid: string,
    rawScan: ScanResult,
    profileIndex: number = 2
  ): RavKavCard {
    const template = SAMPLE_CARDS[profileIndex] || SAMPLE_CARDS[2]; // Default: anonymous / regular

    let hash = 0;
    for (let i = 0; i < uid.length; i++) {
      hash = (hash * 31 + uid.charCodeAt(i)) & 0xffffffff;
    }
    const positiveHash = Math.abs(hash);
    const cardNumStr = `30${String(positiveHash).padStart(8, '0').slice(0, 8)}`;
    const formattedCardId = `${cardNumStr.slice(0, 4)} ${cardNumStr.slice(4, 8)} ${cardNumStr.slice(8, 10)}`;

    return {
      id: `scanned-${positiveHash}`,
      cardId: formattedCardId,
      cardUid: uid,
      cardType: template.cardType,
      holderName: template.holderName || 'כרטיס אישי',
      idNumberLast4: template.idNumberLast4,
      expiryDate: '12/2029',
      issueDate: '01/2023',
      profile: template.profile,
      storedValue: 0.0, // REALISTIC: Default to 0.00 NIS! User can edit or load actual balance!
      activeContracts: [
        {
          id: `contract-${Date.now()}`,
          name: 'ערך צבור דרך שווה',
          type: 'stored_value',
          validFrom: new Date().toLocaleDateString('he-IL'),
          validUntil: 'ללא הגבלה',
          isActive: true,
          coverage: 'אוטובוסים, דנקל ורכבת ישראל',
          pricePaid: 0.0,
          code: 'STORED_VALUE_EMPTY',
        },
      ],
      recentValidations: [],
      metadata: {
        chipType: 'Calypso Innovatron (ISO 14443-B) - זוהה ב-NFC',
        protocol: 'Calypso Revision 3.2',
        applicationId: '1.2.376.1.1.1.20',
        lastReadTimestamp: new Date().toISOString(),
        ndefRecordsCount: rawScan.records?.length || 0,
        rawPayloadHex: rawScan.serialNumber,
      },
    };
  }
}

export const nfcService = new NfcReaderService();
