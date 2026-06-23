import {LinkingOptions} from '@react-navigation/native';
import {DayType, TimeRanges} from '../constants/options';
import {RootStackParamList} from '../utils/types/NavigationTypes';

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [
    'http://localhost:3000',
    'https://localhost:3000',
    'http://localhost:3200',
    'https://localhost:3200',
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
              reserve: {
                path: 'reserve',
                initialRouteName: 'reserve',
                screens: {
                  reserve: '',
                  reserveDetail: {
                    path: 'detail',
                    parse: {
                      tagId: Number,
                      patternId: (val: string) =>
                        val ? Number(val) : undefined,
                      saleUnit: (val: string) =>
                        val ? Number(val) : undefined,
                    },
                  },
                },
              },
              groupClassRoom: {
                path: 'groupClassRoom',
                initialRouteName: 'groupClassRoom',
                screens: {
                  groupClassRoom: '',
                  groupClassRoomList: {
                    path: 'list',
                    parse: {
                      dayType: (value: string) => value as DayType,
                      timeRange: (value: string) => value as TimeRanges,
                      contractor: (value: string) => value,
                      organizationUnit: (value: string) => value,
                      service: (value: string) => value,
                    },
                    stringify: {
                      dayType: (value: DayType) => value,
                      timeRange: (value: TimeRanges) => value,
                      contractor: (value: string) => value,
                      organizationUnit: (value: string) => value,
                      service: (value: string) => value,
                    },
                  },
                  groupClassRoomDetail: {
                    path: 'detail',
                    parse: {
                      groupClassRoomId: Number,
                      contractorId: Number,
                      waitingList: (value: string) => value === 'true',
                      dayType: (value: string) => value as DayType,
                      timeRange: (value: string) => value as TimeRanges,
                      contractor: (value: string) => value,
                      organizationUnit: (value: string) => value,
                      service: (value: string) => value,
                      title: (value: string) => decodeURIComponent(value),
                    },
                    stringify: {
                      waitingList: (value?: boolean) =>
                        value ? 'true' : undefined,
                      title: (value?: string) =>
                        value ? encodeURIComponent(value) : undefined,
                    },
                  },
                },
              },
              cart: 'cart',
              myServices: 'my-services',
              wallet: {
                path: 'wallet',
                initialRouteName: 'wallet',
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
