import {Product} from './ProductResService';

export interface ReservationTag {
  id: number;
  updatedAt: string;
  createdAt: string;
  deletedAt: string | null;
  name: string;
  startTime: string;
  endTime: string;
  duration: string;
  unit: 'MINUTE' | 'HOUR';
  products?: Product[];
}

export interface ReservationTagsResponse {
  total: number;
  content: ReservationTag[];
}

export interface ReservationPatternItem {
  day6: boolean;
  day7: boolean;
  day1: boolean;
  day2: boolean;
  day3: boolean;
  day4: boolean;
  day5: boolean;
  fromTime: string;
  toTime: string;
  gender: 'Female' | 'Male' | 'Both';
  price: number;
  tax: number;
  isActive: boolean;
}

export interface ReservationPattern {
  id: number;
  updatedAt: string;
  createdAt: string;
  deletedAt: string | null;
  name: string;
  isActive: boolean;
  items: ReservationPatternItem[];
  autoCalculate: boolean;
  reservationTag: ReservationTag;
}

export interface ReservationPatternsResponse {
  total: number;
  content: ReservationPattern[];
}

export interface ServiceEntryDto {
  id: number;
  title: string;
  sku: string;
  type: number;
  image: {
    name: string;
    width: number;
    height: number;
    size: number;
  } | null;
  price: number;
  discount: number;
  transferableToWallet: boolean;
  status: boolean;
  isLocker: boolean;
  needLocker: number;
  lockerLocation: any | null;
  unlimited: boolean;
  checkInsurance: boolean;
  description: string | null;
  taxSystemDescription: string | null;
  uniqueTaxCode: string | null;
  benefitContractorFromPenalty: boolean;
  related: boolean;
  actionAfterUnfairUsageTime: any;
  tax: number;
  capacity: number;
  reserveCapacity: number;
  reservable: boolean;
  duration: number;
  manualPrice: boolean;
  archivedType: number;
  metadata: {
    reserveColor?: string;
    textColor?: string;
  } | null;
  archivedPenaltyAmount: number;
  convertToIncomeAfterDays: number;
  archivedContractorIncomeType: boolean;
  reservationPenalty: any[];
  category: any;
  categoryId: number;
  unit: any;
  allowComment: boolean;
  withGuest: boolean;
  fairUseTime: number;
  fairUseLimitTime: number;
  fairUseAmountFormula: string | null;
  unfairUseAmount: number;
  hasPriceList: boolean;
  priceList: any[];
  hasContractor: boolean;
  requiredContractor: boolean;
  contractors: any[];
  hasPartner: boolean;
  partners: any[];
  hasSchedules: boolean;
  schedules: any[];
  hasSubProduct: boolean;
  subProducts: any[];
  authorizedSalesUnits: any[];
  authorizedDeliveryUnits: any[];
  alarms: any[];
  isInsuranceService: boolean;
  isSubscriptionService: boolean;
  isGift: boolean;
  giftPackages: any;
  isCashBack: boolean;
  mustSentToTax: boolean;
  receptionAutoPrint: boolean;
  isGiftGenerator: boolean;
  transferAmount: number;
  defaultPrinter: any | null;
  tagProducts: any[];
  reservationPattern: any | null;
  tagProductParent: any | null;
  includeSms: boolean;
  defaultSmsTemplate: string | null;
  reportTag: any | null;
  isReserve: boolean;
  isPreserved: boolean;
  isPreReserved: boolean;
  booked: boolean;
  selfReserved: boolean;
  registeredId: number | null;
  reservePrice: number;
  preReservedUserId?: number;
}

export interface DayEntryDto {
  name: string; // "day1"
  date: string; // "2025/02/01"
  items: ServiceEntryDto[];
}

export interface ResponseReserveViewResponseDto {
  slots: {
    [key: string]: DayEntryDto[]; // Time slots with day-wise reservation data
  };
}

export interface AuthResponseSignUpDto {
  result: boolean;
}

// Reservation expiration time response (in seconds)
export interface ReservationExpiresTimeRes {
  ttlSecond: number; // Time in seconds until reservation expires
}
