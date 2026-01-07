import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {Content} from '../../../services/models/response/UseResrService';
import {ArrowUp, Box1} from 'iconsax-react-native';
import BaseText from '../../BaseText';
import moment from 'jalali-moment';
import {useTranslation} from 'react-i18next';
import Badge from '../../Badge/Badge';

const PackageCard: React.FC<{data: Content}> = ({data}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Home'});

  return (
    <View className="BaseServiceCard">
      <View className="flex-row items-start justify-between pb-4 border-b border-neutral-0 dark:border-neutral-dark-400/50 ">
        <View className="flex-row items-center  gap-4">
          <View className="w-[44px] h-[44px] items-center justify-center rounded-full bg-supportive5-500/40">
            <Box1 size="24" color="#5bc8ff" variant="Bold" />
          </View>
          <BaseText type="title4" color="base">
            {data.title}
          </BaseText>
        </View>
        <TouchableOpacity className="flex-row gap-1 items-center ">
          <View className="-rotate-45">
            <ArrowUp size="16" color="#55575c" />
          </View>
        </TouchableOpacity>
      </View>
      <View className="pt-3 gap-3">
        <View className="flex flex-row flex-wrap gap-1">
          {data.product?.hasSubProduct ? (
            data.product?.subProducts?.map((item, index) => {
              return (
                <Badge
                  key={index}
                  CreditMode={item.product?.type === 2 ? true : false}
                  defaultMode
                  textColor="supportive5"
                  className="w-fit"
                  value={item.product?.title ?? ''}
                />
              );
            })
          ) : (
            <Badge
              color="secondary"
              value={'بدون ساب پروداکت'}
              className="w-fit"
            />
          )}
        </View>
        <View className="flex-row items-center justify-between">
          <BaseText type="body3" color="secondary">
            {t('start')} {''} : {''}
            {moment(data.start)
              .local(
                // @ts-ignore
                'fa',
              )
              .format('jYYYY/jMM/jDD')}
          </BaseText>
          <BaseText type="body3" color="secondary">
            {t('end')} {''} : {''}
            {moment(data.end)
              .local(
                // @ts-ignore
                'fa',
              )
              .format('jYYYY/jMM/jDD')}
          </BaseText>
        </View>
      </View>
    </View>
  );
};

export default PackageCard;
