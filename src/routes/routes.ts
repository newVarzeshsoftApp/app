import {AllOrganizationQuery} from '../services/models/requestQueries';
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
  },
  organization: {
    getAllOrganization: (query: AllOrganizationQuery) =>
      'organization' + prepareQuery(query),
    getOrganizationBySKU: (sku: string) => `organization/by-sku/${sku}`,
    getOrganizationByID: (id: number) => `organization/by-sku/${id}`,
  },
};
