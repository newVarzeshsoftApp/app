export type SrcSet = Record<string, string>;

export type Banner = {
  id: number;
  updatedAt: string;
  createdAt: string;
  deletedAt: string | null;
  title: string;
  name: string;
  bucket: string | null;
  srcset: SrcSet;
  mimetype: string;
  fileSize: number | null;
  isPrivate: boolean;
};

export type Logo = {
  id: number;
  updatedAt: string;
  createdAt: string;
  title: string;
  name: string;
  bucket: string | null;
  srcset: SrcSet;
  mimetype: string;
  fileSize: number | null;
  isPrivate: boolean;
};

export type OrganizationUnitItem = {
  id: number;
  title: string;
  sourceId: number;
  organizationId?: number;
};

export type DeliveryOrganizationUnit = {
  organizationUnitId: number;
  organizationUnitTitle: string;
};

export type GetAllOrganizationResponse = {
  banners: Banner[];
  id: number;
  updatedAt: string;
  createdAt: string;
  name: string;
  sku: string;
  key?: string;
  port: number;
  imageUrl: string | null;
  officialLogo: Logo;
  brandedLogo: Logo;
  organizationUnits?: OrganizationUnitItem[];
};
