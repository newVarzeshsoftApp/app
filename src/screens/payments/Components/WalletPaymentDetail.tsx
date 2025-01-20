import React from 'react';
import {Text, View} from 'react-native';
import {PaymentVerifyRes} from '../../../services/models/response/PaymentResService';
import BaseText from '../../../components/BaseText';
import {formatNumber} from '../../../utils/helpers/helpers';
import {useTranslation} from 'react-i18next';
import BaseButton from '../../../components/Button/BaseButton';
import moment from 'jalali-moment';
type WalletPaymentDetail = {
  PaymentData: PaymentVerifyRes;
  isSuccses: boolean;
  navigation: any;
};
const WalletPaymentDetail: React.FC<WalletPaymentDetail> = ({
  PaymentData,
  isSuccses,
  navigation,
}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'payment'});

  return (
    <View className="gap-7">
      <View className="gap-2 justify-center items-center">
        <View className="flex-row gap-1 items-center justify-center ">
          <BaseText type="title2" color="base">
            {formatNumber(PaymentData?.amount)}
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
          <BaseText type="body3" color={isSuccses ? 'success' : 'error'}>
            {t(isSuccses ? 'Succses' : 'faild')}
          </BaseText>
        </View>
        <View className="flex-row items-center justify-between ">
          <BaseText type="body3" color="secondary">
            {t('DateAndTime')}: {''}
          </BaseText>
          <BaseText type="body3" color="base">
            {moment(PaymentData?.createdAt).format('jYYYY/jMM/jDD HH:mm')}
          </BaseText>
        </View>
        <View className="flex-row items-center justify-between ">
          <BaseText type="body3" color="secondary">
            {t('Payment ID')}: {''}
          </BaseText>
          <BaseText type="body3" color="base">
            {PaymentData.id.toString()}
          </BaseText>
        </View>
        <View className="flex-row items-center justify-between ">
          <BaseText type="body3" color="secondary">
            {t('Transaction number')}: {''}
          </BaseText>
          <BaseButton
            onPress={() =>
              navigation.navigate('HistoryNavigator', {
                screen: 'DepositDetail',
                params: {id: PaymentData?.transaction.id},
              })
            }
            size="Small"
            type="Outline"
            color="Supportive5-Blue"
            text={PaymentData.transaction.id.toString()}
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
              {formatNumber(PaymentData?.amount)}
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
          <BaseText type="body3" color="base">
            {PaymentData.gateway.title}
          </BaseText>
        </View>
        <View className="flex-row items-center justify-between ">
          <BaseText type="body3" color="secondary">
            {t('Tracking number')}: {''}
          </BaseText>
          <View>
            <BaseText type="body3" color="base">
              {PaymentData.refId} {PaymentData.code && `(${PaymentData.code})`}
            </BaseText>
          </View>
        </View>
      </View>
    </View>
  );
};

export default WalletPaymentDetail;
