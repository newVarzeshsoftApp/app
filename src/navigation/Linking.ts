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
          HomeNavigator: {
            screens: {
              Home: 'home',
              ticket: 'tickets',
              cart: 'cart',
              wallet: {
                screens: {
                  wallet: 'wallet',
                  ChargeWalletScreen: 'charge-wallet',
                },
              },
            },
          },

          SaleItemNavigator: {
            screens: {
              saleItem: 'sale-item',
              saleItemDetail: 'sale-item/:id/:title?',
            },
          },

          ShopNavigator: {
            screens: {
              creditService: 'shop/credit',
              creditDetail:
                'shop/credit/:id/:title/:readonly?/:contractorId?/:priceId?',
              packageService: 'shop/package',
              packageDetail:
                'shop/package/:id/:title/:readonly?/:contractorId?/:priceId?',
              service: 'shop/service',
              serviceDetail:
                'shop/service/:id/:title/:readonly?/:contractorId?/:priceId?',
            },
          },
          HistoryNavigator: {
            screens: {
              orders: 'history/orders',
              payments: 'history/payments',
              reception: 'history/reception',
              orderDetail: 'history/order/:id',
              WithdrawDetail: 'history/withdraw/:id',
              DepositDetail: 'history/deposit/:id',
              transaction: 'history/transactions',
            },
          },
          Paymentresult: 'payment/result',
        },
      },
    },
  },
};

export default linking;
