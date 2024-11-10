import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../../../i18n.config';

export const switchLanguage = async (lang: string) => {
  await i18n.changeLanguage(lang);
  await AsyncStorage.setItem('language', lang);
};

export const loadLanguage = async () => {
  const savedLanguage = await AsyncStorage.getItem('language');
  if (savedLanguage) {
    await i18n.changeLanguage(savedLanguage);
  }
};
