import React, {useMemo} from 'react';
import {Image, View} from 'react-native';
import {Content} from '../../../services/models/response/UseResrService';
import {Circle} from 'react-native-progress';
import BaseText from '../../BaseText';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../../../utils/ThemeContext';
import moment from 'jalali-moment';
import {useGetOrganizationBySKU} from '../../../utils/hooks/Organization/useGetOrganizationBySKU';
import ContractorInfo from '../../ContractorInfo/ContractorInfo';
import {ColorRingConfig} from '../../../constants/options';
import {TypeTextColor} from '../../../models/stylingTypes';
import {useBase64ImageFromMedia} from '../../../utils/hooks/useBase64Image';

const ServiceCard: React.FC<{data: Content}> = ({data}) => {
  const progress =
    data?.credit && data?.usedCredit && data?.credit > 0
      ? data?.usedCredit / data?.credit
      : 0;
  const {t} = useTranslation('translation', {keyPrefix: 'Home'});
  const {data: OrganizationBySKU} = useGetOrganizationBySKU();

  const {theme} = useTheme();
  const isExpired = moment().isAfter(moment.utc(data?.end));
  const Useable = !isExpired && data?.usable;
  const remainingCredit = (data?.credit ?? 0) - (data?.usedCredit ?? 0);
  const {data: ImageSrc} = useBase64ImageFromMedia(
    data.product?.image?.name,
    'Media',
  );
  const colors = useMemo(() => {
    if (remainingCredit === 0) return ColorRingConfig.red;
    if (remainingCredit < 5) return ColorRingConfig.orange;
    return {
      ...ColorRingConfig.green,
    };
  }, [remainingCredit, theme]);

  return (
    <View className="BaseServiceCard">
      <View className="w-full h-[185px] bg-neutral-0 dark:bg-neutral-dark-0 rounded-3xl overflow-hidden">
        <Image
          style={{width: '100%', height: '100%'}}
          source={{
            uri: ImageSrc,
          }}
        />
      </View>
      <View className="py-3 items-center flex-row justify-between border-b border-neutral-0 dark:border-neutral-dark-400/50">
        <View className="flex-row gap-2 items-center">
          {Useable ? (
            <View className="w-2 h-2 rounded-full bg-success-500" />
          ) : (
            <View className="w-2 h-2 rounded-full bg-error-500" />
          )}
          <BaseText type="title4">{data.title}</BaseText>
        </View>
        <View className="flex-row items-center gap-2">
          <Circle
            size={20}
            progress={progress}
            thickness={3}
            borderWidth={0}
            strokeCap={'round'}
            color={colors.progress}
            unfilledColor={colors.unfilled}
            showsText={false}
          />
          <View className="flex-row gap-1 items-center">
            <BaseText type="title4" color={colors.TextColor as TypeTextColor}>
              {remainingCredit}
            </BaseText>
            <BaseText type="title4" color="muted">
              {data.credit} /
            </BaseText>
          </View>
        </View>
      </View>
      <View className="pt-3 gap-3">
        <View className="flex-row items-center justify-between">
          {data?.contractor ? (
            <ContractorInfo
              firstName={data?.contractor?.firstName}
              imageName={data?.contractor?.profile?.name}
              lastName={data?.contractor?.lastName}
              gender={data.contractor.gender}
            />
          ) : (
            <View></View>
          )}
          <BaseText type="body3" color="secondary">
            {t('MettingRemaining')} :{' '}
            {(data?.credit ?? 0) - (data?.usedCredit ?? 0)}
          </BaseText>
        </View>
        <View className="flex-row items-center justify-between ">
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

export default ServiceCard;
