export interface organization {
  name: string;
  sku: string;
  host: string;
  port: 0;
  key: string;
  imageUrl: string;
  officialLogo: {
    title: string;
    name: string;
    bucket: string;
    srcset: {};
    mimetype: string;
    fileSize: 0;
    isPrivate: true;
  };
  brandedLogo: {
    title: string;
    name: string;
    bucket: string;
    srcset: {};
    mimetype: string;
    fileSize: 0;
    isPrivate: true;
  };
}

export interface User {
  firstName: string;
  lastName: string;
  mobile: string;
  userId: 0;
  email: string;
  password: string;
  profile: {
    height: 0;
    name: string;
    size: 0;
    width: 0;
  };
  lastLoggedIn: string;
  organization: organization;
}
export interface SignInResponse {
  refreshToken: string;
  accessToken: string;
  user: User;
}
export interface SignUpResponse {
  result: boolean;
}
export interface ProfileResponse {
  id: number;
  profile: string | null;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string | null;
  phone: string | null;
  birthDate: string | null;
  nationCode: string | null;
  address: string | null;
  disabledDescription: string;
  authorizedDebtor: boolean;
  maxDeptAmount: string;
  gender: number;
  password: string;
  credit: number;
  rate: number;
  isLegal: boolean;
  resetToken: string | null;
  resetTime: string;
  resetNumberRequest: number;
  forceChangePassword: boolean;
  refreshToken: string | null;
  lastLoggedIn: string;
  activityField: string;
  updatedAt: string;
  createdAt: string;
  deletedAt: string | null;
  roles: string[];
  status: number;
  insuranceExpiredDate: string | null;
  config: Record<string, unknown>;
  faceSample: boolean;
  smsClub: boolean;
  passport: string | null;
  workAddress: string | null;
  enFirstName: string | null;
  enLastName: string | null;
  fax: string | null;
  website: string | null;
  instagramId: string | null;
  companyName: string | null;
  companyType: string | null;
  companyRegistrationNumber: string | null;
  companyRegistrationDate: string | null;
  companyNationCode: string | null;
  companyEconomicCode: string | null;
  code: number;
  accessIpAddress: string | null;
  lastEventId: string | null;
  faceSampleCreatedAt: string | null;
  cardSampleCreatedAt: string | null;
  fingerSampleCreatedAt: string | null;
  postalCode: string | null;
  personalTaxCode: string | null;
  hasActivity: boolean;
  groups: unknown[]; // Use a more specific type if you know the structure
  introductionMethod: string | null;
  accessShops: unknown[]; // Use a more specific type if you know the structure
  accessOrganizationUnits: unknown[]; // Use a more specific type if you know the structure
  parentId: number | null;
}
