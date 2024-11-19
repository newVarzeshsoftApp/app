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
