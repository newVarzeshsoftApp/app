import React from 'react';
import {Text, View} from 'react-native';
import {subProducts} from '../../services/models/response/UseResrService';
import Badge from '../Badge/Badge';
import {useTranslation} from 'react-i18next';

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
  const getTitle = (item: subProducts): string => {
    if (item.product?.title) {
      return item.product.title;
    } else if (item?.category?.title) {
      return `${t('allServicesInCategory')} ${item.category.title}`;
    } else if (item.SaleUnit?.title) {
      return `${t('allServicesInSalesUnit')} ${item.SaleUnit.title}`;
    } else if (item.OrganizationUnit?.title) {
      return `${t('allServicesInOrganizationalUnit')} ${
        item.OrganizationUnit.title
      }`;
    }
    return t('noLimit');
  };
  return (
    <View
      className={`flex-row items-center gap-1  ${
        inCard ? 'max-w-[280px] overflow-hidden' : 'flex-wrap gap-3'
      }`}>
      {hasSubProduct ? (
        subProducts?.map((item, index) => {
          return (
            <Badge
              key={index}
              defaultMode
              textColor="secondaryPurple"
              value={getTitle(item)}
              className="w-fit"
            />
          );
        })
      ) : (
        <Badge
          defaultMode
          textColor="secondaryPurple"
          value={t('noLimit')}
          className="w-fit"
        />
      )}
    </View>
  );
};

export default CreditSubProduct;
