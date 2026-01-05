// Multilang support
import {HambergerMenu, Shop, MessageQuestion} from 'iconsax-react-native';
import en from '../../translations/en.json';
import fa from '../../translations/fa.json';
import {MenuItem} from '../models/props';
export type PickerOption = {
  key: string;
  value: string;
};
export const resources = {
  en: {translation: en},
  fa: {translation: fa},
};

export const Config = {
  OTPLength: 5,
  CountDownTimer: 120,
};

export const genders: PickerOption[] = [
  {key: '0', value: 'مرد'},
  {key: '1', value: 'زن'},
];

export const limit = 5;
export const menuItems: MenuItem[] = [
  {
    title: 'shop',
    slug: 'ShopNavigator',
    Icon: Shop,
    children: [
      {title: 'creditService', slug: 'creditService'},
      {title: 'Service', slug: 'service'},
      {title: 'package', slug: 'packageService'},
    ],
  },
  {
    title: 'history',
    slug: 'HistoryNavigator',
    Icon: HambergerMenu,
    children: [
      {title: 'receptions', slug: 'reception'},
      {title: 'transactions', slug: 'transaction'},
      {title: 'orders', slug: 'orders'},
      {title: 'payments', slug: 'payments'},
    ],
  },
  {
    title: 'survey',
    slug: 'SurveyNavigator',
    Icon: MessageQuestion,
    children: [{title: 'surveyList', slug: 'SurveyList'}],
  },
];
export enum TransactionSourceType {
  UserCredit, // کیف پول
  Bank, // بانک
  CashDesk, // صندوق
  ChargingService, // خدمت شارژی
  WalletGift, // هدیه شارژ کیف پول
  Loan, // وام
  Cheque, // چک
  OfferedDiscount, // تخفیف هدف مند
  Archived, // بایگانی شده
  Transfer, // انتقالی
  Reserve, // رزور
}
export enum ProductType {
  Product,
  Service,
  Credit,
  Package,
}
export enum TransactionType {
  Deposit,
  Settle,
  Withdraw,
}
export enum RegisteredServiceStatus {
  opened,
  ReturnFromSale,
  notSettled,
  archived,
}
export enum PaymentStatus {
  Pending,
  Ok,
  Nok,
  Reject,
}

export enum DayType {
  ALL,
  EVEN,
  ODD,
  OTHER,
}

export enum TimeRanges {
  ALL,
  AM,
  PM,
  MIXED,
}
// const receptionAmount = (item.totalAmount || 0) + (item.discount || 0);
//               const normalOrderAmount = item.normalSaleOrder
//                 ?.map((value: SaleOrder) => (value.totalAmount || 0) + (value.discount || 0))
//                 .reduce((a: any, b: any) => +a + b, 0);
//               return (receptionAmount ?? 0) + (normalOrderAmount ?? 0);

export const ColorRingConfig = {
  red: {
    progress: '#fd504f',
    unfilled: 'rgba(254, 201, 203, 0.3)',
    TextColor: 'error',
  },
  orange: {
    progress: '#ff9134',
    unfilled: 'rgba(255, 221, 192, 0.3)',
    TextColor: 'warning',
  },
  green: {
    progress: '#37c976',
    unfilled: 'rgba(193, 238, 213, 0.3)',
    TextColor: 'success',
  },
};
