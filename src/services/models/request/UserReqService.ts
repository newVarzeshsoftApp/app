export interface UpdateProfileBody {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  nationCode?: string;
  gender?: number;
  //   gender?: 0 | 1;
  phone?: string;
  introductionMethod?: 0;
  address?: string;
  email?: string;
}
