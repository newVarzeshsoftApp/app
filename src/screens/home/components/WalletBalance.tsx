import React from 'react';
import {Image, Platform, TouchableOpacity, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {useTheme} from '../../../utils/ThemeContext';
import BaseText from '../../../components/BaseText';
import {useTranslation} from 'react-i18next';
import {useGetUserCredit} from '../../../utils/hooks/User/useUserCredit';
import {formatNumber} from '../../../utils/helpers/helpers';
import {useNavigation} from '@react-navigation/native';

import {HomeStackParamList} from '../../../utils/types/NavigationTypes';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
type NavigationProps = NativeStackNavigationProp<HomeStackParamList>;
function WalletBalance({
  inWallet,
  NoCredit,
}: {
  inWallet?: boolean;
  NoCredit?: boolean;
}) {
  const navigation = useNavigation<NavigationProps>();

  const {t} = useTranslation('translation', {keyPrefix: 'Home'});
  const {data, isLoading} = useGetUserCredit();
  const {theme} = useTheme();

  const colors =
    theme === 'dark'
      ? ['#5454A9', '#2A2D33', '#5454A9']
      : ['#A3A3F4', '#FFFFFF', '#A3A3F4'];
  const Walletcolors =
    theme === 'dark'
      ? ['rgba(55, 201, 118, 0.5)', '#2A2D33', 'rgba(55, 201, 118, 0.5)']
      : ['rgba(55, 201, 118, 0.5)', '#FFFFFF', 'rgba(55, 201, 118, 0.5)'];
  const Redcolors =
    theme === 'dark'
      ? ['rgba(253, 80, 79, 0.5)', '#2A2D33', 'rgba(253, 80, 79, 0.5)']
      : ['rgba(253, 80, 79, 0.5)', '#FFFFFF', 'rgba(253, 80, 79, 0.5)'];
  return (
    <TouchableOpacity
      disabled={inWallet}
      //@ts-ignore
      onPress={() => navigation.navigate('wallet', {screen: 'wallet'})}
      className="w-full h-[110px] relative ">
      <LinearGradient
        colors={NoCredit ? Redcolors : inWallet ? Walletcolors : colors}
        start={Platform.OS === 'web' ? {x: 1, y: 1} : {x: 1, y: -1}}
        locations={[0.2, 1, 1]}
        style={{
          flex: 1,
          borderRadius: 24,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View className="flex-1 p-[2px] w-full h-full relative z-10 overflow-hidden ">
          <View className=" flex-1 w-full justify-between items-center web:pr-8 ios:pl-8 android:pl-8 flex-row overflow-hidden h-full dark:bg-neutral-dark-300/80 bg-neutral-0/80 rounded-3xl">
            {/* First Shade  */}
            {inWallet ? null : (
              <>
                <View className="w-[200px] h-[200px] z-[1] top-[-95px]  web:-right-[15%]  right-[80%] -rotate-12 absolute opacity-50  ">
                  <Image
                    source={require('../../../assets/images/shade/shape/SecondaryShade.png')}
                    resizeMode="contain"
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                  />
                </View>
                <View className="w-[200px] h-[200px] z-[1] bottom-[-85px] web:-left-[6%]  left-[64%] absolute rotate-180 opacity-35 ">
                  <Image
                    source={require('../../../assets/images/shade/shape/SecondaryShade.png')}
                    resizeMode="contain"
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                  />
                </View>
              </>
            )}
            <View className="gap-3">
              <BaseText type="subtitle3" color="secondary">
                {t('WalletBalance')}
              </BaseText>
              <View className="flex-row  items-center gap-1">
                <BaseText type="title1" color="base">
                  {formatNumber(data?.result ?? 0)}
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
    </TouchableOpacity>
  );
}

export default WalletBalance;
