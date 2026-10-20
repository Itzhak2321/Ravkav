export type CardType = 'personal' | 'anonymous' | 'senior_gold' | 'student' | 'youth' | 'special';

export type TransitOperator =
  | 'דן'
  | 'אגד'
  | 'רכבת ישראל'
  | 'תבל מטרו (דנקל הקו האדום)'
  | 'כפיר (רכבת קלה ירושלים)'
  | 'מטרופולין'
  | 'קווים'
  | 'סופרבוס'
  | 'אלקטרה אפיקים';

export interface ActiveContract {
  id: string;
  name: string;
  type: 'monthly' | 'daily' | 'stored_value' | 'semester' | 'special';
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  coverage: string;
  pricePaid: number;
  code: string;
}

export interface ValidationRecord {
  id: string;
  timestamp: string; // ISO date string
  operator: TransitOperator;
  line: string;
  station: string;
  city: string;
  fare: number;
  contractUsed: string;
  isTransferWindow: boolean;
  transferMinutesRemaining?: number;
  vehicleNumber?: string;
}

export interface CardProfile {
  title: string;
  discountPercentage: number;
  validUntil: string;
  profileCode: number;
}

export interface RavKavCard {
  id: string;
  cardId: string; // 10-digit number e.g. "3028 4910 82"
  cardUid: string; // Hex e.g. "04:A2:3B:5F:81:40:9E"
  cardType: CardType;
  holderName?: string;
  idNumberLast4?: string;
  expiryDate: string; // e.g. "10/2029"
  issueDate: string;
  profile: CardProfile;
  storedValue: number; // Balance in ILS
  activeContracts: ActiveContract[];
  recentValidations: ValidationRecord[];
  metadata: {
    chipType: string;
    protocol: string;
    applicationId: string;
    lastReadTimestamp: string;
    ndefRecordsCount?: number;
    rawPayloadHex?: string;
  };
}

export interface ScanResult {
  serialNumber?: string;
  records?: Array<{
    recordType: string;
    mediaType?: string;
    data?: string;
  }>;
  rawUid?: string;
  timestamp: string;
}
