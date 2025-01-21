export type SaleOrderTransaction = {
  type?: number;
  source?: number;
  amount?: number;
  user?: number;
  submitAt?: string;
  fromGuest?: boolean;
};

export type SaleOrderItem = {
  product?: number;
  duration?: number;
  quantity?: number;
  discount?: number;
  price?: number;
  tax?: number;
  amount?: number;
  manualPrice?: boolean;
  type?: number;
  user?: number;
  registeredService?: number;
  contractor?: number | null;
  contractorId?: number | null;
  start?: string;
  end?: string;
  priceId?: number | null;
  usable?: boolean;
  waitingForGroupClass?: boolean;
  isOnline?: boolean;
};

export type SaleOrderBody = {
  freeReception?: boolean;
  organizationUnit?: number;
  saleUnit?: number;
  submitAt?: string;
  user?: number;
  transactions?: SaleOrderTransaction[];
  lockers?: string[];
  lockerQuantity?: number;
  items?: SaleOrderItem[];
  location?: string;
  transferType?: string;
};
