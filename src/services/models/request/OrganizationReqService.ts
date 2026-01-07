export interface CreateOrganizationBody {
  name: string;
  sku: string;
  host: string;
  port: number;
  officialLogo: number;
  brandedLogo: number;
  banners?: any;
  imageUrl: string;
}

export interface UpdateOrganizationBody {
  officialLogo?: number;
  brandedLogo?: number;
  banners?: any;
  imageUrl?: any;
}
