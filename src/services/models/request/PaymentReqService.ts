import {SaleOrderBody} from './OperationalReqService';

export interface PaymentBody {
  amount: number;
  gateway: number;
  description: string;
  isDeposit: boolean;
  dto?: Omit<SaleOrderBody, 'transactions'>;
}
export interface PaymentVerifyBody {
  refId?: string;
  stripId?: string;
  code?: string;
  authority?: string;
  orders?: Omit<SaleOrderBody, 'transactions'>;
  isonlineShop?: boolean;
}
