import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {Image, Text, View} from 'react-native';
import {
  DrawerStackParamList,
  OrderStackParamList,
} from '../../utils/types/NavigationTypes';
import {ScrollView} from 'react-native-gesture-handler';
import {useTranslation} from 'react-i18next';
import {CloseCircle, TickCircle} from 'iconsax-react-native';
import BaseText from '../../components/BaseText';
import {formatNumber} from '../../utils/helpers/helpers';
import BaseButton from '../../components/Button/BaseButton';
type PaymentScreenProps = NativeStackScreenProps<
  DrawerStackParamList,
  'PaymentResult'
>;
const PaymentScreen: React.FC<PaymentScreenProps> = ({navigation, route}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'payment'});
  const isSuccses = route.params.status === 0;
  return (
    <View className="flex-1">
      <ScrollView contentContainerStyle={{flexGrow: 1}} style={{flex: 1}}>
        <View className="items-centex justify-between Container pb-6 flex-1">
          <View></View>
          <View className="h-[400px] CardBase w-full relative pt-11 ">
            <>
              {/* Status View */}
              <View
                className={`absolute -top-[20px] web:-top-[20px]  z-20 left-1/2 transform web:-translate-x-1/2 w-[44px] h-[44px] ${
                  isSuccses
                    ? 'bg-success-100/70 dark:bg-success-dark-100/70'
                    : 'bg-error-100/80 dark:bg-error-dark-100/80'
                } items-center justify-center rounded-full shadow `}>
                {isSuccses ? (
                  <TickCircle size="24" color="#37C976" variant="Bold" />
                ) : (
                  <CloseCircle size="24" color="#FD504F" variant="Bold" />
                )}
              </View>
              <View className="w-full h-full absolute top-0 left-0 rounded-3xl">
                <View className="relative overflow-hidden w-full h-full flex-1">
                  <View
                    className={`absolute -top-[70px] web:-top-[70px]  z-20 left-1/2 transform web:-translate-x-1/2 w-full h-[200px] items-center justify-center rounded-full `}>
                    <Image
                      source={
                        isSuccses
                          ? require('../../assets/images/shade/shape/SucsessPaymantShape.png')
                          : require('../../assets/images/shade/shape/RedPaymentShape.png')
                      }
                      style={{width: '100%', height: '100%'}}
                    />
                  </View>
                  <View className="absolute -bottom-[150px] web:-bottom-[130px] opacity-50 rotate-180   z-20 left-1/2 transform web:-translate-x-1/2 w-full h-[200px] items-center justify-center rounded-full ">
                    <Image
                      source={
                        isSuccses
                          ? require('../../assets/images/shade/shape/SucsessPaymantShape.png')
                          : require('../../assets/images/shade/shape/RedPaymentShape.png')
                      }
                      style={{width: '100%', height: '100%'}}
                    />
                  </View>
                </View>
              </View>
            </>
            {/* Content */}
            <View className="gap-7">
              <View className="gap-2 justify-center items-center">
                <View className="flex-row gap-1 items-center justify-center ">
                  <BaseText type="title2" color="base">
                    {formatNumber(400000000)}
                  </BaseText>
                  <BaseText type="title4" color="secondary">
                    ﷼
                  </BaseText>
                </View>
                <BaseText type="title4" color={isSuccses ? 'success' : 'error'}>
                  {isSuccses ? t(`paymentSuccses`) : t('paymnetFaild')}
                </BaseText>
              </View>
              <View className="gap-2">
                <View className="flex-row items-center justify-between ">
                  <BaseText type="body3" color="secondary">
                    {t('Status')}: {''}
                  </BaseText>
                  <BaseText
                    type="body3"
                    color={isSuccses ? 'success' : 'error'}>
                    {t(isSuccses ? 'Succses' : 'faild')}
                  </BaseText>
                </View>
                <View className="flex-row items-center justify-between ">
                  <BaseText type="body3" color="secondary">
                    {t('DateAndTime')}: {''}
                  </BaseText>
                  <BaseText type="body3" color="base">
                    1403.7.11
                  </BaseText>
                </View>
                <View className="flex-row items-center justify-between ">
                  <BaseText type="body3" color="secondary">
                    {t('Transaction number')}: {''}
                  </BaseText>
                  <BaseText type="body3" color="base">
                    1403.7.11
                  </BaseText>
                </View>
                <View className="flex-row items-center justify-between ">
                  <BaseText type="body3" color="secondary">
                    {t('Payment ID')}: {''}
                  </BaseText>
                  <BaseButton
                    size="Small"
                    type="Outline"
                    color="Supportive5-Blue"
                    text={'545454'}
                    LinkButton
                    rounded
                  />
                </View>
                <View className="flex-row items-center justify-between ">
                  <BaseText type="body3" color="secondary">
                    {t('Amount')}: {''}
                  </BaseText>
                  <View className="flex-row gap-1">
                    <BaseText type="body3" color="base">
                      {formatNumber(4000000)}
                    </BaseText>
                    <BaseText type="body3" color="base">
                      ﷼
                    </BaseText>
                  </View>
                </View>
                <View className="flex-row items-center justify-between ">
                  <BaseText type="body3" color="secondary">
                    {t('Payment gateway')}: {''}
                  </BaseText>
                  <View>
                    <BaseText type="body3" color="base">
                      زرین پال
                    </BaseText>
                  </View>
                </View>
                <View className="flex-row items-center justify-between ">
                  <BaseText type="body3" color="secondary">
                    {t('Tracking number')}: {''}
                  </BaseText>
                  <View>
                    <BaseText type="body3" color="base">
                      35554545
                    </BaseText>
                  </View>
                </View>
              </View>
            </View>
          </View>
          <View className="gap-2">
            {!isSuccses && (
              <BaseButton
                type={'Fill'}
                color="Black"
                size="Large"
                text={t('Retry')}
                rounded
              />
            )}
            <BaseButton
              type={isSuccses ? 'Fill' : 'Outline'}
              color="Black"
              size="Large"
              text={t('BackToWallet')}
              rounded
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default PaymentScreen;
