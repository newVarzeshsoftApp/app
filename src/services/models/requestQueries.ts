import {ProductType, RegisteredServiceStatus} from '../../constants/options';

export interface AllOrganizationQuery {
  sku?: string;
  name?: string;
  id?: number;
}
export interface UserSaleItemQuey {
  status?: RegisteredServiceStatus;
  limit?: number;
  offset?: number;
  type?: number;
  parent?: number;
  sortField?: string;
  sortOrder?: -1 | 1;
  isReserved?: boolean;
  isGift?: boolean;
  PageNumber?: number;
  PageSize?: number;
  searchQuery?: string;
}
//
export interface UserPaymentQuey {
  status?: RegisteredServiceStatus;
  limit?: number;
  offset?: number;
  type?: number;
  sortField?: string;
  sortOrder?: -1 | 1;
  startPayment?: {
    lte?: string | null;
    gte?: string | null;
  };
  parent?: number;
}
export interface UserSaleOrderQuery {
  end?: string;
  start?: string;
  limit?: number;
  offset?: number;
  sortField?: string;
  sortOrder?: -1 | 1;
  reception?: {
    equals: boolean;
  };
}
export interface ProductQuery {
  limit?: number;
  offset?: number;
  type: {
    equals: ProductType;
  };
  category: {
    equals: string;
  };
}
export interface CategoryQuery {
  type: {
    equals: ProductType | '';
  };
}

export interface UserTransactionQuery {
  end?: string;
  start?: string;
  limit?: number;
  offset?: number;
  sortField?: string;
  sortOrder?: -1 | 1;
  type?: {
    equals?: 0 | 1 | 2;
  };
  submitAt?: {
    lte?: string | null;
    gte?: string | null;
  };
}
export interface UserWalletTransactionQuery {
  limit?: number;
  offset?: number;
  sortField?: string;
  sortOrder?: -1 | 1;
}

export interface AdvertisementQuery {
  offset?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: -1 | 1;
}

export interface IntroductionMethodQuery {
  offset?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: -1 | 1;
}

export interface GatewayLogQuery {
  status?: 'connected' | 'disconnected' | 'error' | 'success';
  type?: 'message' | 'connection';
  user?: number;
  pattern?: string;
  offset?: string;
  limit?: string;
}

export interface ReservationQuery {
  tagId: number;
  patternId?: number;
  gender?: 'Female' | 'Male' | 'Both';
  saleUnit?: number;
  startTime?: string; // "10:00"
  endTime?: string; // "11:00"
  start: string; // "2025/12/01"
  end?: string; // "2025/12/01"
  days?: string; // "1,2" (comma-separated day numbers)
}

export interface PreReserveQuery {
  product: number;
  day: string;
  fromTime: string;
  toTime: string;
  gender: string;
  specificDate: string;
  isLocked: boolean;
}
