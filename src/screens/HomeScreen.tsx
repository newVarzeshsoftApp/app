import React, {useEffect} from 'react';
import {View, Text, TouchableOpacity, Button} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../App';
import {useTranslation} from 'react-i18next';
import {switchLanguage} from '../utils/helpers/languageUtils';
import {useTheme} from '../utils/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({navigation}) => {
  const {t, i18n} = useTranslation('translation', {keyPrefix: 'Global'});
  const {theme, switchTheme, toggleTheme} = useTheme();
  return (
    <View className="flex-1 items-center justify-center bg-neutral-0 dark:bg-neutral-dark-0">
      <Text className="text-2xl font-bold mb-5 text-text-base dark:text-text-base-dark">
        {t('Home Screen')}
      </Text>
      <TouchableOpacity
        className="bg-secondary-400 py-3 px-6 rounded-lg mt-5 shadow-lg"
        onPress={() => navigation.navigate('Details')}>
        <Text className="text-white text-base  font-yekan">
          Go to Detail Page
        </Text>
      </TouchableOpacity>
      <View className="flex flex-row w-full justify-center items-center mt-6 gap-4">
        <TouchableOpacity
          className="bg-neutral-1000 dark:bg-neutral-dark-1000 py-3 px-6 rounded-lg mt-5 shadow-lg disabled:opacity-20"
          onPress={() => switchLanguage('en')}
          disabled={i18n.resolvedLanguage === 'en'}>
          <Text className="text-text-error   font-semibold">{t('en')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => switchLanguage('fa')}
          className="bg-neutral-1000 dark:bg-neutral-dark-1000 py-3 px-6 rounded-lg mt-5 shadow-lg disabled:opacity-20"
          disabled={i18n.resolvedLanguage === 'fa'}>
          <Text className="text-text-error text-base font-semibold">
            {t('fa')}
          </Text>
        </TouchableOpacity>
      </View>
      <View className="flex flex-row w-full justify-center items-center mt-6 gap-4">
        <TouchableOpacity
          className="bg-primary-700 dark:bg-primary-dark-700  py-3 px-6 rounded-lg mt-5 shadow-lg disabled:opacity-20"
          onPress={() => toggleTheme()}>
          <Text className="text-text-base  font-semibold">
            Toggle Theme Curent {theme}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;
