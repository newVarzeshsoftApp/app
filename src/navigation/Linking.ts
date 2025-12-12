import {LinkingOptions} from '@react-navigation/native';
import {RootStackParamList} from '../utils/types/NavigationTypes';

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [
    'http://localhost:3000',
    'https://localhost:3000',
    'http://185.126.10.3:3000',
    'https://185.126.10.3:3000',
  ],
  config: {
    screens: {
      notFound: '*',
      Auth: {
        path: 'auth',
        screens: {
          Login: 'login',
          Signup: 'signup',
          ForgetPassword: 'forget-password',
          OTP: {
            path: 'otp/:username/:resetPassword?/:LoginWithOTP?',
            parse: {
              username: (username: string) => decodeURIComponent(username),
              resetPassword: (val: string) => val === 'true',
              LoginWithOTP: (val: string) => val === 'true',
            },
            stringify: {
              username: (username: string) => encodeURIComponent(username),
              resetPassword: (val: boolean) => (val ? 'true' : ''),
              LoginWithOTP: (val: boolean) => (val ? 'true' : ''),
            },
          },
          ResetPassword: 'reset-password',
          LoginWithOTP: 'login-with-otp',
        },
      },
      Root: {
        screens: {
          HomeNavigator: {
            path: '',
            screens: {
              Home: '',
              saleItem: 'sale-items',
              reserve: 'reserve',
              reserveDetail: {
                path: 'reserve/detail',
                parse: {
                  tagId: Number,
                  patternId: (val: string) => (val ? Number(val) : undefined),
                  saleUnit: (val: string) => (val ? Number(val) : undefined),
                },
              },
              cart: 'cart',
              myServices: 'my-services',
              wallet: {
                path: 'wallet',
                screens: {
                  wallet: '',
                  ChargeWalletScreen: 'charge',
                },
              },
            },
          },
          SaleItemNavigator: {
            path: 'sale-item',
            screens: {
              saleItem: '',
              saleItemDetail: {
                path: ':id/:title',
                parse: {
                  id: Number,
                  title: (title: string) => decodeURIComponent(title),
                },
                stringify: {
                  title: (title: string) => encodeURIComponent(title),
                },
              },
            },
          },
          ShopNavigator: {
            path: 'shop',
            screens: {
              creditService: 'credit',
              creditDetail: {
                path: 'credit/:id/:title/:readonly?/:contractorId?/:priceId?',
                parse: {
                  id: Number,
                  title: (title: string) => decodeURIComponent(title),
                  readonly: (val: string) => val === 'true',
                  contractorId: (val: string) =>
                    val ? Number(val) : undefined,
                  priceId: (val: string) => (val ? Number(val) : undefined),
                },
                stringify: {
                  title: (title: string) => encodeURIComponent(title),
                  readonly: (val: boolean) => (val ? 'true' : ''),
                },
              },
              packageService: 'package',
              packageDetail: {
                path: 'package/:id/:title/:readonly?/:contractorId?/:priceId?',
                parse: {
                  id: Number,
                  title: (title: string) => decodeURIComponent(title),
                  readonly: (val: string) => val === 'true',
                  contractorId: (val: string) =>
                    val ? Number(val) : undefined,
                  priceId: (val: string) => (val ? Number(val) : undefined),
                },
                stringify: {
                  title: (title: string) => encodeURIComponent(title),
                  readonly: (val: boolean) => (val ? 'true' : ''),
                },
              },
              service: 'service',
              serviceDetail: {
                path: 'service/:id/:title/:readonly?/:contractorId?/:priceId?',
                parse: {
                  id: Number,
                  title: (title: string) => decodeURIComponent(title),
                  readonly: (val: string) => val === 'true',
                  contractorId: (val: string) =>
                    val ? Number(val) : undefined,
                  priceId: (val: string) => (val ? Number(val) : undefined),
                },
                stringify: {
                  title: (title: string) => encodeURIComponent(title),
                  readonly: (val: boolean) => (val ? 'true' : ''),
                },
              },
            },
          },
          HistoryNavigator: {
            path: 'history',
            screens: {
              orders: 'orders',
              payments: 'payments',
              reception: 'reception',
              transaction: 'transactions',
              orderDetail: {
                path: 'order/:id',
                parse: {id: Number},
              },
              WithdrawDetail: {
                path: 'withdraw/:id',
                parse: {id: Number},
              },
              DepositDetail: {
                path: 'deposit/:id',
                parse: {id: Number},
              },
            },
          },
          SurveyNavigator: {
            path: 'survey',
            screens: {
              SurveyList: '',
              SurveyDetail: {
                path: ':id/:title?',
                parse: {
                  id: Number,
                  title: (title: string) =>
                    title ? decodeURIComponent(title) : undefined,
                },
                stringify: {
                  title: (title: string) =>
                    title ? encodeURIComponent(title) : '',
                },
              },
            },
          },
          ProfileTab: {
            path: 'profile',
            screens: {
              PersonalInfo: 'info',
              Security: 'security',
            },
          },
          Paymentresult: {
            path: 'payment/result',
            parse: {
              Status: (status: string) => status as 'OK' | 'NOK',
              isDeposite: (val: string) => val,
            },
          },
          PaymentDetail: {
            path: 'payment/:id',
            parse: {id: (id: string) => id},
          },
          WebViewParamsList: {
            path: 'webview',
            parse: {
              url: (url: string) => decodeURIComponent(url),
            },
            stringify: {
              url: (url: string) => encodeURIComponent(url),
            },
          },
        },
      },
    },
  },
};

export default linking;
