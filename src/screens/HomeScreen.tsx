import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, Button, Pressable} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../App';
import {useTranslation} from 'react-i18next';
import {switchLanguage} from '../utils/helpers/languageUtils';
import {useTheme} from '../utils/ThemeContext';
import BaseText from '../components/BaseText';
import BaseButton from '../components/Button/BaseButton';
import {Home} from 'iconsax-react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({navigation}) => {
  const {t, i18n} = useTranslation('translation', {keyPrefix: 'Global'});
  const {theme, toggleTheme} = useTheme();
  const [isPressed, setIsPressed] = useState(false);

  return (
    <View className="flex-1 items-center justify-center  dark:bg-neutral-dark-0 bg-neutral-0">
      <BaseText>{t('Home Screen')}</BaseText>
      {/* <Text className="en_title1 text-text-active">{t('Home Screen')}</Text> */}
      <TouchableOpacity
        className="bg-secondary-400 py-3 px-6 rounded-lg mt-5 shadow-lg"
        onPress={() => navigation.navigate('Details')}>
        <Text className="text-white text-base  font-yekan">
          Go to Detail Page
        </Text>
      </TouchableOpacity>
      <View className="flex flex-row w-full justify-center items-center mt-6 gap-4">
        <BaseButton
          text={t('en')}
          onPress={() => switchLanguage('en')}
          disabled={i18n.resolvedLanguage === 'en'}
          size="Large"
          color="Success"
          type="Outline"
          rounded
        />
        <BaseButton
          text={t('fa')}
          onPress={() => switchLanguage('fa')}
          disabled={i18n.resolvedLanguage === 'fa'}
          size="Large"
          color="Success"
          type="Outline"
          rounded
        />
      </View>
      <View className="flex px-3     flex-row w-full justify-center items-center mt-6 gap-4">
        <BaseButton
          onPress={toggleTheme}
          type="Tonal"
          color="Black"
          LeftIconVariant="Bold"
          size="Small"
          LeftIcon={Home}
          text="Toggle"
        />
        <BaseButton
          onPress={toggleTheme}
          type="Tonal"
          color="Black"
          LeftIconVariant="Bold"
          LeftIcon={Home}
          text="Theme"
        />
        <BaseButton
          onPress={toggleTheme}
          type="Outline"
          color="Black"
          LeftIconVariant="Bold"
          LeftIcon={Home}
          text="Curent"
        />
      </View>
      <View className="flex px-3     flex-row w-full justify-center items-center mt-6 gap-4">
        <BaseButton
          onPress={toggleTheme}
          type="Fill"
          color="Primary"
          LeftIconVariant="Bold"
          LeftIcon={Home}
          text="Toggle"
          isLoading
        />
        <BaseButton
          onPress={toggleTheme}
          type="Tonal"
          color="Primary"
          LeftIconVariant="Bold"
          LeftIcon={Home}
          text="Theme"
        />
        <BaseButton
          onPress={toggleTheme}
          type="Outline"
          color="Primary"
          LeftIconVariant="Bold"
          LeftIcon={Home}
          text="Curent"
        />
      </View>
      <View className="flex px-3     flex-row w-full justify-center items-center mt-6 gap-4">
        <BaseButton
          onPress={toggleTheme}
          type="Fill"
          color="Success"
          LeftIconVariant="Bold"
          LeftIcon={Home}
          text="Toggle"
        />
        <BaseButton
          onPress={toggleTheme}
          type="Tonal"
          color="Success"
          LeftIconVariant="Bold"
          LeftIcon={Home}
          text="Theme"
        />
        <BaseButton
          onPress={toggleTheme}
          type="Outline"
          color="Success"
          LeftIconVariant="Bold"
          LeftIcon={Home}
          text="Curent"
        />
      </View>
      <View className="flex px-3     flex-row w-full justify-center items-center mt-6 gap-4">
        <BaseButton
          onPress={toggleTheme}
          type="TextButton"
          color="Primary"
          LeftIconVariant="Bold"
          LeftIcon={Home}
          text="Toggle"
        />
        <BaseButton
          onPress={toggleTheme}
          type="TextButton"
          color="Black"
          LeftIconVariant="Bold"
          LeftIcon={Home}
          text="Theme"
        />
        <BaseButton
          onPress={toggleTheme}
          type="TextButton"
          color="Success"
          LeftIconVariant="Bold"
          LeftIcon={Home}
          text="Curent"
        />
      </View>
    </View>
  );
};

export default HomeScreen;
