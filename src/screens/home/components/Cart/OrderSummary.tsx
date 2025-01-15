import React from 'react';
import {View} from 'react-native';
import BaseText from '../../../../components/BaseText';
import {formatNumber} from '../../../../utils/helpers/helpers';

interface OrderSummaryProps {
  totalItems: number;
  totalAmount: number;
  totalDiscount: number;
  totalTax: number;
  totalShopGift: number;
  amountPayable: number;
  t: (key: string) => string;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  totalItems,
  totalAmount,
  totalDiscount,
  totalTax,
  totalShopGift,
  amountPayable,
  t,
}) => (
  <View className="gap-4">
    <BaseText>{t('order Summery')}</BaseText>
    <View className="CardBase">
      <View className="flex-row items-center justify-between">
        <BaseText type="subtitle3" color="secondary">
          {t('Total amount')} ({totalItems}) :
        </BaseText>
        <BaseText type="subtitle3" color="base">
          {formatNumber(totalAmount)} ﷼
        </BaseText>
      </View>
      {totalDiscount > 0 && (
        <View className="flex-row items-center justify-between">
          <BaseText type="subtitle3" color="secondary">
            {t('Discount')} :
          </BaseText>
          <BaseText type="subtitle3" color="base">
            {formatNumber(totalDiscount)} ﷼
          </BaseText>
        </View>
      )}
      {totalTax > 0 && (
        <View className="flex-row items-center justify-between">
          <BaseText type="subtitle3" color="secondary">
            {t('tax')} :
          </BaseText>
          <BaseText type="subtitle3" color="base">
            {formatNumber(totalTax)} ﷼
          </BaseText>
        </View>
      )}
      {totalShopGift > 0 && (
        <View className="flex-row items-center justify-between">
          <BaseText type="subtitle3" color="supportive2">
            {t('shopGift')} :
          </BaseText>
          <BaseText type="subtitle3" color="supportive2">
            {formatNumber(totalShopGift)} ﷼
          </BaseText>
        </View>
      )}
      <View className="flex-row items-center justify-between pt-4 border-t border-dashed border-neutral-0 dark:border-neutral-dark-400/50">
        <BaseText type="subtitle3" color="secondary">
          {t('Amount payable')} :
        </BaseText>
        <BaseText type="subtitle3" color="secondaryPurple">
          {formatNumber(amountPayable)} ﷼
        </BaseText>
      </View>
    </View>
  </View>
);

export default OrderSummary;
