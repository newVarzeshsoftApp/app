import React from 'react';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import BaseText from '../BaseText';
import {useIsMultiOrg} from '../../utils/hooks/Organization/useGetOrganizationBySKU';

type HistoryLocationMetaProps = {
  organizationUnitTitle?: string;
  saleUnitTitle?: string;
  showSaleUnit?: boolean;
};

const HistoryLocationMeta: React.FC<HistoryLocationMetaProps> = ({
  organizationUnitTitle,
  saleUnitTitle,
  showSaleUnit = false,
}) => {
  const isMultiOrg = useIsMultiOrg();
  const {t} = useTranslation('translation', {keyPrefix: 'Home'});

  if (!isMultiOrg) {
    return null;
  }

  const branchTitle = organizationUnitTitle?.trim();
  const unitTitle = showSaleUnit ? saleUnitTitle?.trim() : undefined;

  if (!branchTitle && !unitTitle) {
    return null;
  }

  return (
    <>
      {branchTitle ? (
        <View className="flex-row items-center justify-between">
          <BaseText type="body3" color="secondary">
            {t('branch')}: {''}
          </BaseText>
          <BaseText
            type="body3"
            color="base"
            className="truncate max-w-[70%] text-left flex-1">
            {branchTitle}
          </BaseText>
        </View>
      ) : null}
      {unitTitle ? (
        <View className="flex-row items-center justify-between">
          <BaseText type="body3" color="secondary">
            {t('saleUnit')}: {''}
          </BaseText>
          <BaseText
            type="body3"
            color="base"
            className="truncate max-w-[70%] text-left flex-1">
            {unitTitle}
          </BaseText>
        </View>
      ) : null}
    </>
  );
};

export default HistoryLocationMeta;
