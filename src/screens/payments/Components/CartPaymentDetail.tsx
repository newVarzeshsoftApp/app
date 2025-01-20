import React from 'react';
import {Text, View} from 'react-native';
import BaseText from '../../../components/BaseText';
import {formatNumber} from '../../../utils/helpers/helpers';
import {useTranslation} from 'react-i18next';
import BaseButton from '../../../components/Button/BaseButton';
import moment from 'jalali-moment';
import {paymentVerifySubmitOrderRes} from '../../../services/models/response/PaymentResService';
type CartPaymentDetailProps = {
  PaymentData: paymentVerifySubmitOrderRes;
  isSuccses: boolean;
  navigation: any;
};
const CartPaymentDetail: React.FC<CartPaymentDetailProps> = ({
  PaymentData,
  isSuccses,
  navigation,
}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'payment'});

  return (
    <View className="gap-7">
      <View className="gap-2 justify-center items-center">
        <BaseText type="title4" color={isSuccses ? 'success' : 'error'}>
          {isSuccses ? t(`paymentSuccses`) : t('paymnetFaild')}
        </BaseText>
      </View>
      <View className="gap-2">
        <View className="flex-row items-center justify-between ">
          <BaseText type="body3" color="secondary">
            {t('Transaction number')}: {''}
          </BaseText>
          <BaseButton
            onPress={() =>
              navigation.navigate('HistoryNavigator', {
                screen: 'DepositDetail',
                params: {id: PaymentData?.verifyResponse.orderId},
              })
            }
            size="Small"
            type="Outline"
            color="Supportive5-Blue"
            text={(PaymentData?.verifyResponse?.orderId ?? '').toString()}
            LinkButton
            rounded
          />
        </View>
        <View className="flex-row items-center justify-between ">
          <BaseText type="body3" color="secondary">
            {t('Tracking number')}: {''}
          </BaseText>
          <View>
            <BaseText type="body3" color="base">
              {PaymentData.verifyResponse.refId}
              {PaymentData.verifyResponse.code &&
                `(${PaymentData.verifyResponse.code})`}
            </BaseText>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CartPaymentDetail;
