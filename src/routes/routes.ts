export const routes = {
  baseUrl: process.env.BASE_URL,
  auth: {
    signIn: () => 'auth/sign-in',
    signUp: () => 'auth/sign-up',
    requestOTP: () => 'auth/request-otp',
    verifyToken: () => `auth/verify-token`,
    updatePassword: () => 'auth/change-password',
    profile: () => 'auth/profile',
    logout: () => 'auth/logout',
  },
};
