export interface WalletGiftItem {
  title: string;
  fromPrice: number;
  toPrice: number;
  type: number; // ۰ مبلغ, ۱ درصد
  gift: number;
  organizationUnits: any;
  id: number;
  updatedAt: string;
  createdAt: string;
  deletedAt: string | null;
  cheque: boolean;
}

export type GetWalletGiftResponse = WalletGiftItem[];
