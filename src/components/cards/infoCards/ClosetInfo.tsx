import React from 'react';
import {Text, View} from 'react-native';
import {useTheme} from '../../../utils/ThemeContext';
import {useTranslation} from 'react-i18next';
import Closet from '../../../assets/icons/Closet.svg';
import BaseText from '../../BaseText';

function ClosetInfo() {
  const {theme} = useTheme();
  const {t} = useTranslation('translation', {keyPrefix: 'Home'});

  return (
    <View className="dark:bg-neutral-dark-300/80 bg-neutral-0/80 border w-full h-[125px] p-4 rounded-3xl  border-neutral-0 dark:border-neutral-dark-400/40">
      <View className="flex-row gap-3 items-center">
        <View className="w-[44px] h-[44px] rounded-full dark:bg-neutral-dark-100 justify-center items-center">
          <Closet
            width={20}
            height={20}
            stroke={theme === 'dark' ? '#FFFFFF' : '#16181B'}
          />
        </View>
        <BaseText type="title4">{t('Closet')}</BaseText>
      </View>
    </View>
  );
}

export default ClosetInfo;
