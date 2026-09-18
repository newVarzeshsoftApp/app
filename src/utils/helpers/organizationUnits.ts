import {ProductType, SaleUnitType} from '../../constants/options';
import {
  DeliveryOrganizationUnit,
  OrganizationUnitItem,
} from '../../services/models/response/OrganizationResServise';
import {Product} from '../../services/models/response/ProductResService';
import {
  OrganizationUnit,
  SaleUnit,
  subProducts,
} from '../../services/models/response/UseResrService';

export const isMultiOrganization = (
  organizationUnits?: OrganizationUnitItem[] | null,
): boolean => (organizationUnits?.length ?? 0) > 1;

export const toOptionalOrganizationUnitId = (
  value?: number | string | null,
): number | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const id = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(id) || id <= 0) {
    return undefined;
  }

  return id;
};

export const isServiceProductType = (type?: number | null): boolean =>
  type === ProductType.Service;

export const isServiceSaleItemType = (type?: number | null): boolean =>
  type === SaleUnitType.Service;

export type DeliveryOrganizationUnitsVisibility =
  | {kind: 'hidden'}
  | {kind: 'all'}
  | {kind: 'units'; units: DeliveryOrganizationUnit[]};

export const getDeliveryOrganizationUnitsVisibility = ({
  isMultiOrg,
  isService,
  units,
}: {
  isMultiOrg: boolean;
  isService: boolean;
  units?: DeliveryOrganizationUnit[];
}): DeliveryOrganizationUnitsVisibility => {
  if (!isMultiOrg || !isService || units === undefined) {
    return {kind: 'hidden'};
  }

  if (units.length === 0) {
    return {kind: 'all'};
  }

  return {kind: 'units', units};
};

export const productMatchesOrganizationUnit = (
  product: Pick<Product, 'type' | 'deliveryOrganizationUnits'>,
  organizationUnitId?: number,
): boolean => {
  if (organizationUnitId == null) {
    return true;
  }

  if (!isServiceProductType(product.type)) {
    return true;
  }

  const units = product.deliveryOrganizationUnits;
  if (units === undefined) {
    return false;
  }

  if (units.length === 0) {
    return true;
  }

  return units.some(unit => unit.organizationUnitId === organizationUnitId);
};

const pickTitle = (
  ...values: Array<string | null | undefined>
): string | undefined => {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return undefined;
};

export const getHistoricalOrganizationUnitTitle = (
  source: {
    organizationUnit?: OrganizationUnit | null;
    OrganizationUnit?: OrganizationUnit | null;
    organizationUnitTitle?: string | null;
    organizationUnitId?: number | null;
  },
  organizationUnits?: OrganizationUnitItem[] | null,
): string | undefined => {
  const nested = source.organizationUnit ?? source.OrganizationUnit;
  const nestedTitle = pickTitle(nested?.title, source.organizationUnitTitle);
  if (nestedTitle) {
    return nestedTitle;
  }

  const id = nested?.id ?? source.organizationUnitId;
  if (id == null) {
    return undefined;
  }

  return organizationUnits?.find(unit => unit.id === id || unit.sourceId === id)
    ?.title;
};

export const getHistoricalSaleUnitTitle = (source: {
  saleUnit?: SaleUnit | null;
  SaleUnit?: SaleUnit | null;
}): string | undefined =>
  pickTitle(source.saleUnit?.title, source.SaleUnit?.title);

export const getSubProductRestrictionTitle = (
  item: subProducts,
  translators: {
    allServicesInCategory: string;
    allServicesInSalesUnit: string;
    allServicesInBranch: string;
    noLimit: string;
  },
  organizationUnits?: OrganizationUnitItem[] | null,
): string => {
  if (item.product?.title) {
    return item.product.title;
  }

  if (item.category?.title) {
    return `${translators.allServicesInCategory} ${item.category.title}`;
  }

  const saleUnitTitle = getHistoricalSaleUnitTitle(item);
  if (saleUnitTitle) {
    return `${translators.allServicesInSalesUnit} ${saleUnitTitle}`;
  }

  const organizationUnitTitle = getHistoricalOrganizationUnitTitle(
    item,
    organizationUnits,
  );
  if (organizationUnitTitle) {
    return `${translators.allServicesInBranch} ${organizationUnitTitle}`;
  }

  return translators.noLimit;
};
