import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import {resources} from './src/constants/options';

i18n.use(initReactI18next).init({
  resources,
  lng: 'fa', // default language
  fallbackLng: 'fa',
  // debug: true,
  interpolation: {escapeValue: false},
});

export default i18n;
