import {create} from 'zustand';
import {
  ReservationStoreItem,
  getReservationStore,
  addToReservationStore,
  removeFromReservationStore,
  updateReservationStore,
  clearReservationStore,
  getReservationKey,
  convertCartItemToReservationStoreItem,
} from '../utils/helpers/ReservationStorage';
import {CartItem} from '../utils/helpers/CartStorage';
import moment from 'jalali-moment';

interface ReservationStoreState {
  reservations: ReservationStoreItem[];
  isLoading: boolean;

  // Actions
  loadReservations: () => Promise<void>;
  addReservation: (item: ReservationStoreItem) => Promise<void>;
  removeReservation: (key: string) => Promise<void>;
  updateReservation: (
    key: string,
    updates: Partial<ReservationStoreItem>,
  ) => Promise<void>;
  clearReservations: () => Promise<void>;

  // Sync functions
  syncWithCart: (cartItems: CartItem[]) => Promise<void>;
  syncWithPreReserve: (preReservedItems: any[]) => Promise<void>;

  // Helper functions
  getReservationKey: (item: ReservationStoreItem) => string;
  findReservationByCartId: (cartId: string) => ReservationStoreItem | undefined;
  findReservationByKey: (key: string) => ReservationStoreItem | undefined;
}

// Helper to calculate dayName from date
const calculateDayName = (date: string): string => {
  try {
    const dateMoment = moment(date, 'YYYY-MM-DD');
    const dayOfWeek = dateMoment.day(); // 0 = Sunday, 1 = Monday, etc.

    const dayMap: Record<number, string> = {
      1: 'day1', // Monday
      2: 'day2', // Tuesday
      3: 'day3', // Wednesday
      4: 'day4', // Thursday
      5: 'day5', // Friday
      6: 'day6', // Saturday
      0: 'day7', // Sunday
    };

    return dayMap[dayOfWeek] || 'day1';
  } catch {
    return 'day1';
  }
};

export const useReservationStore = create<ReservationStoreState>(set => ({
  // Initial state
  reservations: [],
  isLoading: false,

  // Load reservations from storage
  loadReservations: async () => {
    set({isLoading: true});
    try {
      const reservations = await getReservationStore();
      set({reservations, isLoading: false});
    } catch (error) {
      console.error('Error loading reservations:', error);
      set({isLoading: false});
    }
  },

  // Add reservation
  addReservation: async (item: ReservationStoreItem) => {
    try {
      // Calculate dayName if not provided
      if (!item.dayName) {
        item.dayName = calculateDayName(item.date);
      }

      await addToReservationStore(item);
      const reservations = await getReservationStore();
      set({reservations});
    } catch (error) {
      console.error('Error adding reservation:', error);
      throw error;
    }
  },

  // Remove reservation
  removeReservation: async (key: string) => {
    try {
      await removeFromReservationStore(key);
      const reservations = await getReservationStore();
      set({reservations});
    } catch (error) {
      console.error('Error removing reservation:', error);
      throw error;
    }
  },

  // Update reservation
  updateReservation: async (
    key: string,
    updates: Partial<ReservationStoreItem>,
  ): Promise<ReservationStoreItem | undefined> => {
    try {
      await updateReservationStore(key, updates);
      const reservations = await getReservationStore();
      set({reservations});
      // Return the updated reservation
      return reservations.find(r => getReservationKey(r) === key);
    } catch (error) {
      console.error('Error updating reservation:', error);
      throw error;
    }
  },

  // Clear all reservations
  clearReservations: async () => {
    try {
      await clearReservationStore();
      set({reservations: []});
    } catch (error) {
      console.error('Error clearing reservations:', error);
      throw error;
    }
  },

  // Sync with cart items
  syncWithCart: async (cartItems: CartItem[]) => {
    try {
      const reservationCartItems = cartItems.filter(
        item => item.isReserve && item.reservationData,
      );

      const currentReservations = await getReservationStore();
      const reservationMap = new Map<string, ReservationStoreItem>();

      // Create map of current reservations by key
      currentReservations.forEach(r => {
        const key = getReservationKey(r);
        reservationMap.set(key, r);
      });

      // Process cart items
      for (const cartItem of reservationCartItems) {
        const storeItem = convertCartItemToReservationStoreItem(
          cartItem,
          calculateDayName(
            cartItem.reservationData!.reservedDate.split(' ')[0],
          ),
        );

        if (storeItem) {
          const key = getReservationKey(storeItem);
          const existing = reservationMap.get(key);

          if (existing) {
            // Update existing (especially cartId and quantities)
            await updateReservationStore(key, {
              cartId: storeItem.cartId,
              subProducts: storeItem.subProducts,
              modifiedQuantities: storeItem.modifiedQuantities,
              updatedAt: new Date().toISOString(),
            });
          } else {
            // Add new
            await addToReservationStore(storeItem);
          }
        }
      }

      // Remove reservations that are no longer in cart
      for (const reservation of currentReservations) {
        const key = getReservationKey(reservation);
        const existsInCart = reservationCartItems.some(cartItem => {
          const storeItem = convertCartItemToReservationStoreItem(cartItem);
          return storeItem && getReservationKey(storeItem) === key;
        });

        if (!existsInCart && reservation.cartId) {
          // If it was in cart but now removed, remove from store
          await removeFromReservationStore(key);
        }
      }

      // Reload reservations
      const updatedReservations = await getReservationStore();
      set({reservations: updatedReservations});
    } catch (error) {
      console.error('Error syncing with cart:', error);
    }
  },

  // Sync with preReserve API data (from timeSlots)
  syncWithPreReserve: async (preReservedItems: any[]) => {
    try {
      const currentReservations = await getReservationStore();
      const reservationMap = new Map<string, ReservationStoreItem>();

      // Create map of current reservations by key
      currentReservations.forEach(r => {
        const key = getReservationKey(r);
        reservationMap.set(key, r);
      });

      // Create set of valid keys from preReservedItems
      const validKeys = new Set<string>();
      for (const preReservedItem of preReservedItems) {
        // Convert date from Jalali to Gregorian if needed
        let date = preReservedItem.date;
        if (date.includes('/')) {
          // Jalali date format
          const [year, month, day] = date.split('/');
          date = moment(`${year}-${month}-${day}`, 'jYYYY-jMM-jDD').format(
            'YYYY-MM-DD',
          );
        }

        const key = getReservationKey({
          productId: preReservedItem.item?.id || preReservedItem.productId,
          date: date,
          fromTime: preReservedItem.fromTime,
          toTime: preReservedItem.toTime,
        });

        validKeys.add(key);

        const existing = reservationMap.get(key);

        if (!existing) {
          // If in preReservedItems but not in store, add it (but without cartId)
          const storeItem: ReservationStoreItem = {
            productId: preReservedItem.item?.id || preReservedItem.productId,
            productTitle: preReservedItem.item?.title || '',
            date: date,
            fromTime: preReservedItem.fromTime,
            toTime: preReservedItem.toTime,
            dayName:
              preReservedItem.dayName || calculateDayName(date),
            cartId: undefined, // Not in cart
            subProducts: preReservedItem.subProducts || [],
            modifiedQuantities: preReservedItem.modifiedQuantities || {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          await addToReservationStore(storeItem);
        } else {
          // Update existing if needed (but keep cartId if it exists)
          if (!existing.cartId) {
            // Only update if not in cart
            await updateReservationStore(key, {
              subProducts: preReservedItem.subProducts || existing.subProducts,
              modifiedQuantities:
                preReservedItem.modifiedQuantities || existing.modifiedQuantities,
              updatedAt: new Date().toISOString(),
            });
          }
        }
      }

      // Remove reservations that are no longer in preReservedItems (and not in cart)
      for (const reservation of currentReservations) {
        const key = getReservationKey(reservation);
        if (!validKeys.has(key) && !reservation.cartId) {
          // Not in preReservedItems and not in cart, remove it
          await removeFromReservationStore(key);
          console.log(
            '🗑️ [syncWithPreReserve] Removed reservation not in API or cart:',
            key,
          );
        }
      }

      // Reload reservations
      const updatedReservations = await getReservationStore();
      set({reservations: updatedReservations});
    } catch (error) {
      console.error('Error syncing with preReserve:', error);
    }
  },

  // Helper: Get reservation key
  getReservationKey: (item: ReservationStoreItem) => {
    return getReservationKey(item);
  },

  // Helper: Find reservation by cartId
  findReservationByCartId: (cartId: string) => {
    const state = useReservationStore.getState();
    return state.reservations.find(r => r.cartId === cartId);
  },

  // Helper: Find reservation by key
  findReservationByKey: (key: string) => {
    const state = useReservationStore.getState();
    return state.reservations.find(r => getReservationKey(r) === key);
  },
}));

