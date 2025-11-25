import {
  AdvertisementQuery,
  AllOrganizationQuery,
  CategoryQuery,
  GatewayLogQuery,
  IntroductionMethodQuery,
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
  admin: {
    login: () => 'admin/login',
    logout: () => 'admin/logout',
    profile: () => 'admin/profile',
    refresh: () => 'admin/refresh',
  },
  organization: {
    getAllOrganization: (query: AllOrganizationQuery) =>
      'organization' + prepareQuery(query),
    getOrganizationBySKU: () => `organization/by-sku`,
    getOrganizationByID: (id: number) => `organization/${id}`,
    createOrganization: () => 'organization',
    updateOrganization: (id: number) => `organization/${id}`,
  },
  product: {
    getProductPage: (query: ProductQuery) =>
      `product/page` + prepareQuery(query),
    getProductQuery: (query: ProductQuery) =>
      `product/query` + prepareQuery(query),
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
    getUserPaymentById: (id: number) => `user/payment/${id}`,
    getUserVipLocker: () => 'user/vip/locker',
    getIntroductionMethod: (query: IntroductionMethodQuery) =>
      `user/introduction-method` + prepareQuery(query),
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
    getGatewayPage: () => `gateway/page`,
    getGatewayQuery: () => `gateway/query`,
  },
  gatewayLog: {
    getGatewayLog: (query: GatewayLogQuery) =>
      `gateway-log` + prepareQuery(query),
  },
  Payment: {
    createPayment: () => `payment/intial`,
    paymentVerify: () => `payment/verify`,
    paymentVerifySubmitOrder: () => `payment/verify/submit-order`,
  },
  media: {
    getAppMedia: (name: string) => 'media/app/' + name,
    getMedia: (name: string) => 'media/' + name,
    uploadMedia: () => 'media/upload',
  },
  advertisement: {
    getAdvertisement: (query: AdvertisementQuery) =>
      `advertisement` + prepareQuery(query),
    createAdvertisement: () => 'advertisement/create',
  },
  walletGift: {
    getWalletGift: (query: AdvertisementQuery) =>
      `wallet/gift/query` + prepareQuery(query),
  },
  introductionMethod: {
    getAll: (query: IntroductionMethodQuery) =>
      `introduction-method` + prepareQuery(query),
    getPage: (query: IntroductionMethodQuery) =>
      `introduction-method/page` + prepareQuery(query),
    getQuery: (query: IntroductionMethodQuery) =>
      `introduction-method/query` + prepareQuery(query),
  },
  survey: {
    getUnanswered: () => 'survey/unanswered',
    getById: (id: number) => `survey/${id}`,
    submitAnswers: () => 'survey/answers/submit',
  },
  config: {
    getConfigs: () => 'config',
    createConfig: () => 'config',
  },
};
