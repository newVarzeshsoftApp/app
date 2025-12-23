//This component is for Payment From Wallet or Credit
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {ActivityIndicator, Image, Text, View} from 'react-native';
import {DrawerStackParamList} from '../../utils/types/NavigationTypes';
import {useTranslation} from 'react-i18next';
import {ScrollView} from 'react-native-gesture-handler';
import {TickCircle} from 'iconsax-react-native';
import BaseText from '../../components/BaseText';
import {formatNumber} from '../../utils/helpers/helpers';
import moment from 'jalali-moment';
import BaseButton from '../../components/Button/BaseButton';
import {useGetPaymentResult} from '../../utils/hooks/Operational/useGetPaymentResult';
import {TransactionSourceType} from '../../constants/options';
import Badge from '../../components/Badge/Badge';
import {navigate} from '../../navigation/navigationRef';
type PaymentScreenProps = NativeStackScreenProps<
  DrawerStackParamList,
  'PaymentDetail'
>;
const PaymentDetail: React.FC<PaymentScreenProps> = ({navigation, route}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'payment'});

  // Always use new endpoint: order/payment/result?id.in=
  const idParam = route.params.id;

  const {data, isLoading} = useGetPaymentResult(idParam);
  if (isLoading && !data) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#bcdd64" />
      </View>
    );
  }
  return (
    <>
      {data && (
        <View className="flex-1">
          <ScrollView contentContainerStyle={{flexGrow: 1}} style={{flex: 1}}>
            <View className="items-centex justify-between Container pb-6 flex-1">
              <View></View>
              <View className="CardBase w-full relative pt-11 ">
                <>
                  {/* Status View */}
                  <View
                    className={`absolute -top-[20px] web:-top-[20px]  z-20 left-1/2 transform web:-translate-x-1/2 w-[44px] h-[44px] bg-success-100/70 dark:bg-success-dark-100/70
                      items-center justify-center rounded-full shadow `}>
                    <TickCircle size="24" color="#37C976" variant="Bold" />
                  </View>
                  <View className="w-full h-full absolute top-0 left-0 rounded-3xl">
                    <View className="relative overflow-hidden w-full h-full flex-1">
                      <View
                        className={`absolute -top-[70px] web:-top-[70px]  z-20 left-1/2 transform web:-translate-x-1/2 w-full h-[200px] items-center justify-center rounded-full `}>
                        <Image
                          source={require('../../assets/images/shade/shape/SucsessPaymantShape.png')}
                          style={{width: '100%', height: '100%'}}
                        />
                      </View>
                      <View className="absolute -bottom-[150px] web:-bottom-[130px] opacity-50 rotate-180   z-20 left-1/2 transform web:-translate-x-1/2 w-full h-[200px] items-center justify-center rounded-full ">
                        <Image
                          source={require('../../assets/images/shade/shape/SucsessPaymantShape.png')}
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
                        {formatNumber(data?.totalAmount)}
                      </BaseText>
                      <BaseText type="title4" color="secondary">
                        ﷼
                      </BaseText>
                    </View>
                    <BaseText type="title4" color={'success'}>
                      {t(`paymentSuccses`)}
                    </BaseText>
                  </View>
                  <View className="gap-2">
                    <View className="flex-row items-center justify-between ">
                      <BaseText type="body3" color="secondary">
                        {t('Status')}: {''}
                      </BaseText>
                      <BaseText type="body3" color={'success'}>
                        {t('Succses')}
                      </BaseText>
                    </View>
                    <View className="flex-row items-center justify-between ">
                      <BaseText type="body3" color="secondary">
                        {t('DateAndTime')}: {''}
                      </BaseText>
                      <BaseText type="body3" color="base">
                        {moment(data?.submitAt).format('jYYYY/jMM/jDD HH:mm')}
                      </BaseText>
                    </View>

                    {/* Map orders */}
                    {data.orders && data.orders.length > 0 && (
                      <View className="gap-2">
                        <BaseText type="body3" color="secondary">
                          {t('orderNumber')}: {''}
                        </BaseText>
                        <View className="flex-row flex-wrap gap-2 items-center justify-end">
                          {data.orders.map((orderId, index) => (
                            <BaseButton
                              key={index}
                              onPress={() =>
                                navigate('Root', {
                                  screen: 'HistoryNavigator',
                                  params: {
                                    screen: 'orderDetail',
                                    params: {id: orderId},
                                  },
                                })
                              }
                              size="Small"
                              type="Outline"
                              color="Supportive5-Blue"
                              text={orderId.toString()}
                              LinkButton
                              rounded
                            />
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Map transactions */}
                    {data.transactions && data.transactions.length > 0 && (
                      <View className="gap-2 ">
                        <BaseText type="body3" color="secondary">
                          {t('Transaction number')}: {''}
                        </BaseText>
                        <View className="flex-row flex-wrap gap-2 items-center justify-end">
                          {data.transactions.map((transactionId, index) => (
                            <BaseButton
                              key={index}
                              onPress={() =>
                                navigate('Root', {
                                  screen: 'HistoryNavigator',
                                  params: {
                                    screen: 'WithdrawDetail',
                                    params: {id: transactionId},
                                  },
                                })
                              }
                              size="Small"
                              type="Outline"
                              color="Supportive5-Blue"
                              text={transactionId.toString()}
                              LinkButton
                              rounded
                            />
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Source */}
                    <View className="flex-row items-center justify-between ">
                      <BaseText type="body3" color="secondary">
                        {t('Source')}: {''}
                      </BaseText>
                      <View className="flex-row gap-1 items-center">
                        <BaseText type="body3" color="base">
                          {t(`${TransactionSourceType[data?.sourceType ?? 0]}`)}
                        </BaseText>
                        {[
                          'OfferedDiscount',
                          'WalletGift',
                          'ChargingService',
                          'Loan',
                        ].includes(
                          TransactionSourceType[data?.sourceType ?? 0],
                        ) ? (
                          <Badge
                            color="primary"
                            textColor="supportive5"
                            CreditMode={['ChargingService'].includes(
                              TransactionSourceType[data?.sourceType ?? 0],
                            )}
                            defaultMode
                            value={data?.title ?? ''}
                          />
                        ) : null}
                      </View>
                    </View>

                    {/* Amount */}
                    <View className="flex-row items-center justify-between ">
                      <BaseText type="body3" color="secondary">
                        {t('Amount')}: {''}
                      </BaseText>
                      <View className="flex-row gap-1">
                        <BaseText type="body3" color="base">
                          {formatNumber(data?.totalAmount || 0)}
                        </BaseText>
                        <BaseText type="body3" color="base">
                          ﷼
                        </BaseText>
                      </View>
                    </View>

                    {/* Source residue */}
                    {data.remainCredit && (
                      <View className="flex-row items-center justify-between ">
                        <BaseText type="body3" color="secondary">
                          {t('Source residue')}: {''}
                        </BaseText>
                        <BaseText type="body3" color="base">
                          {formatNumber(Number(data.remainCredit))} ریال
                        </BaseText>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              <View className="gap-2">
                <BaseButton
                  onPress={() => {
                    navigate('Root', {
                      screen: 'HomeNavigator',
                      params: {
                        screen: 'Home',
                      },
                    });
                  }}
                  type={'Fill'}
                  color="Black"
                  size="Large"
                  text={t('BackToHome')}
                  rounded
                />
              </View>
            </View>
          </ScrollView>
        </View>
      )}
    </>
  );
};

export default PaymentDetail;
