import {
  DrawerStackParamList,
  HomeStackParamList,
  OrderStackParamList,
  ProfileTabParamsList,
  RootStackParamList,
  SaleItemStackParamList,
  ShopStackParamList,
  WalletStackParamList,
} from '../utils/types/NavigationTypes';

export const AppRoutes = {
  // Root Stack
  ROOT: () => ({screen: 'Root' as keyof RootStackParamList}),
  AUTH: () => ({screen: 'Auth' as keyof RootStackParamList}),
  NOT_FOUND: () => ({screen: 'notFound' as keyof RootStackParamList}),

  // SaleItem Navigator
  SALE_ITEM: () => ({screen: 'saleItem' as keyof SaleItemStackParamList}),
  SALE_ITEM_DETAIL: (id: number, title: string) => ({
    screen: 'saleItemDetail' as keyof SaleItemStackParamList,
    params: {id, title},
  }),

  // Home Navigator
  HOME: () => ({screen: 'HomeNavigator' as keyof DrawerStackParamList}),
  HOME_SCREEN: () => ({screen: 'Home' as keyof HomeStackParamList}),
  MY_SERVICES: () => ({screen: 'myServices' as keyof HomeStackParamList}),
  TICKET: () => ({screen: 'ticket' as keyof HomeStackParamList}),
  CART: () => ({screen: 'cart' as keyof HomeStackParamList}),

  // Shop Navigator
  SHOP: () => ({screen: 'ShopNavigator' as keyof DrawerStackParamList}),
  CREDIT_SERVICE: () => ({screen: 'creditService' as keyof ShopStackParamList}),
  PACKAGE_SERVICE: () => ({
    screen: 'packageService' as keyof ShopStackParamList,
  }),
  SERVICE: () => ({screen: 'service' as keyof ShopStackParamList}),

  // Shop Details
  CREDIT_DETAIL: (id: number, title: string) => ({
    screen: 'creditDetail' as keyof ShopStackParamList,
    params: {id, title},
  }),
  PACKAGE_DETAIL: (id: number, title: string) => ({
    screen: 'packageDetail' as keyof ShopStackParamList,
    params: {id, title},
  }),
  SERVICE_DETAIL: (id: number, title: string) => ({
    screen: 'serviceDetail' as keyof ShopStackParamList,
    params: {id, title},
  }),

  // Profile Navigator
  PROFILE_TAB: () => ({screen: 'ProfileTab' as keyof DrawerStackParamList}),
  PERSONAL_INFO: () => ({screen: 'PersonalInfo' as keyof ProfileTabParamsList}),
  SECURITY: () => ({screen: 'Security' as keyof ProfileTabParamsList}),

  // Order & History Navigator
  HISTORY: () => ({screen: 'HistoryNavigator' as keyof DrawerStackParamList}),
  ORDERS: () => ({screen: 'orders' as keyof OrderStackParamList}),
  ORDER_DETAIL: (id: number) => ({
    screen: 'orderDetail' as keyof OrderStackParamList,
    params: {id},
  }),
  PAYMENTS: () => ({screen: 'payments' as keyof OrderStackParamList}),
  TRANSACTION: () => ({screen: 'transaction' as keyof OrderStackParamList}),
  RECEPTION: () => ({screen: 'reception' as keyof OrderStackParamList}),

  // Wallet Navigator
  WALLET: () => ({screen: 'wallet' as keyof WalletStackParamList}),
  CHARGE_WALLET: () => ({
    screen: 'ChargeWalletScreen' as keyof WalletStackParamList,
  }),

  // Payment Screens
  PAYMENT_RESULT: (
    code: string,
    type: string,
    Authority: string,
    Status: 'OK' | 'NOK',
    refId: string,
    isDeposit?: boolean,
  ) => ({
    screen: 'Paymentresult' as keyof DrawerStackParamList,
    params: {code, type, Authority, Status, refId, isDeposit},
  }),
  PAYMENT_DETAIL: (id: string) => ({
    screen: 'PaymentDetail' as keyof DrawerStackParamList,
    params: {id},
  }),

  // WebView
  WEBVIEW: (url: string) => ({
    screen: 'WebViewParamsList' as keyof DrawerStackParamList,
    params: {url},
  }),
};
