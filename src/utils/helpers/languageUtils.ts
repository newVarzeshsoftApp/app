import i18n from '../../../i18n.config';
import {I18nManager, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Utility function to handle storage based on the platform
const setItem = async (key: string, value: string) => {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    localStorage.setItem(key, value);
  } else {
    await AsyncStorage.setItem(key, value);
  }
};

const getItem = async (key: string) => {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    return localStorage.getItem(key);
  } else {
    return await AsyncStorage.getItem(key);
  }
};

// Function to switch language and update RTL/LTR layout
export const switchLanguage = async (lang: string) => {
  await i18n.changeLanguage(lang);
  await setItem('language', lang);

  const isRTL = lang === 'fa';
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.forceRTL(isRTL);
  }
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }
};

// Function to load the saved language preference
export const loadLanguage = async () => {
  const savedLanguage = await getItem('language');
  if (savedLanguage) {
    await switchLanguage(savedLanguage); // This sets RTL/LTR
  }
};
