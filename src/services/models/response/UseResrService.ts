export type GetUserCreditRes = {
  result: string;
};

export interface InsuranceService {
  title: string;
  start: string; // ISO date string
  end: string; // ISO date string
  status: number;
  duration: number; // in days
}

export interface SubscriptionService {
  title: string;
  start: string; // ISO date string
  end: string; // ISO date string
  status: number;
  duration: number; // in days
}

export interface Locker {
  lockerNumber: number;
  relayNumber: number;
  priority: number;
  type: number;
  id: number;
  updatedAt: string; // ISO date string
  createdAt: string; // ISO date string
  deletedAt: string | null; // Nullable ISO date string
  status: boolean;
  state: number;
  lockerId: number;
}

export interface VipLocker {
  title: string;
  start: string; // ISO date string
  end: string; // ISO date string
  status: number;
  duration: number; // in days
  locker: Locker;
}

export interface GetUserDashboardRes {
  insuranceService: InsuranceService;
  subscriptionService: SubscriptionService;
  vipLocker: VipLocker;
  lockers: number[];
}
