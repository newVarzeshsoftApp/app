import {Platform} from 'react-native';
import type EncryptedStorageType from 'react-native-encrypted-storage';

let EncryptedStorage: typeof EncryptedStorageType;

if (Platform.OS !== 'web') {
  EncryptedStorage = require('react-native-encrypted-storage').default;
}

// Reservation store item structure
export interface ReservationStoreItem {
  productId: number;
  productTitle: string;
  date: string; // Gregorian: "2025-12-23"
  fromTime: string; // "07:00"
  toTime: string; // "08:00"
  dayName: string; // "day1", "day2", etc.
  cartId?: string; // اگر در سبد خرید است
  subProducts: any[];
  modifiedQuantities: Record<number, number>;
  createdAt: string;
  updatedAt: string;
}

const RESERVATION_STORE_KEY = 'reservation_store';

// Generate unique key for reservation
export const getReservationKey = (item: {
  productId: number;
  date: string;
  fromTime: string;
  toTime: string;
}): string => {
  return `${item.productId}-${item.date}-${item.fromTime}-${item.toTime}`;
};

// Storage operations
const setReservationStorage = async (
  reservations: ReservationStoreItem[],
): Promise<void> => {
  const reservationsString = JSON.stringify(reservations);
  if (Platform.OS === 'web') {
    localStorage.setItem(RESERVATION_STORE_KEY, reservationsString);
  } else {
    await EncryptedStorage?.setItem(RESERVATION_STORE_KEY, reservationsString);
  }
};

export const getReservationStore = async (): Promise<ReservationStoreItem[]> => {
  try {
    if (Platform.OS === 'web') {
      const reservations = localStorage.getItem(RESERVATION_STORE_KEY);
      return reservations ? JSON.parse(reservations) : [];
    }
    const reservations = await EncryptedStorage?.getItem(RESERVATION_STORE_KEY);
    return reservations ? JSON.parse(reservations) : [];
  } catch (error) {
    console.error('Error retrieving reservation store:', error);
    return [];
  }
};

export const addToReservationStore = async (
  item: ReservationStoreItem,
): Promise<void> => {
  try {
    const reservations = await getReservationStore();
    const key = getReservationKey(item);

    // Check if already exists
    const existingIndex = reservations.findIndex(
      r => getReservationKey(r) === key,
    );

    if (existingIndex !== -1) {
      // Update existing
      reservations[existingIndex] = {
        ...reservations[existingIndex],
        ...item,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Add new
      reservations.push(item);
    }

    await setReservationStorage(reservations);
  } catch (error) {
    console.error('Error adding to reservation store:', error);
    throw new Error('Failed to add item to reservation store');
  }
};

export const removeFromReservationStore = async (
  key: string,
): Promise<void> => {
  try {
    const reservations = await getReservationStore();
    const filtered = reservations.filter(r => getReservationKey(r) !== key);
    await setReservationStorage(filtered);
  } catch (error) {
    console.error('Error removing from reservation store:', error);
    throw new Error('Failed to remove item from reservation store');
  }
};

export const updateReservationStore = async (
  key: string,
  updates: Partial<ReservationStoreItem>,
): Promise<void> => {
  try {
    const reservations = await getReservationStore();
    const index = reservations.findIndex(r => getReservationKey(r) === key);

    if (index !== -1) {
      reservations[index] = {
        ...reservations[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await setReservationStorage(reservations);
    }
  } catch (error) {
    console.error('Error updating reservation store:', error);
    throw new Error('Failed to update item in reservation store');
  }
};

export const clearReservationStore = async (): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(RESERVATION_STORE_KEY);
    } else {
      await EncryptedStorage?.removeItem(RESERVATION_STORE_KEY);
    }
  } catch (error) {
    console.error('Error clearing reservation store:', error);
    throw new Error('Failed to clear reservation store');
  }
};

// Helper to extract modifiedQuantities from secondaryServices
export const extractQuantitiesFromSecondaryServices = (
  secondaryServices?: Array<{
    product: number;
    quantity?: number;
    subProductId?: number;
  }>,
): Record<number, number> => {
  if (!secondaryServices) return {};

  const quantities: Record<number, number> = {};
  secondaryServices.forEach(service => {
    if (service.subProductId && service.quantity) {
      quantities[service.subProductId] = service.quantity;
    }
  });

  return quantities;
};

// Helper to convert CartItem to ReservationStoreItem
export const convertCartItemToReservationStoreItem = (
  cartItem: {
    product: {id: number; title: string};
    CartId?: string;
    reservationData?: {
      reservedDate: string;
      reservedStartTime: string;
      reservedEndTime: string;
      secondaryServices?: Array<{
        product: number;
        quantity?: number;
        subProductId?: number;
        [key: string]: any;
      }>;
    };
  },
  dayName?: string,
): ReservationStoreItem | null => {
  if (!cartItem.reservationData) return null;

  const date = cartItem.reservationData.reservedDate.split(' ')[0];
  const modifiedQuantities = extractQuantitiesFromSecondaryServices(
    cartItem.reservationData.secondaryServices,
  );

  // Extract subProducts from secondaryServices
  const subProducts =
    cartItem.reservationData.secondaryServices?.map(service => ({
      id: service.subProductId,
      product: {id: service.product},
      quantity: service.quantity || 0,
      ...service,
    })) || [];

  return {
    productId: cartItem.product.id,
    productTitle: cartItem.product.title,
    date,
    fromTime: cartItem.reservationData.reservedStartTime,
    toTime: cartItem.reservationData.reservedEndTime,
    dayName: dayName || '', // Will be calculated if not provided
    cartId: cartItem.CartId,
    subProducts,
    modifiedQuantities,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

