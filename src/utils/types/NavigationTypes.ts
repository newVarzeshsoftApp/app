import {NavigatorScreenParams} from '@react-navigation/native';

export type RootStackParamList = {
  Auth: undefined;
  Root: undefined;

  SaleItem:
    | {
        screen: keyof SaleItemStackParamList;
        params?: {id: string; title?: string};
      }
    | undefined;
};
export type SaleItemStackParamList = {
  saleItem: undefined;
  saleItemDetail: {id: string; title: string};
};
// export type DrawerStackParamList = {
//   Home: undefined; // Points to HomeNavigator
//   SaleItem:
//     | {
//         screen: keyof SaleItemStackParamList;
//         params?: {id: string; title?: string};
//       }
//     | undefined; // Points to SaleItemNavigator
//   Shop: undefined; // Points to ShopNavigator
//   History: undefined; // Points to HistoryNavigator
// };
export type DrawerStackParamList = {
  Home: undefined;
  SaleItem: NavigatorScreenParams<SaleItemStackParamList> | undefined;
  Shop: NavigatorScreenParams<ShopStackParamList> | undefined;
  History: undefined;
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
