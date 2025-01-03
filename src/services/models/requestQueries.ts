import {ProductType, RegisteredServiceStatus} from '../../constants/options';

export interface AllOrganizationQuery {
  sku?: string;
  name?: string;
  id?: number;
}
export interface UserSaleItemQuey {
  status?: RegisteredServiceStatus;
  sortOrder?: string;
  sortField?: string;
  limit?: number;
  offset?: number;
  type?: number;
  parent?: number;
}
export interface UserSaleOrderQuery {
  end?: string;
  start?: string;
  limit?: number;
  offset?: number;
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
    equals: number;
  };
}
export interface CategoryQuery {
  type: {
    equals: ProductType;
  };
}

export interface UserTransactionQuery {
  end?: string;
  start?: string;
  limit?: number;
  offset?: number;
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
}
