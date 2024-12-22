export interface PaymentBody {
  amount: number;
  gateway: number;
  description: string;
  isDeposit: boolean;
}
export interface PaymentVerifyBody {
  refId: string;
  stripId: string;
  code: string;
  authority: string;
  orders: string[]; // Array of strings
  isonlineShop: boolean;
}
