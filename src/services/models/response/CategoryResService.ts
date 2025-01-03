import {Image} from './UseResrService';

export interface Category {
  title: string;
  forEvent: boolean;
  type: number;
  isOnline: boolean;
  isKiosk: boolean | null;
  id: number;
  updatedAt: string;
  createdAt: string;
  deletedAt: string | null;
  image: Image | null;
}
export interface CategoryPageRes {
  total: number;
  content: Category[];
}
