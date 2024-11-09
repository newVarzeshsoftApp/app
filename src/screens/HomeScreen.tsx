import React, {useEffect} from 'react';
import {View, Text, TouchableOpacity, Button} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../App';
import {useTranslation} from 'react-i18next';
import {switchLanguage} from '../utils/helpers/languageUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({navigation}) => {
  const {t, i18n} = useTranslation('translation', {keyPrefix: 'Global'});

  return (
    <View className="flex-1 items-center justify-center bg-gray-100">
      <Text className="text-2xl font-bold mb-5">{t('Home Screen')}</Text>
      <TouchableOpacity
        className="bg-blue-500 py-3 px-6 rounded-lg mt-5 shadow-lg"
        onPress={() => navigation.navigate('Details')}>
        <Text className="text-white text-base font-semibold">
          Go to Details
        </Text>
      </TouchableOpacity>
      <View className="flex flex-row w-full justify-center items-center mt-6 gap-4">
        <TouchableOpacity
          className="bg-teal-600 py-3 px-6 rounded-lg mt-5 shadow-lg disabled:opacity-20"
          onPress={() => switchLanguage('en')}
          disabled={i18n.resolvedLanguage === 'en'}>
          <Text className="text-white text-base font-semibold">{t('en')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => switchLanguage('fa')}
          className="bg-teal-600 py-3 px-6 rounded-lg mt-5 shadow-lg disabled:opacity-20"
          disabled={i18n.resolvedLanguage === 'fa'}>
          <Text className="text-white text-base font-semibold">{t('fa')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;
