import React, {useCallback, useRef} from 'react';
import {Dimensions, Text, TouchableOpacity, View} from 'react-native';
import BaseText from '../../../components/BaseText';
import {SaleOrderContent} from '../../../services/models/response/UseResrService';
import {useTranslation} from 'react-i18next';
import moment from 'jalali-moment';
import {formatNumber} from '../../../utils/helpers/helpers';
import BaseButton from '../../../components/Button/BaseButton';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {OrderStackParamList} from '../../../utils/types/NavigationTypes';
import BottomSheet from '../../../components/BottomSheet/BottomSheet';
import Badge from '../../../components/Badge/Badge';
interface OrderCardProps {
  item: SaleOrderContent;
  navigation: NativeStackNavigationProp<OrderStackParamList, 'orders'>;
  openSheet: (data: any) => void;
}
const OrderCard: React.FC<OrderCardProps> = ({item, navigation, openSheet}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'History'});

  return (
    <>
      <View className="CardBase">
        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <BaseText type="body3" color="secondary">
              {t('orderNumber')}: {''}
            </BaseText>
            <BaseText type="body3" color="base">
              {item.id}
            </BaseText>
          </View>
          <View className="flex-row items-center justify-between ">
            <BaseText type="body3" color="secondary">
              {t('DateAndTime')}: {''}
            </BaseText>
            <BaseText type="body3" color="base">
              {moment(item.submitAt).format('jYYYY/jMM/jDD HH:MM')}
            </BaseText>
          </View>
          {item.userOrderLocker && (
            <View className="flex-row items-center justify-between ">
              <BaseText type="body3" color="secondary">
                {t('Closet')}: {''}
              </BaseText>
              <BaseText type="body3" color="base">
                {item.userOrderLocker}
              </BaseText>
            </View>
          )}
          <View className="flex-row items-center justify-between ">
            <BaseText type="body3" color="secondary">
              {t('Total amount')}: {''}
            </BaseText>
            <BaseText type="body3" color="base">
              {formatNumber(item.totalAmount)} ﷼
            </BaseText>
          </View>
          {(item?.totalAmount ?? 0) - (item?.settleAmount ?? 0) === 0 ? null : (
            <View className="flex-row items-center justify-between ">
              <BaseText type="body3" color="secondary">
                {t('Debt')}: {''}
              </BaseText>
              <BaseText type="body3" color="base">
                {formatNumber(
                  (item?.totalAmount ?? 0) - (item?.settleAmount ?? 0),
                )}{' '}
                ﷼
              </BaseText>
            </View>
          )}
          {/* به صحفه جزیات اتقال یابد  */}
          {item.transferType && (
            <View className="flex-row items-center justify-between ">
              <BaseText type="body3" color="secondary">
                {t('Shipping details')}: {''}
              </BaseText>
              <TouchableOpacity onPress={() => openSheet(item.end)}>
                <BaseText type="body3" color="secondaryPurple">
                  {t('view')}
                </BaseText>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View className="flex-row gap-2">
          <BaseButton
            onPress={() => navigation.navigate('orderDetail', {id: item.id})}
            LinkButton
            color="Black"
            type="TextButton"
            text={t('details')}
            Extraclass=" !flex-1 "
          />
        </View>
      </View>
    </>
  );
};

export default OrderCard;
