import React from 'react';
import {Text, View} from 'react-native';
import {useTheme} from '../../../utils/ThemeContext';
import {useTranslation} from 'react-i18next';
import {ProfileTick} from 'iconsax-react-native';
import BaseText from '../../BaseText';

function MembershipInfo() {
  const {theme} = useTheme();
  const {t} = useTranslation('translation', {keyPrefix: 'Home'});

  return (
    <View className="dark:bg-neutral-dark-300/80 bg-neutral-0/80 border w-full h-[125px] p-4 rounded-3xl  border-neutral-0 dark:border-neutral-dark-400/40">
      <View className="flex-row gap-3 items-center">
        <View className="w-[44px] h-[44px] rounded-full dark:bg-neutral-dark-100 justify-center items-center">
          <ProfileTick
            size="20"
            color={theme === 'dark' ? '#FFFFFF' : '#16181B'}
            variant="Bold"
          />
        </View>
        <BaseText type="title4">{t('Membership')}</BaseText>
      </View>
    </View>
  );
}

export default MembershipInfo;
