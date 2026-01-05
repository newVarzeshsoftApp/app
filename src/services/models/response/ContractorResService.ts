import {User} from './UseResrService';

export interface Contractor {
  id: number;
  firstName: string;
  lastName: string;
  mobile: string;
  email?: string;
  profile?: {
    name: string;
    width: number;
    height: number;
    size: number;
  } | null;
  gender?: number;
  [key: string]: any;
}

import {User} from './UseResrService';

// Response is a direct array of User objects, not wrapped in content/total
export type ContractorResponse = User[];

