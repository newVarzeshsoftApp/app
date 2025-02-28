import React from 'react';
import {View} from 'react-native';
import BaseText from '../../../components/BaseText';
import {useTranslation} from 'react-i18next';
import BaseButton from '../../../components/Button/BaseButton';
import {SaleOrderByIDRes} from '../../../services/models/response/UseResrService';
import moment from 'jalali-moment';
import Badge from '../../../components/Badge/Badge';
import {formatNumber} from '../../../utils/helpers/helpers';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {OrderStackParamList} from '../../../utils/types/NavigationTypes';
import {navigate} from '../../../navigation/navigationRef';
type OrderDetailProps = {
  item: SaleOrderByIDRes;
  isReseption?: boolean;
};
type NavigationProps = NativeStackNavigationProp<
  OrderStackParamList,
  'orderDetail'
>;

const OrderDetailCard: React.FC<OrderDetailProps> = ({item, isReseption}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'History'});
  return (
    <View className="CardBase">
      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <BaseText type="body3" color="secondary">
            {t(isReseption ? 'receptionsNumber' : 'orderNumber')}: {''}
          </BaseText>
          <BaseText type="body3" color="base">
            {item.id}
          </BaseText>
        </View>
        {!isReseption ? (
          <>
            <View className="flex-row items-center justify-between ">
              <BaseText type="body3" color="secondary">
                {t('DateAndTime')}: {''}
              </BaseText>
              <BaseText type="body3" color="base">
                {moment(item.createdAt).format('jYYYY/jMM/jDD HH:MM')}
              </BaseText>
            </View>
            <View className="flex-row items-center justify-between ">
              <BaseText type="body3" color="secondary">
                {t('receptionsNumber')}: {''}
              </BaseText>
              <BaseButton
                size="Small"
                onPress={() =>
                  navigate('Root', {
                    screen: 'HistoryNavigator',
                    params: {
                      screen: 'orderDetail',
                      params: {id: Number(item.saleOrderReceptionId ?? 0)},
                    },
                  })
                }
                type="Outline"
                color="Supportive5-Blue"
                LinkButton
                text={item.saleOrderReceptionId}
                rounded
              />
            </View>
          </>
        ) : (
          <>
            <View className="flex-row items-center justify-between ">
              <BaseText type="body3" color="secondary">
                {t('date')}: {''}
              </BaseText>
              <BaseText type="body3" color="base">
                {moment(item.createdAt).format('jYYYY/jMM/jDD')}
              </BaseText>
            </View>
            <View className="flex-row items-center justify-between ">
              <BaseText type="body3" color="secondary">
                {t('Start and end time')}: {''}
              </BaseText>
              <View className="flex-row gap-2 items-center">
                {item.start && (
                  <BaseText type="body3" color="base">
                    {moment(item.start).format('HH:DD')}
                  </BaseText>
                )}
                {item.end && (
                  <BaseText type="body3" color="base">
                    {moment(item.end).format('HH:DD')}
                  </BaseText>
                )}
              </View>
            </View>
          </>
        )}
        <View className="flex-row items-center justify-between ">
          <BaseText type="body3" color="secondary">
            {t('Closet')}: {''}
          </BaseText>
          {isReseption ? (
            <View className="gap-1 flex-row flex-wrap">
              {item.vipLockerId && (
                <View className="flex-row gap-2  items-center">
                  <BaseText type="subtitle2" color="secondaryPurple">
                    VIP
                  </BaseText>
                  <Badge
                    defaultMode
                    className="w-fit"
                    textColor="secondaryPurple"
                    value={item?.vipLockerId}
                  />
                </View>
              )}
              {item.lockers && (
                <View className="flex flex-row gap-1">
                  {item.lockers.map((item, index) => (
                    <Badge
                      key={index}
                      className="w-fit"
                      defaultMode
                      textColor="secondary"
                      value={item?.locker ?? ''}
                    />
                  ))}
                </View>
              )}
              {!item.vipLockerId && item.lockers?.length === 0 && (
                <BaseText type="subtitle3" color="muted">
                  {t('without Closet')}
                </BaseText>
              )}
            </View>
          ) : (
            <View className="gap-1 flex-row flex-wrap">
              {item.userOrderLocker ? (
                <Badge
                  className="w-fit"
                  defaultMode
                  textColor="secondary"
                  value={item.userOrderLocker ?? ''}
                />
              ) : (
                <BaseText type="subtitle3" color="muted">
                  {t('without Closet')}
                </BaseText>
              )}
            </View>
          )}
        </View>
        <View className="flex-row items-center justify-between ">
          <BaseText type="body3" color="secondary">
            {t('Total amount')}: {''}
          </BaseText>
          <BaseText type="body3" color="base">
            {formatNumber((item.totalAmount ?? 0) + (item.discount ?? 0))} ﷼
          </BaseText>
        </View>
        <View className="flex-row items-center justify-between ">
          <BaseText type="body3" color="secondary">
            {t('Total Discount')}: {''}
          </BaseText>
          <BaseText type="body3" color="base">
            {formatNumber(item.discount)} ﷼
          </BaseText>
        </View>
        <View className="flex-row items-center justify-between ">
          <BaseText type="body3" color="secondary">
            {t('Added value')}: {''}
          </BaseText>
          <BaseText type="body3" color="base">
            {formatNumber(item.tax)} ﷼
          </BaseText>
        </View>
        <View className="flex-row items-center justify-between ">
          <BaseText type="body3" color="secondary">
            {t('Payable')}: {''}
          </BaseText>
          <BaseText type="body3" color="base">
            {/*  */}
            {/* {formatNumber(
              (item?.totalAmount ?? 0) -
                (item.discount ?? 0) +
                (item?.tax ?? 0),
            )}{' '} */}
            {formatNumber(item.totalAmount)}﷼
          </BaseText>
        </View>
        <View className="flex-row items-center justify-between ">
          <BaseText type="body3" color="secondary">
            {t('Debt')}: {''}
          </BaseText>
          <BaseText type="body3" color="base">
            {formatNumber((item?.totalAmount ?? 0) - (item?.settleAmount ?? 0))}{' '}
            ﷼
          </BaseText>
        </View>
      </View>
    </View>
  );
};

export default OrderDetailCard;
