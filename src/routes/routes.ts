import {get} from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import {
  AdvertisementQuery,
  AllOrganizationQuery,
  CategoryQuery,
  ProductQuery,
  UserPaymentQuey,
  UserSaleItemQuey,
  UserTransactionQuery,
  UserWalletTransactionQuery,
} from '../services/models/requestQueries';
import {prepareQuery} from '../utils/helpers/helpers';

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
    refresh: () => 'auth/refresh',
  },
  organization: {
    getAllOrganization: (query: AllOrganizationQuery) =>
      'organization' + prepareQuery(query),
    getOrganizationBySKU: () => `organization/by-sku`,
    getOrganizationByID: (id: number) => `organization/by-sku/${id}`,
  },
  product: {
    getProductPage: (query: ProductQuery) =>
      `product/page` + prepareQuery(query),
    getProductQuery: () => `product/query`,
    getProductByID: (id: number) => `product/${id}`,
  },

  category: {
    categoryPage: (query: CategoryQuery) =>
      `category/page` + prepareQuery(query),
    categoryQuery: (query: CategoryQuery) =>
      `category/query` + prepareQuery(query),
  },

  user: {
    getUserCredit: () => `user/credit`,
    getUserDashboard: () => `user/dashbord`,
    getUserSaleItem: (query: UserSaleItemQuey) =>
      `user/sale-item` + prepareQuery(query),
    getSaleItemByID: (id: number) => `user/sale-item/${id}`,
    getUserSessionByID: (id: number) => `user/sessions/${id}`,
    getUserChargingServiceByID: (id: number) =>
      `user/charging-service/sessions/${id}`,
    getUserSaleOrder: (query: UserSaleItemQuey) =>
      `user/sale-order` + prepareQuery(query),
    getUserSaleOrderByID: (id: number) => `user/sale-order/${id}`,
    getUserTransaction: (query: UserTransactionQuery) =>
      `user/transaction` + prepareQuery(query),
    getUserWalletTransaction: (query: UserWalletTransactionQuery) =>
      `user/wallet` + prepareQuery(query),
    getUserTransactionById: (id: number) => `user/transaction/${id}`,
    getUserPayment: (query: UserPaymentQuey) =>
      `user/payments` + prepareQuery(query),
    updateProfile: () => 'user/update-profile',
    updatePassword: () => 'user/update-password',
    uploadAvatar: () => 'user/upload-avatar',
  },
  operational: {
    saleOrder: () => `sale-order`,
  },
  manageLocker: {
    openLocker: () => `locker/open-locker`,
  },
  gateway: {
    getGateway: () => `gateway`,
  },
  Payment: {
    createPayment: () => `payment/intial`,
    paymentVerify: () => `payment/verify`,
    paymentVerifySubmitOrder: () => `payment/verify/submit-order`,
  },
  media: {
    getAppMedia: (name: string) => 'media/app/' + name,
    getMedia: (name: string) => 'media/' + name,
  },
  advertisement: {
    getAdvertisement: (query: AdvertisementQuery) =>
      `advertisement` + prepareQuery(query),
  },
  walletGift: {
    getWalletGift: (query: AdvertisementQuery) =>
      `wallet/gift/query` + prepareQuery(query),
  },
};
