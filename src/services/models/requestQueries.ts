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
