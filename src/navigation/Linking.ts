import {LinkingOptions} from '@react-navigation/native';
import {RootStackParamList} from '../utils/types/NavigationTypes';

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['http://localhost:3000', 'http://185.126.10.3:3000'],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'auth/login',
          Signup: 'auth/signup',
          ForgetPassword: 'auth/forget-password',
          OTP: 'auth/otp',
          ResetPassword: 'auth/reset-password',
          LoginWithOTP: 'auth/login-with-otp',
        },
      },
      Root: {
        screens: {
          HomeNavigator: 'home',
          SaleItemNavigator: {
            screens: {
              saleItem: 'sale-item',
              saleItemDetail: 'sale-item-detail/:id/:title?',
            },
          },
        },
      },
      SaleItem: {
        screens: {
          saleItem: 'sale-item-direct',
          saleItemDetail: 'sale-item-direct-detail/:id/:title?',
        },
      },
    },
  },
};

export default linking;
