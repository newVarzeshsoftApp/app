import {RegisteredServiceStatus} from '../../constants/options';

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
export interface UserTransactionQuery {
  end?: string;
  start?: string;
  limit?: number;
  offset?: number;
  type?: {
    equals?: 0 | 1 | 2;
  };
  submitAt?: {
    lte?: string;
    gte?: string;
  };
}
export interface UserWalletTransactionQuery {
  limit?: number;
  offset?: number;
}
