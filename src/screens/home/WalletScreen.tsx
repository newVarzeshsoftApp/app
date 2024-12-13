import React from 'react';
import {FlatList, Image, Platform, Text, View} from 'react-native';
import {useGetUserCredit} from '../../utils/hooks/User/useUserCredit';
import BaseText from '../../components/BaseText';
import {formatNumber} from '../../utils/helpers/helpers';
import {BlurView} from '@react-native-community/blur';
import {useTranslation} from 'react-i18next';
import BaseButton from '../../components/Button/BaseButton';
import WalletTransaction from './components/WalletTransaction';

const WalletScreen: React.FC = () => {
  const {data, isLoading} = useGetUserCredit();
  const {t} = useTranslation('translation', {keyPrefix: 'Wallet'});
  const renderHeader = () => (
    <View className="Container py-5 web:pt-[85px] gap-5">
      <View className="CardBase h-[180px] justify-center items-center relative overflow-hidden">
        <View className="flex-row  items-center gap-1 z-10">
          <BaseText type="title1" color="base">
            {formatNumber(data?.result ?? 0)}
          </BaseText>
          <BaseText type="title4" color="secondary">
            ﷼
          </BaseText>
        </View>
        <View className="z-10">
          <BaseText type="subtitle2" color="secondary">
            {t('WalletCredit')}
          </BaseText>
        </View>
        <View className="z-10">
          <BaseButton
            type="Fill"
            size="Large"
            rounded
            color="Black"
            text={t('Wallet Recharge')}
          />
        </View>
        <View className="absolute  w-full -bottom-10 left-1  h-full web:opacity-80 blur-xl -z-1">
          <Image
            source={require('../../assets/images/shade/shape/WalletShade.png')}
            style={{width: '100%', height: '100%'}}
          />
        </View>
        {Platform.OS !== 'web' && (
          <BlurView
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              zIndex: 0,
            }}
            blurType="prominent"
            blurAmount={1}
            reducedTransparencyFallbackColor="white"
          />
        )}
      </View>
    </View>
  );
  return (
    <FlatList
      data={[]}
      renderItem={null}
      nestedScrollEnabled
      keyExtractor={(item, index) => index.toString()}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={
        <View className="flex-1 pb-32  Container  web:pb-[200px]">
          <WalletTransaction />
        </View>
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

export default WalletScreen;
