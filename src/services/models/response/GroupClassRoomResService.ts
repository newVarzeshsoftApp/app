import {Product} from './ProductResService';
import {Category} from './CategoryResService';
import {User} from './UseResrService';

export interface GroupClassRoomConfig {
  contractorId: number;
  contractorFullName: string;
  contractorMax: number;
  contractorAlarm: number;
  filled: number;
  [key: string]: any;
}

export interface GroupClassRoomSchedule {
  days: number[];
  id: number;
  updatedAt: string;
  createdAt: string;
  from: string; // "07:00:00"
  to: string; // "08:00:00"
  date: string | null;
  preReservedCount?: number;
  [key: string]: any;
}

export interface GroupClassRoom {
  id: number;
  title: string;
  price: number;
  sessions: number;
  durations: number;
  filled: number;
  quantity: number;
  quantityOnlineSale: number;
  quantityAlarm: number;
  enabled: boolean;
  reservable: boolean;
  fixed: boolean;
  useJustInSchedules: boolean;
  service: Product;
  category: Category;
  contractors: User[];
  location?: {
    title: string;
    address?: string;
    [key: string]: any;
  };
  schedules?: GroupClassRoomSchedule[];
  order: number;
  configs?: GroupClassRoomConfig[];
  updatedAt?: string;
  createdAt?: string;
  deletedAt?: string | null;
  [key: string]: any;
}

export interface GroupClassRoomResponse {
  total?: number;
  content: GroupClassRoom[];
}

export interface GroupClassRoomService {
  id: number;
  title: string;
  price: string | number;
  [key: string]: any;
}

// Response is a direct array, not wrapped in content/total
export type GroupClassRoomServicesResponse = GroupClassRoomService[];

export interface GroupClassRoomParticipant {
  id: number;
  user: User;
  groupClassRoom: GroupClassRoom;
  contractor: User;
  waitingForGroupClass: boolean;
  [key: string]: any;
}

export interface GroupClassRoomParticipantsResponse {
  total?: number;
  content: GroupClassRoomParticipant[];
}

export interface OrganizationUnit {
  organizationUnitId: number;
  organizationUnitTitle: string;
  [key: string]: any;
}

// Response is a direct array, not wrapped in content/total
export type OrganizationUnitResponse = OrganizationUnit[];

