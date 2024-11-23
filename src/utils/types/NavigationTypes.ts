export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgetPassword: undefined;
  OTP: {username: string; resetPassword?: boolean};
  ResetPassword: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  ticket: undefined;
  cart: undefined;
  wallet: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
};
