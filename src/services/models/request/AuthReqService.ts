export interface SignInBody {
  organization: number;
  username: string;
  password: string;
}
export interface UpdatePasswordBody {
  password: string;
}
export interface SignUpBody {
  firstName?: string;
  lastName?: string;
  username?: string;
  password?: string;
  email?: string;
  gender?: 0 | 1;
  organization?: number;
}
export interface RequestOTPBody {
  username: string;
  organization: number;
}
export interface VerifyTokenBody {
  username: string;
  organization: number;
  code: string;
}
