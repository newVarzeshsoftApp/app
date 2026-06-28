import {
  Contractors,
  Product,
} from '../../services/models/response/ProductResService';

export type PackageContractorSnapshot = {
  contractorId: number;
  firstName?: string;
  lastName?: string;
  imageName?: string;
  gender?: number;
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
