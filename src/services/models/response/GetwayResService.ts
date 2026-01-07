export interface GetGatewayRes {
  enable: boolean;
  id: number;
  updatedAt: string; // ISO date string
  createdAt: string; // ISO date string
  deletedAt: string | null; // ISO date string or null
  title: string;
  token: string;
  type: number;
  icon: string | null;
  description: string | null;
  bank: {
    title: string;
    bank: string;
    accountNumber: string;
    cartNumber: string;
    shebaNumber: string;
    usageType: number;
    enable: boolean;
    organizationUnits: unknown | null; // Replace `unknown` with a specific type if known
    id: number;
    updatedAt: string; // ISO date string
    createdAt: string; // ISO date string
    deletedAt: string | null; // ISO date string or null
    posId: number;
  };
}
