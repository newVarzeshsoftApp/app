export interface UpdateProfileBody {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  nationCode?: string;
  gender?: number;
  mobile?: number;
  phone?: string;
  introductionMethod?: 0;
  address?: string;
  email?: string;
}
export interface UpdatePasswordBody {
  oldPassword: string;
  newPassword: string;
}
export interface UploadAvatarBody {
  file: File;
}
