export type GetUserCreditRes = {
  result: string;
};

export interface InsuranceService {
  title: string;
  start: string; // ISO date string
  end: string; // ISO date string
  status: number;
  duration: number; // in days
}

export interface SubscriptionService {
  title: string;
  start: string; // ISO date string
  end: string; // ISO date string
  status: number;
  duration: number; // in days
}

export interface Locker {
  lockerNumber: number;
  relayNumber: number;
  priority: number;
  type: number;
  id: number;
  updatedAt: string; // ISO date string
  createdAt: string; // ISO date string
  deletedAt: string | null; // Nullable ISO date string
  status: boolean;
  state: number;
  lockerId: number;
}

export interface VipLocker {
  title: string;
  start: string; // ISO date string
  end: string; // ISO date string
  status: number;
  duration: number; // in days
  locker: Locker;
}

export interface GetUserDashboardRes {
  insuranceService: InsuranceService;
  subscriptionService: SubscriptionService;
  vipLocker: VipLocker;
  lockers: number[];
}

export interface Profile {
  height?: number;
  name?: string;
  size?: number;
  width?: number;
}

export interface User {
  id: number;
  profile?: Profile;
  firstName?: string;
  lastName?: string;
  mobile?: string;
  email?: string;
  phone?: string;
  birthDate?: string | null;
  nationCode?: string | null;
  address?: string | null;
  roles?: string[];
  status?: number;
  insuranceExpiredDate?: string | null;
  disabledDescription?: string;
  authorizedDebtor?: boolean;
  maxDeptAmount?: string;
  gender?: number;
  password?: string;
  credit?: number;
  rate?: number;
  isLegal?: boolean;
  parentId?: number | null;
  resetToken?: string | null;
  resetTime?: string | null;
  resetNumberRequest?: number;
  forceChangePassword?: boolean;
  config?: Record<string, unknown>;
  refreshToken?: string | null;
  lastLoggedIn?: string | null;
  faceSample?: boolean;
  smsClub?: boolean;
  passport?: string | null;
  workAddress?: string | null;
  enFirstName?: string | null;
  enLastName?: string | null;
  fax?: string | null;
  website?: string | null;
  instagramId?: string | null;
  companyName?: string | null;
  companyType?: string | null;
  companyRegistrationNumber?: string | null;
  companyRegistrationDate?: string | null;
  companyNationCode?: string | null;
  companyEconomicCode?: string | null;
  code?: number;
  accessIpAddress?: string | null;
  lastEventId?: number | null;
  faceSampleCreatedAt?: string | null;
  cardSampleCreatedAt?: string | null;
  fingerSampleCreatedAt?: string | null;
  postalCode?: string | null;
  personalTaxCode?: string | null;
  hasActivity?: boolean;
}

export interface OrganizationUnit {
  id: number;
  title?: string;
  description?: string | null;
  locationId?: number | null;
  updatedAt?: string;
  createdAt?: string;
  deletedAt?: string | null;
}

export interface SaleOrder {
  id: number;
  dto?: Record<string, unknown>;
  description?: string | null;
  isCanceled?: boolean;
  preSettleSourceId?: number | null;
  canceledDate?: string | null;
  submitAt?: string;
  settleAmount?: number;
  reception?: boolean;
  credit?: number;
  start?: string;
  end?: string;
  archived?: boolean;
  saleStatus?: number;
  isTransfer?: boolean;
  isReserve?: boolean;
  updatedAt?: string;
  createdAt?: string;
  deletedAt?: string | null;
  fiscalYearId?: number;
  organizationUnitId?: number;
  userId?: number;
  saleUnitId?: number;
  tax?: number;
  discount?: number;
  totalAmount?: number;
  saleType?: number;
  isGift?: boolean;
  meta?: string;
}

export interface Product {
  id: number;
  title?: string;
  sku?: string;
  price?: number;
  discount?: number;
  status?: boolean;
  isLocker?: boolean;
  unlimited?: boolean;
  checkInsurance?: boolean;
  related?: boolean;
  tax?: number;
  capacity?: number;
  reserveCapacity?: number;
  reservable?: boolean;
  duration?: number;
  archivedPenaltyAmount?: number;
  convertToIncomeAfterDays?: number;
  hasContractor?: boolean;
  requiredContractor?: boolean;
  contractors?: null;
  hasPartner?: boolean;
  partners?: null;
  alarms?: any[];
  mustSentToTax?: boolean;
  includeSms?: boolean;
  updatedAt?: string;
  createdAt?: string;
  deletedAt?: string | null;
  type?: number;
  image?: {
    name?: string;
    width?: number;
    height?: number;
    size?: number;
  };
  transferableToWallet?: boolean;
  needLocker?: number;
  description?: string | null;
  taxSystemDescription?: string | null;
  uniqueTaxCode?: string | null;
  benefitContractorFromPenalty?: boolean;
  actionAfterUnfairUsageTime?: number;
  manualPrice?: boolean;
  archivedType?: number;
  metadata?: any[];
  archivedContractorIncomeType?: boolean;
  reservationPenalty?: any[];
  allowComment?: boolean;
  withGuest?: boolean;
  fairUseTime?: number;
  fairUseLimitTime?: number;
  fairUseAmountFormula?: string | null;
  unfairUseAmount?: number;
  hasPriceList?: boolean;
  hasSchedules?: boolean;
  hasSubProduct?: boolean;
  isInsuranceService?: boolean;
  isSubscriptionService?: boolean;
  isGift?: boolean;
  isCashBack?: boolean;
  receptionAutoPrint?: boolean;
  isGiftGenerator?: boolean;
  transferAmount?: number;
  defaultSmsTemplate?: string | null;
  category?: {
    id: number;
    title?: string;
    forEvent?: boolean;
    type?: number;
    isOnline?: boolean;
    updatedAt?: string;
    createdAt?: string;
    deletedAt?: string | null;
    image?: string | null;
  };
  priceList?: any[];
  subProducts?: {
    quantity?: number;
    discount?: number;
    id: number;
    updatedAt?: string;
    createdAt?: string;
    deletedAt?: string | null;
    amount?: number | null;
    tax?: number;
    organizationUnitId?: number | null;
    parentId?: number;
    productId?: number;
    product?: Product;
    categoryId?: number | null;
    saleUnitId?: number | null;
    contractorId?: number | null;
    priceId?: number | null;
  }[];
  categoryId?: number;
}

export interface Content {
  credit?: number;
  usedCredit?: number;
  id: number;
  transferCode?: number | null;
  serial?: string | null;
  isOnline?: boolean;
  saleOrder?: SaleOrder;
  saleOrderId?: number;
  productId?: number;
  type?: number;
  title?: string;
  quantity?: number;
  price?: number;
  amount?: number;
  priceId?: number;
  duration?: number;
  manualPrice?: boolean;
  discount?: number;
  start?: string;
  end?: string;
  archived?: boolean;
  status?: number;
  isTransfer?: boolean;
  isGift?: boolean;
  reservedStartTime?: string | null;
  reservedEndTime?: string | null;
  contractor?: User;
  user?: User;
  organizationUnit?: OrganizationUnit;
  product?: Product;
  usable?: boolean;
  category?: {
    id: number;
    title?: string;
  };
}

export interface GetUserSaleItemRes {
  total: number;
  content: Content[];
}
