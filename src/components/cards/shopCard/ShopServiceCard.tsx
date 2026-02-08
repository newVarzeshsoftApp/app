import React from 'react';
import {Image, View} from 'react-native';
import {Product} from '../../../services/models/response/ProductResService';
import BaseText from '../../BaseText';
import Badge from '../../Badge/Badge';
import {useTranslation} from 'react-i18next';
import {formatNumber} from '../../../utils/helpers/helpers';
import {TruncatedText} from '../../TruncatedText';
import {useBase64ImageFromMedia} from '../../../utils/hooks/useBase64Image';
type ShopServiceProps = {
  data: Product;
};
const ShopServiceCard: React.FC<ShopServiceProps> = ({data}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Shop.Service'});
  const {data: ImageSrc, isLoading} = useBase64ImageFromMedia(
    data?.image?.name,
    'Media',
  );
  return (
    <View className="BaseServiceCard">
      <View
        className={`w-full h-[185px]  rounded-3xl overflow-hidden ${
          isLoading
            ? 'bg-black/20 dark:bg-white/20 animate-pulse'
            : 'bg-neutral-0 dark:bg-neutral-dark-0'
        }`}>
        <Image
          style={{width: '100%', height: '100%'}}
          source={{uri: ImageSrc}}
        />
        {data.unlimited && (
          <View className="absolute top-2 right-2">
            <Badge
              value={t('unlimited')}
              color="success"
              textColor="secondary"
            />
          </View>
        )}
      </View>
      <View className="gap-2 pt-3">
        <BaseText type="title4">{data.title}</BaseText>
        {data.isCashBack && (
          <View className="flex-row">
            <Badge GiftMode defaultMode value={t('shopGift')} />
          </View>
        )}
        <View className="flex-row items-center justify-between gap-4">
          <BaseText type="body3" color="secondary">
            {/*{data.unlimited*/}
            {/*  ? t('unlimitedServicePrice')*/}
            {/*  : t('SingleservicePrice')}{' '}*/}
            {
              t('unlimitedServicePrice')
            }{' :'}
          </BaseText>
          <BaseText type="body3" color="secondaryPurple">
            {/*{formatNumber(data.price ?? 0)} ﷼*/}
            {(data?.priceList && data?.priceList?.length>1)
                ? `${formatNumber(data?.priceList?.sort((a,b)=>a.price-b.price)[0]?.price ?? 0)}  تا ${formatNumber(data?.priceList?.sort((a,b)=>b.price-a.price)[0]?.price ?? 0)}`
                : formatNumber(data?.priceList?.[0]?.price ?? data.price ??0)
            } ﷼
          </BaseText>
        </View>

        {data.description && (
          <View>
            <TruncatedText
              moreText={t('more')}
              length={90}
              text={data.description}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default ShopServiceCard;
