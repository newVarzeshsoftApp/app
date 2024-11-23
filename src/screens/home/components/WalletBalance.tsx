import React from 'react';
import {Image, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {useTheme} from '../../../utils/ThemeContext';
import BaseText from '../../../components/BaseText';
import {useTranslation} from 'react-i18next';

function WalletBalance() {
  const {t} = useTranslation('translation', {keyPrefix: 'Home'});

  const {theme} = useTheme();
  const colors =
    theme === 'dark'
      ? ['#5454A9', '#2A2D33', '#5454A9']
      : ['#A3A3F4', '#FFFFFF', '#A3A3F4'];
  return (
    <View className="w-full h-[110px] ">
      <LinearGradient
        colors={colors}
        start={{x: 1, y: -1}}
        locations={[0.2, 1, 1]}
        style={{
          flex: 1,
          borderRadius: 24,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View className="flex-1 p-[2px] w-full h-full relative z-10 overflow-hidden ">
          <View className=" flex-1 w-full justify-between items-center px-8 flex-row h-full dark:bg-neutral-dark-300/80 bg-neutral-0/80 rounded-3xl">
            <View className="gap-3">
              <BaseText type="subtitle3" color="secondary">
                {t('WalletBalance')}
              </BaseText>
              <View className="flex-row  items-center gap-1">
                <BaseText type="title1" color="base">
                  40.880.000
                </BaseText>
                <BaseText type="title4" color="secondary">
                  {t('rial')}
                </BaseText>
              </View>
            </View>
            <View className="w-[100px] h-[100px]">
              <Image
                className="w-full h-full"
                source={require('../../../assets/images/wallet.png')}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

export default WalletBalance;
