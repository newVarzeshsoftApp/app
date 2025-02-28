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
import BottomSheet, {
  BottomSheetMethods,
} from '../../../components/BottomSheet/BottomSheet';
import Badge from '../../../components/Badge/Badge';
import {navigate} from '../../../navigation/navigationRef';
interface OrderCardProps {
  item: SaleOrderContent;
}
const OrderCard: React.FC<OrderCardProps> = ({item}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'History'});
  const sheetRef = useRef<BottomSheetMethods>(null);
  const {height} = Dimensions.get('screen');

  const openSheet = useCallback(() => {
    sheetRef.current?.expand();
  }, []);
  return (
    <>
      <BottomSheet
        ref={sheetRef}
        snapPoints={[40]}
        Title={t('Shipping details')}>
        <View className="gap-4">
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <BaseText type="body3" color="secondary">
                {t('Type')}: {''}
              </BaseText>
              <BaseText type="body3" color="base">
                ارسالی
              </BaseText>
            </View>
            <View className="flex-row items-center justify-between">
              <BaseText type="body3" color="secondary">
                {t('Status')}: {''}
              </BaseText>
              <BaseText type="body3" color="base">
                <Badge value={'لغو شده'} color="error" />
              </BaseText>
            </View>
            <View className="flex-row items-center justify-between">
              <BaseText type="body3" color="secondary">
                {t('Sending amount')}: {''}
              </BaseText>
              <BaseText type="body3" color="base">
                {formatNumber(609990)}﷼
              </BaseText>
            </View>
          </View>
          <View className="items-start gap-3 pt-3 border-t dark:border-neutral-dark-300 border-neutral-200  ">
            <BaseText type="body3" color="secondary">
              {t('Address')}: {''}
            </BaseText>
            <BaseText type="body3" color="base">
              تهران،انقلاب؛کارگر جنوبی،خ لبافی نژاد،خ فخر رازی،ساختمان
              نرگس،پلاک40
            </BaseText>
          </View>
        </View>
      </BottomSheet>
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
              <TouchableOpacity onPress={openSheet}>
                <BaseText type="body3" color="secondaryPurple">
                  {t('view')}
                </BaseText>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View className="flex-row gap-2">
          <BaseButton
            onPress={() =>
              navigate('Root', {
                screen: 'HistoryNavigator',
                params: {screen: 'orderDetail', params: {id: item.id}},
              })
            }
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
