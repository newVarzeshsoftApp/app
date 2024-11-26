export type RootStackParamList = {
  Auth: undefined;
  Home: {
    screen?: keyof HomeStackParamList;
  };
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
  ticket: undefined;
  cart: undefined;
  wallet: undefined;
};
