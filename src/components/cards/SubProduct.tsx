import React, {useMemo} from 'react';
import {View} from 'react-native';
import {subProducts} from '../../services/models/response/UseResrService';
import Badge from '../Badge/Badge';
import {useTranslation} from 'react-i18next';
import {useGetOrganizationBySKU} from '../../utils/hooks/Organization/useGetOrganizationBySKU';
import {getSubProductRestrictionTitle} from '../../utils/helpers/organizationUnits';

const MAX_VISIBLE_IN_CARD = 2;

type SubProductProps = {
  hasSubProduct?: boolean;
  subProducts: subProducts[] | undefined;
  inCard?: boolean;
};
const CreditSubProduct: React.FC<SubProductProps> = ({
  subProducts,
  hasSubProduct,
  inCard,
}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Home'});
  const {data: organization} = useGetOrganizationBySKU();
  const getTitle = (item: subProducts): string =>
    getSubProductRestrictionTitle(
      item,
      {
        allServicesInCategory: t('allServicesInCategory'),
        allServicesInSalesUnit: t('allServicesInSalesUnit'),
        allServicesInBranch: t('allServicesInOrganizationalUnit'),
        noLimit: t('noLimit'),
      },
      organization?.organizationUnits,
    );
  const items = useMemo(() => {
    if (!hasSubProduct) {
      return [];
    }
    return subProducts ?? [];
  }, [hasSubProduct, subProducts]);
  const visibleItems = inCard
    ? items.slice(0, MAX_VISIBLE_IN_CARD)
    : items;
  const hasOverflow = inCard && items.length > MAX_VISIBLE_IN_CARD;

  return (
    <View
      className={
        inCard
          ? 'w-full gap-1 items-start'
          : 'w-full flex-row flex-wrap items-center gap-3'
      }>
      {hasSubProduct ? (
        <>
          {visibleItems.map((item, index) => (
            <Badge
              key={index}
              defaultMode
              textColor="secondaryPurple"
              value={getTitle(item)}
              numberOfLines={inCard ? 1 : undefined}
              className="max-w-full"
            />
          ))}
          {hasOverflow ? (
            <Badge
              defaultMode
              textColor="muted"
              value={t('couldNotFit')}
              className="max-w-full"
            />
          ) : null}
        </>
      ) : (
        <Badge
          defaultMode
          textColor="secondaryPurple"
          value={t('noLimit')}
          className="max-w-full"
        />
      )}
    </View>
  );
};

export default CreditSubProduct;
