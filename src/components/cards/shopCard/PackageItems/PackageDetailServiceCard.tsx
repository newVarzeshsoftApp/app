import React from 'react';
import {Image, Pressable, View} from 'react-native';
import {Contractors} from '../../../../services/models/response/ProductResService';
import {subProducts} from '../../../../services/models/response/UseResrService';
import BaseText from '../../../BaseText';
import Badge from '../../../Badge/Badge';
import {useTranslation} from 'react-i18next';
import {
  ConvertDuration,
  formatNumber,
  getSubProductDisplayInfo,
} from '../../../../utils/helpers/helpers';
import {TruncatedText} from '../../../TruncatedText';
import {useBase64ImageFromMedia} from '../../../../utils/hooks/useBase64Image';
import PackageDetailItemContractor from './PackageDetailItemContractor';

type PackageDetailServiceCardProps = {
  subProduct: subProducts;
  selectedContractor?: Contractors | null;
  onPressCard: () => void;
  onSelectContractor?: () => void;
  isContractorRequired?: boolean;
  showDetailData?: boolean;
  showContractor?: boolean;
};

const PackageDetailServiceCard: React.FC<PackageDetailServiceCardProps> = ({
  subProduct,
  selectedContractor = null,
  onPressCard,
  onSelectContractor,
  isContractorRequired = true,
  showDetailData = true,
  showContractor = false,
}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Shop.Service'});
  const {t: tPackage} = useTranslation('translation', {
    keyPrefix: 'Shop.Package',
  });
  const product = subProduct.product;
  const display = getSubProductDisplayInfo(subProduct);
  const {data: imageSrc, isLoading} = useBase64ImageFromMedia(
    product?.image?.name,
    'Media',
  );

  const content = (
    <>
      <View
        className={`w-full aspect-[4/3] rounded-3xl overflow-hidden ${
          isLoading
            ? 'bg-black/20 dark:bg-white/20 animate-pulse'
            : 'bg-neutral-0 dark:bg-neutral-dark-0'
        }`}>
        <Image
          style={{width: '100%', height: '100%'}}
          source={{uri: imageSrc}}
          resizeMode="contain"
        />
        {product?.unlimited ? (
          <View className="absolute top-2 right-2">
            <Badge
              value={t('unlimited')}
              color="success"
              textColor="secondary"
            />
          </View>
        ) : null}
      </View>
      <View className="gap-2 pt-3">
        <BaseText type="title4">{product?.title ?? ''}</BaseText>
        {product?.isCashBack ? (
          <View className="flex-row">
            <Badge GiftMode defaultMode value={t('shopGift')} />
          </View>
        ) : null}
        <View className="flex-row items-center justify-between gap-4">
          {display.sessionCount != null && display.sessionCount > 0 ? (
            <BaseText type="body3" color="secondary">
              {tPackage('SessionCount', {count: display.sessionCount})}
            </BaseText>
          ) : (
            <View />
          )}
          <BaseText type="subtitle3" color="secondary">
            {tPackage('Duration')} : {ConvertDuration(display.duration)}
          </BaseText>
        </View>
        {showDetailData ? (
          <View className="flex-row items-center justify-between gap-4">
            <BaseText type="body3" color="secondary">
              {t('unlimitedServicePrice')} :
            </BaseText>
            <BaseText type="body3" color="secondaryPurple">
              {formatNumber(display.price)} ﷼
            </BaseText>
          </View>
        ) : null}
        {product?.description ? (
          <View>
            <TruncatedText
              moreText={t('more')}
              length={90}
              text={product.description}
            />
          </View>
        ) : null}
      </View>
    </>
  );

  return (
    <View className="BaseServiceCard">
      {showDetailData ? (
        <Pressable onPress={onPressCard}>{content}</Pressable>
      ) : (
        <View>{content}</View>
      )}

      {showContractor && onSelectContractor ? (
        <PackageDetailItemContractor
          selectedContractor={selectedContractor}
          onSelectPress={onSelectContractor}
          isContractorRequired={isContractorRequired}
        />
      ) : null}
    </View>
  );
};

export default PackageDetailServiceCard;
