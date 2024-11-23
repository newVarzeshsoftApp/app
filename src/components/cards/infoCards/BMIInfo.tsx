import React from 'react';
import {useTranslation} from 'react-i18next';
import {Text, View} from 'react-native';
import BMI from '../../../assets/icons/BMI.svg';
import {useTheme} from '../../../utils/ThemeContext';
import BaseText from '../../BaseText';
function BMIInfo() {
  const {theme} = useTheme();
  const {t} = useTranslation('translation', {keyPrefix: 'Home'});

  return (
    <View className="dark:bg-neutral-dark-300/80 bg-neutral-0/80 border w-full h-[125px] p-4 rounded-3xl  border-neutral-0 dark:border-neutral-dark-400/40">
      <View className="flex-row gap-3 items-center">
        <View className="w-[44px] h-[44px] rounded-full dark:bg-neutral-dark-100 justify-center items-center">
          <BMI
            width="20"
            hight="20"
            stroke={theme === 'dark' ? '#FFFFFF' : '#16181B'}
          />
        </View>
        <BaseText type="title4">BMI</BaseText>
      </View>
    </View>
  );
}

export default BMIInfo;
