export interface SecondaryServicesReserveDto {
  user: number;
  product: number;
  price: number;
  discount: number;
  tax: number;
  start: string; // "2025-03-21"
  end: string; // "2025-03-21"
  transactions?: {
    type?: number;
    source?: number;
    amount?: number;
    user?: number;
    submitAt?: string;
    fromGuest?: boolean;
  };
}

export interface ReserveItemDto {
  user: number;
  product: number;
  price: number;
  discount: number;
  tax: number;
  start: string; // "2025-03-21"
  end: string; // "2025-03-21"
  reservedDate: string; // "2025-03-21"
  reservedStartTime: string; // "09:00"
  reservedEndTime: string; // "10:00"
  secondaryServices?: SecondaryServicesReserveDto[];
}

export interface CreateReserveDto {
  submitAt: string; // "2025-03-20 11:10"
  items: ReserveItemDto[];
}

export interface CancelReservationDto {
  id: number; // order id
  penaltyAmount?: number; // penalty amount
}
