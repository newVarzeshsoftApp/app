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

export type lockers = Array<{
  lockerNumber: number;
  relayNumber: number;
  priority: number;
  type: number;
  id: number;
  updatedAt: string; // ISO date string
  createdAt: string; // ISO date string
  deletedAt: string | null;
  status: boolean;
  state: number;
  locker: number;
  lockerId: number;
  relayDelayTime: number;
  relayOnTime: number;
}>;
export interface GetUserDashboardRes {
  insuranceService: InsuranceService;
  subscriptionService: SubscriptionService;
  vipLocker: VipLocker;
  lockers: lockers;
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
export interface SessionDetail {
  start?: string; // ISO date string
  end?: string; // ISO date string
  submitAt?: string; // ISO date string
  lockers?: Locker[];
  contractor?: User;
  quantity?: number;
}

export type SessionDetails = SessionDetail[];
export interface ChargingServiceByIDRes {
  order: number;
  submitAt: string;
  amount: number;
  remain: number;
}
export interface GetUserSaleOrderRes {
  content: SaleOrderContent[];
  total: number;
}

export interface SaleOrderContent {
  id: number;
  dto?: Record<string, unknown>;
  description?: string;
  createdAt: string;
  isCanceled?: boolean;
  preSettleSourceId?: number;
  canceledBy?: User;
  canceledDate?: string;
  sentToTaxBy?: User;
  sentToTaxDate?: string;
  sentToTaxStatus?: number;
  saleOrderReceptionId?: number;
  invoiceNo?: number;
  user?: User;
  taxErrors?: string;
  contract?: Record<string, unknown>;
  userId?: number;
  credit?: number;
  reception?: boolean;
  settleAmount?: number;
  submitAt?: string;
  vipLocker?: VipLocker;
  vipLockerId?: number;
  items?: string[];
  shiftWork?: Record<string, unknown>;
  shiftWorkId?: number;
  saleUnit?: SaleUnit;
  saleUnitId?: number;
  lockers?: LockerObj[];
  start?: string;
  end?: string;
  archived?: boolean;
  isBurn?: boolean;
  transactions?: string[];
  meta?: string;
  tax?: number;
  discount?: number;
  totalAmount?: number;
  quantity?: number;
  saleType?: number;
  isCreatedByDevice?: boolean;
  isGift?: boolean;
  saleStatus?: number;
  project?: Record<string, unknown>;
  transferType?: TransferType;
  userOrderLocker?: number;
  receptionSaleOrder?: string;
  isTransfer?: boolean;
  normalSaleOrder?: string[];
  isReserve?: boolean;
  subProductOrders?: string[];
  parentSubProductOrders?: string;
  userLoan?: number;
  event?: Record<string, unknown>;
  productCategory?: ProductCategory;
  payment?: Payment;
  cashBackParent?: string;
  cashBackParentId?: number;
}
export interface TransferType {
  title: string;
  enable: boolean;
  description: string;
  amount: number;
  paymentType: number;
  isPresent: boolean;
}

export interface ProductCategory {
  title: string;
  forEvent: boolean;
  type: number;
  events: string[];
  image: Image;
  parent?: string;
  categories?: string[];
  isOnline?: boolean;
  saleOrders?: string[];
}

export interface Payment {
  customer: {title: string};
  startPayment?: string;
  endPayment?: string;
  receiptDate?: string;
  expiredAt?: string;
  amount?: number;
  status?: number;
  refId?: string;
  code?: string;
  stripeId?: string;
  traceNo?: string;
  depositor?: string;
  ipAddress?: string;
  agent?: string;
  data?: string;
  callback?: string;
  bankAccount?: BankAccount;
  gateway?: Gateway;
  type?: number;
  attachment?: string;
  authority?: string;
  cardPan?: string;
  cardHash?: string;
  fee?: number;
  orders?: string[];
  dto?: Record<string, unknown>;
  errors?: string;
}

export interface BankAccount {
  title: string;
  bank: string;
  accountNumber: string;
  cartNumber: string;
  shebaNumber: string;
  usageType: number;
  enable: boolean;
  saleUnits: string[];
  organizationUnits: string[];
  pos?: Record<string, unknown>;
  posId?: number;
  defaultSelectedSaleUnits?: string[];
}

export interface Gateway {
  title: string;
  bank: BankAccount;
  token?: string;
  type?: number;
  icon?: string;
  description?: string;
  enable?: boolean;
}
export interface SaleUnit {
  title: string;
  types: string[];
  locationId?: number;
  reception?: string;
  receptionId?: number;
  settleForce?: boolean;
  allowDiscount?: boolean;
  allowSettle?: boolean;
  hasLocker?: boolean;
  autoAssign?: boolean;
  autoAssignPolicy?: string;
  settleTypes?: string[];
  allowEditLoanSchedules?: boolean;
  settleSourcePriority?: string[];
  image?: Image;
  freeReception?: boolean;
  defaultCustomer?: User;
  defaultBank?: Record<string, unknown>;
  printOrderType?: number;
  needLocker?: number;
  lockerLocation?: LockerLocation;
  allowPrintOrder?: boolean;
  allowPrintReception?: boolean;
  asDefault?: boolean;
  defaultPrinter?: Record<string, unknown>;
  isOnline?: boolean;
  allowedToGivingLoan?: boolean;
  allowedToSettleFromOthers?: boolean;
  repeatableTraffic?: boolean;
  userDescriptions?: string[];
}
export interface Image {
  height: number;
  name: string;
  size: number;
  width: number;
}

export interface LockerLocation {
  title: string;
  saleUnits: string[];
  products: string[];
  lockers: string[];
}

export interface GetUserSaleOrderRes {
  content: SaleOrderContent[];
}

export interface SaleOrderByIDRes {
  description?: string | null;
  credit?: number;
  reception?: boolean;
  settleAmount?: number;
  start?: string; // ISO date string
  end?: string; // ISO date string
  archived?: boolean;
  saleStatus?: number;
  isTransfer?: boolean;
  isReserve?: boolean;
  id: number;
  updatedAt?: string; // ISO date string
  createdAt?: string; // ISO date string
  deletedAt?: string | null;
  dto?: SaleOrderDto;
  isCanceled?: boolean;
  preSettleSourceId?: number | null;
  canceledDate?: string | null;
  sentToTaxDate?: string | null;
  sentToTaxStatus?: number;
  saleOrderReceptionId?: string;
  invoiceNo?: string | null;
  taxErrors?: string | null;
  submitAt?: string; // ISO date string
  isBurn?: boolean;
  meta?: string;
  tax?: number;
  discount?: number;
  totalAmount?: number;
  quantity?: number;
  saleType?: number;
  isCreatedByDevice?: boolean;
  isGift?: boolean;
  userOrderLocker?: number | null;
  user?: User;
  lockers?: LockerObj[];
  location?: string | null;
  items?: SaleOrderItem[];
  organizationUnit?: OrganizationUnit;
  saleUnit?: SaleUnit;
  vipLocker?: VipLocker | null;
  transactions?: SaleTransaction[];
  createdBy?: User;
  normalSaleOrder?: string[];
  subProductOrders?: string[];
  parentSubProductOrders?: string | null;
  fiscalYearId?: number;
  organizationUnitId?: number;
  userId?: number;
  vipLockerId?: number | null;
  shiftWorkId?: number;
  saleUnitId?: number;
  cashBackParentId?: number | null;
}

export interface SaleOrderDto {
  user?: number;
  freeReception?: boolean;
  organizationUnit?: number;
  saleUnit?: number;
  submitAt?: string; // ISO date string
  transactions?: any[];
  lockers?: any[];
  lockerQuantity?: number;
  items?: SaleOrderItemDto[];
  fiscalYear?: FiscalYear;
}

export interface SaleOrderItem {
  unlimited?: boolean;
  convertToIncomeAfterArchived?: boolean;
  related?: boolean;
  archived?: boolean;
  credit?: number;
  usedCredit?: number;
  status?: number;
  registeredServiceChangeCredit?: number;
  groupClassRoomIncrement?: number;
  isReserve?: boolean;
  id: number;
  updatedAt?: string; // ISO date string
  createdAt?: string; // ISO date string
  deletedAt?: string | null;
  transferCode?: string | null;
  serial?: string | null;
  isOnline?: boolean;
  type?: number;
  title?: string;
  quantity?: number;
  price?: number;
  amount?: number;
  priceId?: number | null;
  duration?: number | null;
  manualPrice?: boolean;
  unFairPenaltyQuantity?: number;
  discount?: number;
  benefitContractorFromPenalty?: boolean;
  defaultDiscount?: number;
  submitAt?: string; // ISO date string
  remainCredit?: number;
  start?: string; // ISO date string
  end?: string; // ISO date string
  returnCredit?: number;
  archivedTime?: string | null;
  isTransfer?: boolean;
  withGuest?: boolean;
  tax?: number;
  persons?: number;
  description?: string | null;
  isBurn?: boolean;
  isPaymentContractor?: boolean;
  isGift?: boolean;
  isCashBack?: boolean;
  totalDelivered?: number;
  deliveredItems?: string[];
  reservedEndTime?: string | null;
  reservedStartTime?: string | null;
  reservedDate?: string | null;
  isCanceled?: boolean;
  canceledDate?: string | null;
  eventSelectedPriceId?: number | null;
  usable?: boolean;
  product?: Product;
  registeredService?: string | null;
  contractor?: User | null;
  locker?: string | null;
  fiscalYearId?: number;
  organizationUnitId?: number;
  saleOrderId?: number;
  productId?: number;
  lockerId?: number | null;
  contractorId?: number | null;
  userId?: number;
  categoryId?: number;
  saleUnitId?: number;
  registeredServiceId?: number | null;
  groupClassRoomId?: number | null;
  parentId?: number | null;
  consumerId?: number | null;
}

export interface SaleOrderItemDto {
  product?: number;
  duration?: number;
  quantity?: number;
  discount?: number;
  price?: number;
  tax?: number;
  amount?: number;
  manualPrice?: boolean;
  type?: number;
  registeredService?: number;
  start?: string; // ISO date string
  end?: string; // ISO date string
  submitAt?: string; // ISO date string
  items?: string[];
}

export interface FiscalYear {
  id: number;
  updatedAt?: string; // ISO date string
  createdAt?: string; // ISO date string
  year?: number;
  start?: string; // ISO date string
  end?: string; // ISO date string
}

export interface SaleTransaction {
  type?: number;
  description?: string;
  submitAt?: string; // ISO date string
  id: number;
  updatedAt?: string; // ISO date string
  createdAt?: string; // ISO date string
  deletedAt?: string | null;
  sourceType?: number;
  source?: number;
  title?: string;
  amount?: string;
  credit?: string;
  chargeRemainCredit?: string;
  reference?: string | null;
  isTransfer?: boolean;
  meta?: any; //need Review
  user?: User;
  fiscalYearId?: number;
  organizationUnitId?: number;
  userId?: number;
  orderId?: number;
  saleUnitId?: number;
  gatewayId?: number | null;
}
export interface LockerObj {
  createdAt?: string;
  deletedAt?: string;
  id?: number;
  locker?: number;
  updatedAt?: string;
}

export interface Transaction {
  type: number; // Type of transaction (e.g., 1 for some type)
  description?: string; // Transaction description
  submitAt: string; // ISO date string for submission time
  id: number; // Unique transaction ID
  updatedAt: string; // ISO date string for last update
  createdAt: string; // ISO date string for creation
  deletedAt?: string | null; // Nullable ISO date string for deletion
  sourceType: number; // Transaction source type
  source: number | string; // Source identifier
  title?: string; // Title of the transaction
  amount?: string; // Amount involved in the transaction
  credit?: string; // Credit balance after the transaction
  chargeRemainCredit?: string; // Remaining charge/credit
  reference?: string | null; // Optional reference string
  isTransfer: boolean; // Indicates if the transaction is a transfer
  meta?: Record<string, any> | null; // Optional metadata object
  user: User; // Reuse existing `User` interface
  organizationUnit?: OrganizationUnit; // Reuse existing `OrganizationUnit` interface
  saleUnit?: SaleUnit; // Reuse existing `SaleUnit` interface
  order?: SaleOrder; // Reuse existing `SaleOrder` interface
  shiftWork?: {
    id: number;
    title: string;
    organizationUnitId: number;
    updatedAt: string;
    createdAt: string;
    deletedAt?: string | null;
  }; // Shift work details
  installmentLoan?: null; // Placeholder for installment loan (currently always null)
  fiscalYearId: number; // Fiscal year ID
  organizationUnitId: number; // Organization unit ID
  userId: number; // User ID
  orderId?: number | null; // Optional order ID
  saleUnitId: number; // Sale unit ID
  gatewayId?: number | null; // Optional gateway ID
}
export interface TransactionResponse {
  total: number; // Total count of transactions
  content: SaleTransaction[]; // Array of transactions
}
export interface Payments {
  total: number; // Total number of payment records
  content: PaymentRecord[]; // Array of payment records
}

export interface PaymentRecord {
  dto: Record<string, unknown>; // Dynamic object for additional properties
  isDeposit: boolean; // Indicates if it is a deposit
  id: number; // Unique identifier for the payment
  updatedAt: string; // ISO date string
  createdAt: string; // ISO date string
  deletedAt: string | null; // Nullable ISO date string
  startPayment: string; // ISO date string
  endPayment: string | null; // Nullable ISO date string
  receiptDate: string | null; // Nullable ISO date string
  expiredAt: string | null; // Nullable ISO date string
  amount: number; // Payment amount
  status: number; // Payment status
  refId: string | null; // Nullable reference ID
  code: string | null; // Nullable payment code
  stripeId: string | null; // Nullable Stripe ID
  traceNo: string | null; // Nullable trace number
  depositor: string | null; // Nullable depositor information
  ipAddress: string | null; // Nullable IP address
  agent: string | null; // Nullable agent information
  data: Record<string, unknown> | null; // Nullable dynamic object for additional data
  callback: string | null; // Nullable callback URL
  type: number; // Payment type (e.g., 0 for specific types)
  attachment: string | null; // Nullable attachment URL or reference
  authority: string; // Payment authority string
  cardPan: string | null; // Nullable card PAN
  cardHash: string | null; // Nullable hashed card information
  fee: number | null; // Nullable transaction fee
  errors: string | null; // Nullable error information
  customer: Customer; // Customer details
  orders: any[]; // Array of orders (structure not provided)
  gateway: Gateway; // Gateway details
  transaction: Transaction | null; // Nullable transaction details
}
export interface Customer {
  id: number; // Unique identifier for the customer
  profile: any | null; // Nullable customer profile (unknown structure)
  firstName: string; // Customer's first name
  lastName: string; // Customer's last name
  mobile: string; // Customer's mobile number
  email: string | null; // Nullable email address
  phone: string | null; // Nullable phone number
  birthDate: string | null; // Nullable birthdate (ISO string)
  nationCode: string | null; // Nullable national code
  address: string | null; // Nullable address
  disabledDescription: string; // Description for disabled state
  authorizedDebtor: boolean; // Indicates if the customer is an authorized debtor
  maxDeptAmount: string; // Maximum debt amount
  gender: number; // Gender (e.g., 0 for male, 1 for female)
  password: string; // Encrypted password
  credit: number; // Customer's credit balance
  totalCost: string; // Total cost associated with the customer
  rate: number; // Customer's rate (e.g., 0 for default)
  isLegal: boolean; // Indicates if the customer is a legal entity
  resetToken: string | null; // Nullable reset token
  resetTime: string | null; // Nullable reset timestamp
  resetNumberRequest: number; // Number of reset requests
  forceChangePassword: boolean; // Indicates if password change is enforced
  refreshToken: string | null; // Nullable refresh token
  lastLoggedIn: string | null; // Nullable last login timestamp
  activityField: string; // Activity field (unknown purpose)
  updatedAt: string; // ISO date string
  createdAt: string; // ISO date string
  deletedAt: string | null; // Nullable ISO date string
  birthDay: string | null; // Nullable birth day
  birthMonth: string | null; // Nullable birth month
  roles: string[]; // Array of roles
  status: number; // Customer's status
  insuranceExpiredDate: string | null; // Nullable insurance expiry date
  config: Record<string, unknown>; // Dynamic object for additional configuration
  faceSample: boolean; // Indicates if face sample is present
  smsClub: boolean; // Indicates SMS club membership
  passport: string | null; // Nullable passport information
  workAddress: string | null; // Nullable work address
  enFirstName: string | null; // Nullable English first name
  enLastName: string | null; // Nullable English last name
  fax: string | null; // Nullable fax information
  website: string | null; // Nullable website URL
  instagramId: string | null; // Nullable Instagram ID
  companyName: string | null; // Nullable company name
  companyType: string | null; // Nullable company type
  companyRegistrationNumber: string | null; // Nullable company registration number
  companyRegistrationDate: string | null; // Nullable company registration date
  companyNationCode: string | null; // Nullable company national code
  companyEconomicCode: string | null; // Nullable company economic code
  code: number; // Customer code
  accessIpAddress: string | null; // Nullable access IP address
  lastEventId: number | null; // Nullable last event ID
  faceSampleCreatedAt: string | null; // Nullable face sample creation date
  cardSampleCreatedAt: string | null; // Nullable card sample creation date
  fingerSampleCreatedAt: string | null; // Nullable finger sample creation date
  postalCode: string | null; // Nullable postal code
  personalTaxCode: string | null; // Nullable personal tax code
  hasActivity: boolean; // Indicates if the customer has activity
  parentId: number | null; // Nullable parent ID
}

export interface Gateway {
  enable?: boolean; // Indicates if the gateway is enabled
  id: number; // Unique gateway ID
  updatedAt: string; // ISO date string
  createdAt: string; // ISO date string
  deletedAt: string | null; // Nullable ISO date string
  title: string; // Gateway title
  token?: string; // Gateway token
  type?: number; // Gateway type
  icon?: string; // Nullable icon URL
  description?: string; // Nullable description
  bank: BankAccount; // Bank details
}

export interface Bank {
  title: string; // Bank title
  bank: string; // Bank name
  accountNumber: string; // Bank account number
  cartNumber: string; // Card number
  shebaNumber: string; // Sheba number
  usageType: number; // Usage type
  enable: boolean; // Indicates if the bank is enabled
  organizationUnits: string[] | null; // Nullable organization units
  id: number; // Bank ID
  updatedAt: string; // ISO date string
  createdAt: string; // ISO date string
  deletedAt: string | null; // Nullable ISO date string
  posId: number; // POS ID
}
