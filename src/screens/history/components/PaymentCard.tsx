import React from 'react';
import {Text, View} from 'react-native';
import BaseText from '../../../components/BaseText';
import {useTranslation} from 'react-i18next';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {OrderStackParamList} from '../../../utils/types/NavigationTypes';
import {PaymentRecord} from '../../../services/models/response/UseResrService';
import moment from 'jalali-moment';
import {formatNumber} from '../../../utils/helpers/helpers';
import {PaymentStatus} from '../../../constants/options';
import Badge from '../../../components/Badge/Badge';
import BaseButton from '../../../components/Button/BaseButton';
import {navigate} from '../../../navigation/navigationRef';
interface PaymentCardProps {
  item: PaymentRecord;
}
const PaymentCard: React.FC<PaymentCardProps> = ({item}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'History'});
  const isOrder = item.isDeposit === false;
  return (
    <View className="CardBase">
      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <BaseText type="body3" color="secondary">
            {t('Payment ID')}: {''}
          </BaseText>
          <BaseText type="body3" color="base">
            {item.id}
          </BaseText>
        </View>
        <View className="flex-row items-center justify-between ">
          <BaseText type="body3" color="secondary">
            {t('date')}: {''}
          </BaseText>
          <BaseText type="body3" color="base">
            {moment(item.createdAt).isValid()
              ? moment(item.createdAt).format('jYYYY/jMM/jDD')
              : '-'}
          </BaseText>
        </View>
        <View className="flex-row items-center justify-between ">
          <BaseText type="body3" color="secondary">
            {t('endTime')}: {''}
          </BaseText>
          <BaseText type="body3" color="base">
            {moment(item?.endPayment ?? '').isValid()
              ? moment(item?.endPayment ?? '').format(' HH:MM')
              : '-'}
          </BaseText>
        </View>
        <View className="flex-row items-center justify-between ">
          <BaseText type="body3" color="secondary">
            {t('Amount')}: {''}
          </BaseText>
          <BaseText type="body3" color="secondaryPurple">
            {formatNumber(item.amount)} ﷼
          </BaseText>
        </View>
        <View className="flex-row items-center justify-between ">
          <BaseText type="body3" color="secondary">
            {t('gateway')}: {''}
          </BaseText>
          <BaseText type="body3" color="base">
            {item.gateway.title}
          </BaseText>
        </View>
        <View className="flex-row items-center justify-between ">
          <BaseText type="body3" color="secondary">
            {t(isOrder ? 'orderNumber' : 'Transaction number')}: {''}
          </BaseText>
          {item.status === 1 ? (
            isOrder ? (
              item.orders.map((item, index) => {
                return (
                  <BaseButton
                    onPress={() =>
                      navigate('Root', {
                        screen: 'HistoryNavigator',
                        params: {screen: 'orderDetail', params: {id: item.id}},
                      })
                    }
                    LinkButton
                    size="Small"
                    type="Outline"
                    color="Supportive5-Blue"
                    text={item.id.toString()}
                    disabled={!item.id}
                    rounded
                  />
                );
              })
            ) : (
              <BaseButton
                onPress={() =>
                  navigate('Root', {
                    screen: 'HistoryNavigator',
                    params: {
                      screen: 'WithdrawDetail',
                      params: {id: item.transaction?.id ?? 0},
                    },
                  })
                }
                LinkButton
                disabled={!item.transaction?.id}
                size="Small"
                type="Outline"
                color="Supportive5-Blue"
                text={(item.transaction?.id ?? 0).toString()}
                rounded
              />
            )
          ) : (
            <BaseText type="body3" color="base">
              -
            </BaseText>
          )}
        </View>
        <View className="flex-row items-center justify-between ">
          <BaseText type="body3" color="secondary">
            {t('Status')}: {''}
          </BaseText>
          <Badge
            textColor={
              item.status === 0
                ? 'base'
                : item.status === 1
                ? 'success'
                : 'error'
            }
            defaultMode
            value={t(PaymentStatus[item.status])}
          />
          {/* <BaseText type="body3" color="base">
            {PaymentStatus[item.status]}
          </BaseText> */}
        </View>
      </View>
    </View>
  );
};

export default PaymentCard;
