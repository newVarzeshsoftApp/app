import {NavigatorScreenParams} from '@react-navigation/native';

export type RootStackParamList = {
  Auth: undefined;
  Root: NavigatorScreenParams<DrawerStackParamList>;
  SaleItem:
    | {
        screen: keyof SaleItemStackParamList;
        params?: {id: string; title?: string};
      }
    | undefined;
};
export type SaleItemStackParamList = {
  saleItem: undefined;
  saleItemDetail: {id: number; title: string};
};

export type DrawerStackParamList = {
  HomeNavigator: NavigatorScreenParams<HomeStackParamList> | undefined;
  SaleItemNavigator: NavigatorScreenParams<SaleItemStackParamList> | undefined;
  ShopNavigator: NavigatorScreenParams<ShopStackParamList> | undefined;
  HistoryNavigator: NavigatorScreenParams<OrderStackParamList> | undefined;
  Paymentresult:
    | {
        code: string;
        type: string;
        Authority: string;
        Status: 'OK' | 'NOK';
        RefID: string;
      }
    | undefined;
  WebViewParamsList: {url: string};
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgetPassword: undefined;
  OTP: {username: string; resetPassword?: boolean; LoginWithOTP?: boolean};
  ResetPassword: undefined;
  LoginWithOTP: undefined;
};

export type WalletStackParamList = {
  wallet: undefined;
  ChargeWalletScreen: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  saleItem: undefined;
  ticket: undefined;
  cart: undefined;
  wallet: WalletStackParamList;
};
type ShopDetail = {
  id: number;
  title: string;
  readonly?: boolean;
  contractorId?: number;
  priceId?: number;
};
export type ShopStackParamList = {
  creditService: undefined;
  packageService: undefined;
  service: undefined;

  creditDetail: ShopDetail;
  packageDetail: ShopDetail;
  serviceDetail: ShopDetail;
};
export type OrderStackParamList = {
  reception: undefined;
  transaction: undefined;
  WithdrawDetail: {id: number};
  DepositDetail: {id: number};
  orders: undefined;
  orderDetail: {id: number};
  payments: undefined;
};
