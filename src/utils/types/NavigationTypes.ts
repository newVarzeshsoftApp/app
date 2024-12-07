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
  HomeNavigator: undefined;
  SaleItemNavigator: NavigatorScreenParams<SaleItemStackParamList> | undefined;
  ShopNavigator: NavigatorScreenParams<ShopStackParamList> | undefined;
  HistoryNavigator: NavigatorScreenParams<OrderStackParamList> | undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgetPassword: undefined;
  OTP: {username: string; resetPassword?: boolean; LoginWithOTP?: boolean};
  ResetPassword: undefined;
  LoginWithOTP: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  saleItem: undefined;
  ticket: undefined;
  cart: undefined;
  wallet: undefined;
};
export type ShopStackParamList = {
  creditService: undefined;
  packageService: undefined;
  service: undefined;
};
export type OrderStackParamList = {
  reception: undefined;
  transaction: undefined;
  orders: undefined;
  payments: undefined;
};
