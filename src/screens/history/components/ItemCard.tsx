import React from 'react';
import {Text, View} from 'react-native';
import BaseText from '../../../components/BaseText';
import {useTranslation} from 'react-i18next';
import {SaleOrderItem} from '../../../services/models/response/UseResrService';
import {formatNumber} from '../../../utils/helpers/helpers';
import ContractorInfo from '../../../components/ContractorInfo/ContractorInfo';
type ItemCardProps = {
  item: SaleOrderItem;
};

const ItemCard: React.FC<ItemCardProps> = ({item}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'History'});
  const tax =
    (((item?.amount ?? 0) * (item?.quantity ?? 0) - (item?.discount ?? 0)) *
      (item?.tax ?? 0)) /
    100;
  const Total =
    (item?.amount ?? 0) * (item?.quantity ?? 0) - (item?.discount ?? 0);
  return (
    <View className="CardBase flex-1">
      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <BaseText type="body3" color="secondary">
            {t('Name')}: {''}
          </BaseText>
          <BaseText type="body3" color="base">
            {item.product?.title}
          </BaseText>
        </View>
        <View className="flex-row items-center justify-between ">
          <BaseText type="body3" color="secondary">
            {t('Contractor')}: {''}
          </BaseText>
          {item.contractor ? (
            <ContractorInfo
              firstName={item.contractor?.firstName}
              imageName={item?.contractor?.profile?.name}
              lastName={item.contractor?.lastName}
            />
          ) : (
            <BaseText type="body3" color="base">
              -
            </BaseText>
          )}
        </View>
        {(item?.credit ?? 0) > 0 && (
          <View className="flex-row items-center justify-between ">
            <BaseText type="body3" color="secondary">
              {t('Credit')}: {''}
            </BaseText>
            <BaseText type="body3" color="base">
              {item.credit}
            </BaseText>
          </View>
        )}
        <View className="flex-row items-center justify-between ">
          <BaseText type="body3" color="secondary">
            {t('Number')}: {''}
          </BaseText>
          <BaseText type="body3" color="base">
            {item.quantity}
          </BaseText>
        </View>
        <View className="flex-row items-center justify-between ">
          <BaseText type="body3" color="secondary">
            {t('Amount')}: {''}
          </BaseText>
          <BaseText type="body3" color="base">
            {formatNumber(item.amount)} ریال
          </BaseText>
        </View>
        <View className="flex-row items-center justify-between ">
          <BaseText type="body3" color="secondary">
            {t('Total Discount')}: {''}
          </BaseText>
          <BaseText type="body3" color="base">
            {formatNumber(item.discount)} ریال
          </BaseText>
        </View>
        <View className="flex-row items-center justify-between ">
          <BaseText type="body3" color="secondary">
            {t('Added value')}: {''}
          </BaseText>
          <BaseText type="body3" color="base">
            {formatNumber(tax)} ریال
          </BaseText>
        </View>
        <View className="flex-row items-center justify-between ">
          <BaseText type="body3" color="secondary">
            {t('Total amount')}: {''}
          </BaseText>
          <BaseText type="body3" color="base">
            {formatNumber(Total + tax)} ریال
          </BaseText>
        </View>
      </View>
    </View>
  );
};

export default ItemCard;
