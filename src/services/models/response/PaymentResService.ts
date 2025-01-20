import {SaleOrderItem} from '../request/OperationalReqService';
import {GetGatewayRes} from './GetwayResService';
import {Gateway} from './UseResrService';

export interface PaymentRes {
  url: string;
  success: Boolean;
}
export interface DTO {
  authority: string;
  current: Customer;
  isonlineShop: boolean;
}

export interface Customer {
  id: number;
  profile: string | null;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string | null;
  phone: string | null;
  birthDate: string | null;
  nationCode: string | null;
  address: string | null;
  disabledDescription: string;
  authorizedDebtor: boolean;
  maxDeptAmount: string;
  gender: number;
  password: string;
  credit: number;
  totalCost: string;
  rate: number;
  isLegal: boolean;
  resetToken: string | null;
  resetTime: string | null; // ISO date string
  resetNumberRequest: number;
  forceChangePassword: boolean;
  refreshToken: string | null;
  lastLoggedIn: string | null; // ISO date string
  activityField: string;
  updatedAt: string; // ISO date string
  createdAt: string; // ISO date string
  deletedAt: string | null; // ISO date string
  birthDay: number | null;
  birthMonth: number | null;
  roles: string[];
  status: number;
  insuranceExpiredDate: string | null; // ISO date string
  config: Record<string, unknown>; // Generic object
  faceSample: boolean;
  smsClub: boolean;
  passport: string | null;
  workAddress: string | null;
  enFirstName: string | null;
  enLastName: string | null;
  fax: string | null;
  website: string | null;
  instagramId: string | null;
  companyName: string | null;
  companyType: string | null;
  companyRegistrationNumber: string | null;
  companyRegistrationDate: string | null; // ISO date string
  companyNationCode: string | null;
  companyEconomicCode: string | null;
  code: number;
  accessIpAddress: string | null;
  lastEventId: string | null;
  faceSampleCreatedAt: string | null; // ISO date string
  cardSampleCreatedAt: string | null; // ISO date string
  fingerSampleCreatedAt: string | null; // ISO date string
  postalCode: string | null;
  personalTaxCode: string | null;
  hasActivity: boolean;
  parentId: number | null;
}

export interface Transaction {
  type: number;
  description: string | null;
  submitAt: string; // ISO date string
  id: number;
  updatedAt: string; // ISO date string
  createdAt: string; // ISO date string
  deletedAt: string | null; // ISO date string
  sourceType: number;
  source: number;
  title: string;
  amount: string;
  credit: string;
  chargeRemainCredit: string;
  reference: string | null;
  isTransfer: boolean;
  meta: {
    bank: string;
  };
  fiscalYearId: number;
  organizationUnitId: number;
  userId: number;
  orderId: number | null;
  saleUnitId: number;
  gatewayId: number | null;
}

export interface PaymentVerifyRes {
  dto: DTO;
  isDeposit: boolean;
  id: number;
  updatedAt: string; // ISO date string
  createdAt: string; // ISO date string
  deletedAt: string | null; // ISO date string
  startPayment: string; // ISO date string
  endPayment: string; // ISO date string
  receiptDate: string | null; // ISO date string
  expiredAt: string | null; // ISO date string
  amount: number;
  status: number;
  refId: string;
  code: string | null;
  stripeId: string | null;
  gateway: GetGatewayRes;
  traceNo: string | null;
  depositor: string | null;
  ipAddress: string | null;
  agent: string | null;
  data: Record<string, unknown> | null;
  callback: string | null;
  type: number;
  attachment: string | null;
  authority: string;
  cardPan: string;
  cardHash: string;
  fee: number;
  errors: string | null;
  customer: Customer;
  transaction: Transaction;
}

interface VerifyResponse {
  wages: any[];
  code: number;
  message: string;
  cardHash: string;
  cardPan: string;
  refId: number;
  feeType: string;
  fee: number;
  shaparakFee: string;
  orderId: string | null;
  status: number;
}

export interface paymentVerifySubmitOrderRes {
  verifyResponse: VerifyResponse;
  orders: SaleOrderItem[];
}
