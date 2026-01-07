import React, {useMemo} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {SaleOrderContent} from '../../../services/models/response/UseResrService';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {OrderStackParamList} from '../../../utils/types/NavigationTypes';
import {useTranslation} from 'react-i18next';
import BaseText from '../../../components/BaseText';
import moment from 'jalali-moment';
import {formatNumber} from '../../../utils/helpers/helpers';
import BaseButton from '../../../components/Button/BaseButton';
import Badge from '../../../components/Badge/Badge';
import {navigate} from '../../../navigation/navigationRef';
interface OrderCardProps {
  item: SaleOrderContent;
}
const ReceptionCard: React.FC<OrderCardProps> = ({item}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'History'});
  const Titles = useMemo(() => {
    return item?.items?.map((item, index) => item.title).join(', ');
  }, [item?.items]);
  return (
    <View className="CardBase">
      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <BaseText type="body3" color="secondary">
            {t('receptionsNumber')}: {''}
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
            {moment(item.submitAt).format('jYYYY/jMM/jDD')}
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
        <View className="flex-row items-center justify-between ">
          <BaseText type="body3" color="secondary" className="text-nowrap">
            {t('serviceName')}: {''}
          </BaseText>
          <BaseText
            type="body3"
            color="base"
            className=" truncate max-w-[70%]  text-left  flex-1">
            {Titles}
          </BaseText>
        </View>

        <View className="flex-row items-center justify-between ">
          <BaseText type="body3" color="secondary">
            {t('Closet')}: {''}
          </BaseText>
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
        </View>
        <View className="flex-row items-center justify-between ">
          <BaseText type="body3" color="secondary">
            {t('Total amount')}: {''}
          </BaseText>
          <BaseText type="body3" color="base">
            {formatNumber(item.totalAmount)} ﷼
          </BaseText>
        </View>
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
  );
};

export default ReceptionCard;
