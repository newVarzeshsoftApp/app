import {ProfileResponse} from './AuthResService';

export interface AdminLoginResponse {
  accessToken: string;
  refreshToken: string;
  user?: ProfileResponse;
}

export interface AdminProfileResponse {
  // Same as ProfileResponse from Auth
}
