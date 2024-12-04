// Multilang support
import {HambergerMenu, Shop} from 'iconsax-react-native';
import en from '../../translations/en.json';
import fa from '../../translations/fa.json';
import {MenuItem} from '../models/props';

export const resources = {
  en: {translation: en},
  fa: {translation: fa},
};

export const Config = {
  OTPLength: 5,
  CountDownTimer: 120,
};

export const menuItems: MenuItem[] = [
  {
    title: 'shop',
    slug: 'Shop',
    Icon: Shop,
    children: [
      {title: 'creditService', slug: 'creditService'},
      {title: 'Service', slug: 'service'},
      {title: 'package', slug: 'packageService'},
    ],
  },
  {
    title: 'history',
    slug: 'History',
    Icon: HambergerMenu,
    children: [
      {title: 'receptions', slug: 'reception'},
      {title: 'transactions', slug: 'transaction'},
      {title: 'orders', slug: 'orders'},
      {title: 'payments', slug: 'payments'},
    ],
  },
];
