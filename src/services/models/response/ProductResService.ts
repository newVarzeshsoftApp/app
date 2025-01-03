export interface Product {
  title: string;
  sku: string;
  price: number;
  discount: number;
  status: boolean;
  isLocker: boolean;
  unlimited: boolean;
  checkInsurance: boolean;
  related: boolean;
  tax: number;
  capacity: number;
  reserveCapacity: number;
  reservable: boolean;
  duration: number;
  archivedPenaltyAmount: number;
  convertToIncomeAfterDays: number;
  hasContractor: boolean;
  requiredContractor: boolean;
  isOnline: boolean;
  isKiosk: boolean | null;
  contractors: any[];
  hasPartner: boolean;
  partners: any | null;
  alarms: Alarm[];
  mustSentToTax: boolean;
  includeSms: boolean;
  id: number;
  updatedAt: string;
  createdAt: string;
  deletedAt: string | null;
  type: number;
  image: Image | null;
  transferableToWallet: boolean;
  needLocker: number;
  description: string | null;
  taxSystemDescription: string | null;
  uniqueTaxCode: string | null;
  benefitContractorFromPenalty: boolean;
  actionAfterUnfairUsageTime: number;
  manualPrice: boolean;
  archivedType: number;
  metadata: any[];
  archivedContractorIncomeType: boolean;
  reservationPenalty: any[];
  allowComment: boolean;
  withGuest: boolean;
  fairUseTime: number;
  fairUseLimitTime: number;
  fairUseAmountFormula: string | null;
  unfairUseAmount: number;
  hasPriceList: boolean;
  hasSchedules: boolean;
  hasSubProduct: boolean;
  isInsuranceService: boolean;
  isSubscriptionService: boolean;
  isGift: boolean;
  isCashBack: boolean;
  receptionAutoPrint: boolean;
  isGiftGenerator: boolean;
  transferAmount: number;
  defaultSmsTemplate: string | null;
  unit: string | null;
  category: Category;
  priceList: PriceList[];
  defaultPrinter: any | null;
  tagProducts: any[];
  reportTag: ReportTag | null;
  reservationPattern: any | null;
  tagProductParent: any | null;
  lockerLocation: any | null;
  categoryId: number;
}

export interface ProductPageRes {
  total: number;
  content: Product[];
}
interface Alarm {
  key: string;
  value: number;
  type: string;
  color: string;
}

interface Image {
  name: string;
  width: number;
  height: number;
  size: number;
}

interface Category {
  title: string;
  forEvent: boolean;
  type: number;
  isOnline: boolean;
  isKiosk: boolean | null;
  id: number;
  updatedAt: string;
  createdAt: string;
  deletedAt: string | null;
  image: string | null;
}

interface PriceList {
  id: number;
  updatedAt: string;
  createdAt: string;
  deletedAt: string | null;
  title: string | null;
  min: number;
  max: number;
  duration: number;
  price: number;
  credit: number;
  cashBackPercentage: number;
  cashBackDuration: number;
  discountOnlineShopPercentage: number;
  metadata: Record<string, any>;
}

interface ReportTag {
  id: number;
  updatedAt: string;
  createdAt: string;
  deletedAt: string | null;
  name: string;
}
