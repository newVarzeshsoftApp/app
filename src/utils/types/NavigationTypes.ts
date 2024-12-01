export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  SaleItem:
    | undefined
    | {
        screen: keyof SaleItemStackParamList;
        params?: {id: string; title?: string};
      };
};
export type SaleItemStackParamList = {
  saleItem: undefined;
  saleItemDetail: {id: string; title: string};
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
