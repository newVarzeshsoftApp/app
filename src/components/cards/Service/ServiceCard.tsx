import React from 'react';
import {Image, Text, View} from 'react-native';
import ResponsiveImage from '../../ResponsiveImage';
import {Content} from '../../../services/models/response/UseResrService';
import {Circle} from 'react-native-progress';
import BaseText from '../../BaseText';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../../../utils/ThemeContext';
import moment from 'jalali-moment';
import {useGetOrganizationBySKU} from '../../../utils/hooks/Organization/useGetOrganizationBySKU';

const ServiceCard: React.FC<{data: Content}> = ({data}) => {
  const progress =
    data?.credit && data?.usedCredit && data?.credit > 0
      ? data?.usedCredit / data?.credit
      : 0;
  const {t} = useTranslation('translation', {keyPrefix: 'Home'});
  const {data: OrganizationBySKU} = useGetOrganizationBySKU();

  const {theme} = useTheme();
  return (
    <View className="BaseServiceCard">
      <View className="w-full h-[185px] bg-neutral-0 dark:bg-neutral-dark-0 rounded-3xl overflow-hidden">
        <Image
          style={{width: '100%', height: '100%'}}
          source={{
            uri:
              (OrganizationBySKU?.imageUrl ?? '') + data?.product?.image?.name,
          }}
        />
      </View>
      <View className="py-3 items-center flex-row justify-between border-b border-neutral-0 dark:border-neutral-dark-400/50">
        <View className="flex-row gap-2 items-center">
          {(data.usable ?? false) && (
            <View className="w-2 h-2 rounded-full bg-success-500"></View>
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
            color={theme === 'dark' ? '#37C976' : '#37C976'}
            unfilledColor={theme === 'dark' ? '#175432' : '#C1EED5'}
            showsText={false}
          />
          <View className="flex-row gap-1 items-center">
            <BaseText type="title4" color="success">
              {(data?.credit ?? 0) - (data?.usedCredit ?? 0)}
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
            <View className="dark:bg-neutral-dark-100 bg-neutral-100 flex-row w-fit gap-2 pl-3  rounded-full p-1">
              <View className="h-6 w-6 rounded-full overflow-hidden ">
                {/* <ResponsiveImage customSource={data.contractor}/> */}
                <Image
                  style={{width: '100%', height: '100%'}}
                  source={{
                    uri:
                      (OrganizationBySKU?.imageUrl ?? '') +
                      data?.contractor?.profile?.name,
                  }}
                />
              </View>
              <BaseText type="body3" color="secondary">
                {data?.contractor?.firstName} {data?.contractor?.lastName}
              </BaseText>
            </View>
          ) : (
            <View></View>
          )}
          <BaseText type="body3" color="muted">
            {t('MettingRemaining')} :{' '}
            {(data?.credit ?? 0) - (data?.usedCredit ?? 0)}
          </BaseText>
        </View>
        <View className="flex-row items-center justify-between ">
          <BaseText type="body3" color="muted">
            {t('start')} {''} : {''}
            {moment(data.start)
              .local(
                // @ts-ignore
                'fa',
              )
              .format('jYYYY/jMM/jDD')}
          </BaseText>
          <BaseText type="body3" color="muted">
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
