import {
  AllOrganizationQuery,
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
    updatePassword: () => 'auth/chawnge-password',
    profile: () => 'auth/profile',
    logout: () => 'auth/logout',
    refresh: () => 'auth/refresh',
  },
  organization: {
    getAllOrganization: (query: AllOrganizationQuery) =>
      'organization' + prepareQuery(query),
    getOrganizationBySKU: (sku: string) => `organization/by-sku/${sku}`,
    getOrganizationByID: (id: number) => `organization/by-sku/${id}`,
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
  },
  gateway: {
    getGateway: () => `gateway`,
  },
  Payment: {
    createPayment: () => `payment/intial`,
    paymentVerify: () => `payment/verify`,
  },
};
