import React, {useMemo} from 'react';
import {Text, View} from 'react-native';
import {
  PriceList,
  Product,
} from '../../../services/models/response/ProductResService';
import {Calendar, Clock, Gift} from 'iconsax-react-native';
import {useTheme} from '../../../utils/ThemeContext';
import BaseText from '../../../components/BaseText';
import {useTranslation} from 'react-i18next';
import {
  ConvertDuration,
  formatNumber,
  formatTimeDuration,
} from '../../../utils/helpers/helpers';
import moment from 'jalali-moment';
type PriceListDetailProps = {
  SelectedPriceList: PriceList | null;
  ServiceData?: Product;
};

const PriceListDetail: React.FC<PriceListDetailProps> = ({
  SelectedPriceList,
  ServiceData: data,
}) => {
  const {theme} = useTheme();
  const iconColor = theme === 'dark' ? '#55575c' : '#aaabad';
  const {t} = useTranslation('translation', {keyPrefix: 'Shop.Service'});

  const Tax = useMemo(() => {
    const price = SelectedPriceList?.price ?? 0; // قیمت اصلی
    const discount = SelectedPriceList?.discountOnlineShopPercentage ?? 0; // درصد تخفیف
    const taxPercentage = data?.tax ?? 0; // درصد مالیات
    // قیمت بعد از تخفیف
    const discountedPrice = price - (price * discount) / 100;
    //  مالیات
    return (discountedPrice * taxPercentage) / 100;
  }, [
    SelectedPriceList?.price,
    SelectedPriceList?.discountOnlineShopPercentage,
    data?.tax,
  ]);
  const Total = useMemo(() => {
    const price = SelectedPriceList?.price ?? 0; // قیمت اصلی
    const discount = SelectedPriceList?.discountOnlineShopPercentage ?? 0; // درصد تخفیف
    // محاسبه قیمت پس از تخفیف
    return price - (price * discount) / 100;
  }, [
    SelectedPriceList?.price,
    SelectedPriceList?.discountOnlineShopPercentage,
  ]);
  const purchaseProfit = useMemo(
    () =>
      ((data?.price ?? 0) - (data?.discount ?? 0)) *
        (SelectedPriceList?.min ?? 0) -
      Total,
    [SelectedPriceList?.price],
  );

  const Discount = useMemo(() => {
    const price = SelectedPriceList?.price ?? 0; // قیمت اصلی
    const discount = SelectedPriceList?.discountOnlineShopPercentage ?? 0; //  تخفیف
    return (price * discount) / 100;
  }, [SelectedPriceList?.discountOnlineShopPercentage]);
  return (
    <View className="gap-3">
      <View className="CardBase gap-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row gap-2 ">
            <Calendar size="24" color={iconColor} variant="Bold" />
            <BaseText type="body3" color="secondary">
              {t('Duration')}
            </BaseText>
          </View>
          <BaseText type="body3" color="secondary">
            {ConvertDuration(SelectedPriceList?.duration ?? 0)}
          </BaseText>
        </View>
        <View className="flex-row items-center justify-between">
          <View>
            <BaseText type="body3" color="secondary">
              {t('start')} : {moment().format('jYYYY/jMM/jDD')}
            </BaseText>
          </View>
          <View>
            <BaseText type="body3" color="secondary">
              {t('end')} :{' '}
              {moment()
                .add(SelectedPriceList?.duration ?? 0, 'days')
                .format('jYYYY/jMM/jDD')}
            </BaseText>
          </View>
        </View>
        {(data?.fairUseTime ?? -1) > 0 && (
          <View className="pt-3 border-t flex-row items-center justify-between border-neutral-500/40">
            <View className="flex-row items-center gap-2">
              <Clock size="24" color={iconColor} variant="Bold" />
              <BaseText type="body3" color="secondary">
                {t('Fair consumption')}
              </BaseText>
            </View>
            <View className="flex-row items-center gap-2">
              <BaseText type="body3" color="secondary">
                {formatTimeDuration(data?.fairUseTime ?? 0)}
              </BaseText>
            </View>
          </View>
        )}
      </View>
      {/* discount PART */}
      {Discount > 0 ||
        (purchaseProfit > 0 && (
          <View className="CardBase gap-3">
            {Discount > 0 && (
              <View className="flex-row items-center justify-between gap-2">
                <BaseText type="body3" color="secondary">
                  {t('Discount')} :
                </BaseText>
                <BaseText type="body3" color="success">
                  {formatNumber(Discount)} ﷼
                </BaseText>
              </View>
            )}
            {purchaseProfit > 0 && (
              <View className="flex-row items-center justify-between">
                <BaseText type="body3" color="secondary">
                  {t('Purchase profit')} :
                </BaseText>
                <BaseText type="body3" color="success">
                  {formatNumber(purchaseProfit)} ﷼
                </BaseText>
              </View>
            )}
          </View>
        ))}

      {/* CashBack PART */}
      {(SelectedPriceList?.cashBackPercentage ?? 0) > 0 && (
        <View className="GiftCard gap-6">
          <View className="flex-row items-center gap-2">
            <Gift variant="Bold" color="#A27EB7" />
            <BaseText type="title4" color="supportive2">
              {t('shopGift')}
            </BaseText>
          </View>
          <View className="flex-row items-center ">
            <View className="flex-1 justify-center items-center border-l border-supportive2-500/60 ">
              <BaseText type="body3" color="secondary">
                {ConvertDuration(SelectedPriceList?.cashBackDuration ?? 0)}
              </BaseText>
            </View>
            <View className="flex-1 items-center justify-center ">
              <BaseText type="body3" color="supportive2">
                {formatNumber(
                  ((SelectedPriceList?.price ?? 0) *
                    (SelectedPriceList?.cashBackPercentage ?? 0)) /
                    100,
                )}{' '}
                ﷼
              </BaseText>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default PriceListDetail;
