import React from 'react';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import Badge from '../Badge/Badge';
import {DeliveryOrganizationUnit} from '../../services/models/response/OrganizationResServise';
import {useIsMultiOrg} from '../../utils/hooks/Organization/useGetOrganizationBySKU';
import {getDeliveryOrganizationUnitsVisibility} from '../../utils/helpers/organizationUnits';

type ServiceOrganizationUnitsProps = {
  units?: DeliveryOrganizationUnit[];
  isService: boolean;
  className?: string;
};

const ServiceOrganizationUnits: React.FC<ServiceOrganizationUnitsProps> = ({
  units,
  isService,
  className,
}) => {
  const isMultiOrg = useIsMultiOrg();
  const {t} = useTranslation('translation', {keyPrefix: 'Home'});
  const visibility = getDeliveryOrganizationUnitsVisibility({
    isMultiOrg,
    isService,
    units,
  });

  if (visibility.kind === 'hidden') {
    return null;
  }

  const titles =
    visibility.kind === 'all'
      ? [t('allBranches')]
      : visibility.units.map(unit => unit.organizationUnitTitle);

  return (
    <View className={`flex-row flex-wrap gap-1 ${className ?? ''}`}>
      {titles.map(title => (
        <Badge
          key={title}
          defaultMode
          textColor="secondaryPurple"
          value={title}
          className="w-fit max-w-full"
        />
      ))}
    </View>
  );
};

export default ServiceOrganizationUnits;
