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

export interface ContractorListResponse {
  content: User[];
  total?: number;
}

// API may return a bare array or a paginated { content, total } payload.
export type ContractorResponse = User[] | ContractorListResponse;

export const normalizeContractorResponse = (
  data: ContractorResponse | null | undefined,
): User[] => {
  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.content)) {
    return data.content;
  }

  return [];
};
