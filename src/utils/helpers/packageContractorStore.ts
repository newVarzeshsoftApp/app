import {
  Contractors,
  Product,
} from '../../services/models/response/ProductResService';
import {SaleOrderItem} from '../../services/models/request/OperationalReqService';
import type {CartItem} from './CartStorage';

export type PackageContractorSnapshot = {
  contractorId: number;
  firstName?: string;
  lastName?: string;
  imageName?: string;
  gender?: number;
};

export type PackageItemContractorCartData = PackageContractorSnapshot & {
  productId: number;
  subProductId?: number;
  productTitle?: string;
};

export type PackageCartData = {
  itemContractors: PackageItemContractorCartData[];
};

const packageContractorSelections = new Map<number, number>();
const packageItemContractorSelections = new Map<
  string,
  PackageContractorSnapshot
>();

const getItemKey = (packageId: number, productId: number) =>
  `${packageId}:${productId}`;

export const setPackageContractorSelection = (
  packageId: number,
  contractorId: number,
): void => {
  packageContractorSelections.set(packageId, contractorId);
};

export const getPackageContractorSelection = (
  packageId: number,
): number | undefined => packageContractorSelections.get(packageId);

export const clearPackageContractorSelection = (packageId: number): void => {
  packageContractorSelections.delete(packageId);
};

export const setPackageItemContractorSelection = (
  packageId: number,
  productId: number,
  contractor: Contractors,
): void => {
  const contractorId = contractor.contractorId ?? contractor.contractor?.id;
  if (!contractorId) return;

  packageItemContractorSelections.set(getItemKey(packageId, productId), {
    contractorId,
    firstName: contractor.contractor?.firstName,
    lastName: contractor.contractor?.lastName,
    imageName: contractor.contractor?.profile?.name,
    gender: contractor.contractor?.gender,
  });

  setPackageContractorSelection(packageId, contractorId);
};

export const getPackageItemContractorSelection = (
  packageId: number,
  productId: number,
): PackageContractorSnapshot | undefined =>
  packageItemContractorSelections.get(getItemKey(packageId, productId));

export const snapshotToContractors = (
  snapshot: PackageContractorSnapshot,
): Contractors => ({
  contractorId: snapshot.contractorId,
  contractor: {
    id: snapshot.contractorId,
    firstName: snapshot.firstName,
    lastName: snapshot.lastName,
    gender: snapshot.gender,
    profile: snapshot.imageName ? {name: snapshot.imageName} : undefined,
  },
});

export const clearPackageItemContractorSelection = (
  packageId: number,
  productId: number,
): void => {
  packageItemContractorSelections.delete(getItemKey(packageId, productId));
};

export const isPackageContractorRequired = (product: Product): boolean =>
  !!product.hasContractor && !!product.requiredContractor;

export const collectPackageContractorsForCart = (
  packageId: number,
  packageProduct: Product,
): PackageItemContractorCartData[] => {
  const results: PackageItemContractorCartData[] = [];

  packageProduct.subProducts?.forEach(subProduct => {
    const product = subProduct.product;
    if (!product?.hasContractor) {
      return;
    }

    const contractor = resolveContractorForPackageItem(
      product,
      packageProduct.contractors ?? [],
      packageId,
    );

    if (!contractor) {
      return;
    }

    const contractorId = contractor.contractorId ?? contractor.contractor?.id;
    if (!contractorId) {
      return;
    }

    const snapshot = getPackageItemContractorSelection(packageId, product.id);

    results.push({
      productId: product.id,
      subProductId: subProduct.id,
      productTitle: product.title,
      contractorId,
      firstName: contractor.contractor?.firstName ?? snapshot?.firstName,
      lastName: contractor.contractor?.lastName ?? snapshot?.lastName,
      imageName: contractor.contractor?.profile?.name ?? snapshot?.imageName,
      gender: contractor.contractor?.gender ?? snapshot?.gender,
    });
  });

  return results;
};

export const resolvePackageCartContractor = (
  packageProduct: Product,
  packageId: number,
  packageLevelContractor?: Contractors | null,
): Contractors | null => {
  if (packageLevelContractor) {
    return packageLevelContractor;
  }

  const itemContractors = collectPackageContractorsForCart(
    packageId,
    packageProduct,
  );

  if (itemContractors.length === 0) {
    return null;
  }

  return snapshotToContractors(itemContractors[0]);
};

export const applyPackageContractorsToProduct = (
  packageProduct: Product,
  itemContractors: PackageItemContractorCartData[],
): Product => {
  if (!itemContractors.length || !packageProduct.subProducts?.length) {
    return packageProduct;
  }

  return {
    ...packageProduct,
    subProducts: packageProduct.subProducts.map(subProduct => {
      const match = itemContractors.find(
        entry => entry.productId === subProduct.product?.id,
      );

      if (!match) {
        return subProduct;
      }

      return {
        ...subProduct,
        contractorId: match.contractorId,
      };
    }),
  };
};

export const areRequiredPackageContractorsSelected = (
  packageProduct: Product,
  packageId: number,
  packageLevelContractor?: Contractors | null,
): boolean => {
  const packageRequiresContractor = isPackageContractorRequired(packageProduct);

  if (
    packageRequiresContractor &&
    !packageLevelContractor &&
    !getPackageContractorSelection(packageId)
  ) {
    return false;
  }

  const requiredSubProducts =
    packageProduct.subProducts?.filter(subProduct =>
      subProduct.product
        ? isPackageContractorRequired(subProduct.product)
        : false,
    ) ?? [];

  return requiredSubProducts.every(subProduct =>
    !!resolveContractorForPackageItem(
      subProduct.product!,
      packageProduct.contractors ?? [],
      packageId,
    ),
  );
};

const findContractorById = (
  contractors: Contractors[],
  contractorId: number,
): Contractors | undefined =>
  contractors.find(
    entry =>
      entry.contractorId === contractorId ||
      entry.contractor?.id === contractorId,
  );

export const resolveContractorForPackageItem = (
  product: Product,
  packageContractors: Contractors[],
  packageId: number,
  packageLevelContractorId?: number,
): Contractors | null => {
  if (!product.hasContractor) {
    return null;
  }

  const itemSnapshot = getPackageItemContractorSelection(packageId, product.id);
  if (itemSnapshot) {
    const fromProduct = product.contractors?.length
      ? findContractorById(product.contractors, itemSnapshot.contractorId)
      : undefined;

    return fromProduct ?? snapshotToContractors(itemSnapshot);
  }

  const contractorId =
    packageLevelContractorId ?? getPackageContractorSelection(packageId);

  if (!contractorId) {
    return null;
  }

  const fromProduct = product.contractors?.length
    ? findContractorById(product.contractors, contractorId)
    : undefined;
  if (fromProduct) {
    return fromProduct;
  }

  return findContractorById(packageContractors, contractorId) ?? null;
};

export const buildPackageSaleOrderSubItems = (
  item: Pick<CartItem, 'product' | 'packageContractorData'>,
  userId: number,
  endDate: string,
): SaleOrderItem[] => {
  const subProducts = item.product.subProducts ?? [];

  return subProducts.map(subProduct => {
    const productId = subProduct.product?.id ?? subProduct.productId;
    const itemContractor = item.packageContractorData?.itemContractors?.find(
      entry => entry.productId === productId,
    );
    const contractorId =
      itemContractor?.contractorId ?? subProduct.contractorId ?? null;
    const price =
      subProduct.price?.price ?? subProduct.product?.price ?? subProduct.amount ?? 0;
    const discount = subProduct.discount ?? 0;
    const amount = subProduct.amount ?? price;
    const priceId = subProduct.priceId ?? subProduct.price?.id ?? null;

    const subItem: SaleOrderItem = {
      id: subProduct.id,
      product: productId,
      quantity: subProduct.quantity ?? 1,
      discount,
      price,
      tax: subProduct.tax ?? 0,
      amount,
      user: userId,
      manualPrice: false,
      type: subProduct.product?.type ?? 1,
      registeredService: 0,
      end: endDate,
      priceId,
      waitingForGroupClass: false,
    };

    if (contractorId && subProduct.product?.hasContractor) {
      subItem.contractor = contractorId;
    }

    return subItem;
  });
};

export const resolveCartItemContractorId = (
  item: Pick<CartItem, 'SelectedContractor' | 'packageContractorData'>,
): number | null => {
  const selectedContractorId =
    item.SelectedContractor?.contractorId ??
    item.SelectedContractor?.contractor?.id;

  if (selectedContractorId) {
    return selectedContractorId;
  }

  const packageItemContractor =
    item.packageContractorData?.itemContractors?.find(
      entry => entry.contractorId,
    );

  return packageItemContractor?.contractorId ?? null;
};
