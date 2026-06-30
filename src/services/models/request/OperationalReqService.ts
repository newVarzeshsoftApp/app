export type SaleOrderTransaction = {
  type?: number;
  source?: number;
  amount?: number;
  user?: number;
  submitAt?: string;
  fromGuest?: boolean;
  usedByOther?: boolean;
};

export type RegisteredGroupClassScheduleDto = {
  groupClassRoom: number;
  id: number;
  days: number[];
  from: string;
  to: string;
  groupClassRoomScheduleId: number;
};

export type SaleOrderItem = {
  id?: number;
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
  groupClassRoom?: number;
  isOnline?: boolean;
  registeredGroupClassSchedule?: RegisteredGroupClassScheduleDto[];
  items?: SaleOrderItem[];
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
  orders?: any[]; // For orders array with reservation and regular items
  location?: string;
  transferType?: string;
};

export type CreateSaleOrderDto = {
  orders: SaleOrderBody[];
};
