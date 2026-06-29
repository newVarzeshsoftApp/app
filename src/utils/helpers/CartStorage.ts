import {Platform} from 'react-native';
import type EncryptedStorageType from 'react-native-encrypted-storage';
import {
  Contractors,
  PriceList,
  Product,
} from '../../services/models/response/ProductResService';
import {
  convertCartItemToReservationStoreItem,
  getReservationKey,
} from './ReservationStorage';
import {useReservationStore} from '../../store/reservationStore';
import moment from 'jalali-moment';
import {PackageCartData} from './packageContractorStore';

let EncryptedStorage: typeof EncryptedStorageType;

if (Platform.OS !== 'web') {
  EncryptedStorage = require('react-native-encrypted-storage').default;
}

// Flag to prevent syncing back to ReservationStore from Cart during sync operations
export let isSyncingCartToStore = false;

export const setSyncingCartToStore = (value: boolean) => {
  isSyncingCartToStore = value;
};

// Reservation sub-product structure
export interface ReservationSecondaryService {
  user: number;
  product: number;
  start: string;
  end: string;
  discount: number;
  type: number;
  tax: number;
  price: number;
  quantity?: number; // Quantity of this sub-product
  subProductId?: number; // Original sub-product ID from PreReserveBottomSheet
}

// Reservation data structure
export interface ReservationData {
  reservedDate: string; // "2025-12-15 00:00"
  reservedStartTime: string; // "07:00"
  reservedEndTime: string; // "08:00"
  secondaryServices?: ReservationSecondaryService[];
  description?: string | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
  SelectedPriceList?: PriceList;
  SelectedContractor?: Contractors | null;
  CartId?: string;
  submitAt?: string;
  // Reservation-specific fields
  isReserve?: boolean;
  reservationData?: ReservationData;
  // Group class room fields
  isGroupClassRoom?: boolean;
  groupClassRoomData?: GroupClassRoomCartData;
  packageContractorData?: PackageCartData;
  addedToCartAt?: string; // ISO timestamp when item was added to cart (for expiration check)
}

export interface GroupClassRoomCartScheduleRow {
  daysLabel: string;
  timeLabel: string;
}

export interface GroupClassRoomCartData {
  groupClassRoomId: number;
  contractorId: number;
  waitingForGroupClass?: boolean;
  selectedDays?: number[];
  contractorName?: string;
  contractorImageName?: string;
  contractorGender?: number;
  scheduleRows?: GroupClassRoomCartScheduleRow[];
  scheduleDaysLabel?: string;
  scheduleTimeLabel?: string;
}

const CART_KEY = 'shopping_cart';

// Generate unique ID without uuid dependency
// This ensures each cart item has a unique identifier
// Format: timestamp (base36) + random string (base36)
// This guarantees uniqueness even for items added in the same millisecond
const generateCartId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2);
  const uniqueId = timestamp + random;

  // Log for debugging (can be removed in production)
  console.log('🆔 [generateCartId] Generated unique CartId:', uniqueId);

  return uniqueId;
};

// Storage operations
export const setCartStorage = async (cart: CartItem[]): Promise<void> => {
  const cartString = JSON.stringify(cart);
  if (Platform.OS === 'web') {
    localStorage.setItem(CART_KEY, cartString);
  } else {
    await EncryptedStorage?.setItem(CART_KEY, cartString);
  }
};

export const getCart = async (): Promise<CartItem[]> => {
  try {
    if (Platform.OS === 'web') {
      const cart = localStorage.getItem(CART_KEY);
      return cart ? JSON.parse(cart) : [];
    }
    const cart = await EncryptedStorage?.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error retrieving cart:', error);
    return [];
  }
};

export const addCart = async (
  item: Omit<CartItem, 'CartId' | 'quantity'> & {quantity?: number},
): Promise<void> => {
  try {
    const cart = await getCart();

    // برای آیتم‌های رزروی، باید همه آیتم‌های رزروی را چک کنیم
    const isReservationItem = item.isReserve && item.reservationData;

    // Group class room items must never merge with regular service items (same product.id).
    const isGroupClassRoomItem = item.isGroupClassRoom && item.groupClassRoomData;

    if (isGroupClassRoomItem) {
      const newGroupClassRoomData = item.groupClassRoomData!;
      const hasSameSelectedDays = (
        existingDays?: number[],
        nextDays?: number[],
      ) => {
        const left = [...(existingDays ?? [])].sort((a, b) => a - b);
        const right = [...(nextDays ?? [])].sort((a, b) => a - b);

        if (left.length !== right.length) {
          return false;
        }

        return left.every((day, index) => day === right[index]);
      };

      const duplicateIndex = cart.findIndex(cartItem => {
        if (!cartItem.isGroupClassRoom || !cartItem.groupClassRoomData) {
          return false;
        }

        const existingGroupClassRoomData = cartItem.groupClassRoomData;

        return (
          existingGroupClassRoomData.groupClassRoomId ===
            newGroupClassRoomData.groupClassRoomId &&
          existingGroupClassRoomData.contractorId ===
            newGroupClassRoomData.contractorId &&
          cartItem.SelectedPriceList?.id === item.SelectedPriceList?.id &&
          hasSameSelectedDays(
            existingGroupClassRoomData.selectedDays,
            newGroupClassRoomData.selectedDays,
          )
        );
      });

      if (duplicateIndex !== -1) {
        cart[duplicateIndex] = {
          ...cart[duplicateIndex],
          ...item,
          quantity: 1,
          CartId: cart[duplicateIndex].CartId,
          submitAt: cart[duplicateIndex].submitAt,
          addedToCartAt:
            cart[duplicateIndex].addedToCartAt ?? new Date().toISOString(),
        };
      } else {
        cart.push({
          ...item,
          quantity: 1,
          CartId: generateCartId(),
          submitAt: new Date().toISOString(),
          addedToCartAt: new Date().toISOString(),
        });
      }

      await setCartStorage(cart);
      return;
    }

    if (isReservationItem) {
      // برای رزروها: چک می‌کنیم که آیا همان خدمت با همان تاریخ و ساعت وجود دارد
      const newReservation = item.reservationData!;
      const duplicateReservation = cart.find(cartItem => {
        if (
          !cartItem.isReserve ||
          !cartItem.reservationData ||
          cartItem.product?.id !== item.product?.id
        ) {
          return false;
        }

        const existingReservation = cartItem.reservationData!;
        const isSameDate =
          existingReservation.reservedDate === newReservation.reservedDate;
        const isSameTime =
          existingReservation.reservedStartTime ===
            newReservation.reservedStartTime &&
          existingReservation.reservedEndTime ===
            newReservation.reservedEndTime;

        return isSameDate && isSameTime;
      });

      if (duplicateReservation) {
        // همان خدمت با همان تاریخ و ساعت قبلاً اضافه شده است
        // به‌جای خطا، ایتم موجود را به‌روز می‌کنیم (مخصوصاً secondaryServices)
        console.log(
          '🔄 [addCart] Duplicate reservation detected - updating existing item',
          {
            productId: item.product?.id,
            date: newReservation.reservedDate,
            startTime: newReservation.reservedStartTime,
            endTime: newReservation.reservedEndTime,
            cartId: duplicateReservation.CartId,
          },
        );

        // Update existing reservation with new data (especially secondaryServices)
        const existingIndex = cart.findIndex(
          cartItem => cartItem.CartId === duplicateReservation.CartId,
        );

        if (existingIndex !== -1) {
          // Update reservation data, especially secondaryServices
          // Keep original addedToCartAt if it exists, otherwise set it now
          cart[existingIndex] = {
            ...cart[existingIndex],
            reservationData: {
              ...cart[existingIndex].reservationData!,
              secondaryServices: newReservation.secondaryServices,
            },
            addedToCartAt:
              cart[existingIndex].addedToCartAt || new Date().toISOString(), // Preserve original timestamp
          };

          await setCartStorage(cart);

          // Sync with ReservationStore
          try {
            const storeItem = convertCartItemToReservationStoreItem(
              cart[existingIndex],
            );
            if (storeItem) {
              // Calculate dayName from date
              const date =
                cart[existingIndex].reservationData!.reservedDate.split(' ')[0];
              const dateMoment = moment(date, 'YYYY-MM-DD');
              const dayOfWeek = dateMoment.day();
              const dayMap: Record<number, string> = {
                1: 'day1',
                2: 'day2',
                3: 'day3',
                4: 'day4',
                5: 'day5',
                6: 'day6',
                0: 'day7',
              };
              storeItem.dayName = dayMap[dayOfWeek] || 'day1';

              const key = getReservationKey(storeItem);
              const {updateReservation, findReservationByKey} =
                useReservationStore.getState();
              // Find existing reservation to preserve createdAt
              const existingReservation = findReservationByKey(key);
              await updateReservation(key, {
                cartId: storeItem.cartId, // Ensure cartId is updated
                subProducts: storeItem.subProducts,
                modifiedQuantities: storeItem.modifiedQuantities,
                createdAt:
                  existingReservation?.createdAt ||
                  storeItem.createdAt ||
                  new Date().toISOString(), // Preserve original createdAt
                updatedAt: new Date().toISOString(),
              });
              console.log(
                '✅ [addCart] Updated existing reservation in ReservationStore',
              );
            }
          } catch (error) {
            console.error(
              '⚠️ [addCart] Error syncing updated reservation with ReservationStore:',
              error,
            );
            // Don't throw - cart operation should succeed even if sync fails
          }

          console.log('✅ [addCart] Updated existing reservation item');
          return; // Exit early, don't add new item
        }
      }

      // اگر تکراری نبود، آیتم جدید اضافه می‌شود
      console.log('✅ [addCart] Adding new reservation item');
      const newItem: CartItem = {
        ...item,
        quantity: 1, // برای رزروها همیشه quantity = 1
        CartId: generateCartId(),
        submitAt: new Date().toISOString(),
        addedToCartAt: new Date().toISOString(), // Store when item was added for expiration check
      };
      cart.push(newItem);

      // Sync with ReservationStore
      try {
        const storeItem = convertCartItemToReservationStoreItem(newItem);
        if (storeItem) {
          // Calculate dayName from date
          const date = newItem.reservationData!.reservedDate.split(' ')[0];
          const dateMoment = moment(date, 'YYYY-MM-DD');
          const dayOfWeek = dateMoment.day();
          const dayMap: Record<number, string> = {
            1: 'day1',
            2: 'day2',
            3: 'day3',
            4: 'day4',
            5: 'day5',
            6: 'day6',
            0: 'day7',
          };
          storeItem.dayName = dayMap[dayOfWeek] || 'day1';

          // Add to ReservationStore
          const {addReservation} = useReservationStore.getState();
          await addReservation(storeItem);
          console.log('✅ [addCart] Synced with ReservationStore');
        }
      } catch (error) {
        console.error(
          '⚠️ [addCart] Error syncing with ReservationStore:',
          error,
        );
        // Don't throw - cart operation should succeed even if sync fails
      }
    } else {
      // برای آیتم‌های غیر رزروی
      const existingItemIndex = cart.findIndex(
        cartItem =>
          !cartItem.isGroupClassRoom &&
          cartItem.product?.id === item.product?.id,
      );

      if (existingItemIndex !== -1) {
        // اگر محصول وجود داشت
        const existingItem = cart[existingItemIndex];
        // برای آیتم‌های غیر رزروی، چک می‌کنیم PriceList و Contractor
        const isSamePriceList =
          existingItem?.SelectedPriceList?.id === item?.SelectedPriceList?.id;

        const isSameContractor =
          existingItem?.SelectedContractor?.id === item?.SelectedContractor?.id;

        if (isSamePriceList && isSameContractor) {
          // اگر همه موارد یکسان بود، quantity را افزایش می‌دهیم
          existingItem.quantity += item?.quantity ?? 1;
        } else {
          // اگر متفاوت بودند، آیتم جدید اضافه میشه
          const newItem: CartItem = {
            ...item,
            quantity: item?.quantity ?? 1,
            CartId: generateCartId(),
            submitAt: new Date().toISOString(),
          };
          cart.push(newItem);
        }
      } else {
        // اگر محصول وجود نداشت، آیتم جدید اضافه میشه
        const newItem: CartItem = {
          ...item,
          quantity: item.quantity ?? 1,
          CartId: generateCartId(),
          submitAt: new Date().toISOString(),
        };
        cart.push(newItem);
      }
    }

    // ذخیره‌سازی سبد خرید
    await setCartStorage(cart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw new Error('Failed to add item to cart');
  }
};

export const removeCart = async (cartId: string): Promise<void> => {
  try {
    const cart = await getCart();
    const itemToRemove = cart.find(item => item.CartId === cartId);

    const updatedCart = cart.filter(item => item.CartId !== cartId);
    await setCartStorage(updatedCart);

    // Sync with ReservationStore if it was a reservation item
    if (itemToRemove?.isReserve && itemToRemove.reservationData) {
      try {
        const storeItem = convertCartItemToReservationStoreItem(itemToRemove);
        if (storeItem) {
          const key = getReservationKey(storeItem);
          const {removeReservation} = useReservationStore.getState();
          await removeReservation(key);
          console.log('✅ [removeCart] Synced with ReservationStore');
        }
      } catch (error) {
        console.error(
          '⚠️ [removeCart] Error syncing with ReservationStore:',
          error,
        );
        // Don't throw - cart operation should succeed even if sync fails
      }
    }
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw new Error('Failed to remove item from cart');
  }
};

export const updateQuantity = async (
  cartId: string,
  quantity: number,
): Promise<void> => {
  try {
    const cart = await getCart();
    const itemIndex = cart.findIndex(item => item.CartId === cartId);

    if (itemIndex === -1) {
      throw new Error('Cart item not found');
    }

    if (quantity < 1) {
      throw new Error('Invalid quantity');
    }

    cart[itemIndex].quantity = quantity;
    await setCartStorage(cart);
  } catch (error) {
    console.error('Error updating quantity:', error);
    throw new Error('Failed to update item quantity');
  }
};

export const updateReservationData = async (
  cartId: string,
  reservationData: ReservationData,
): Promise<void> => {
  try {
    const cart = await getCart();
    const itemIndex = cart.findIndex(item => item.CartId === cartId);

    if (itemIndex === -1) {
      throw new Error(`Cart item not found with CartId: ${cartId}`);
    }

    // Log to ensure we're updating the correct item
    const itemToUpdate = cart[itemIndex];
    console.log('🔄 [updateReservationData] Updating reservation data:', {
      cartId,
      productId: itemToUpdate.product?.id,
      reservedDate: reservationData.reservedDate,
      reservedStartTime: reservationData.reservedStartTime,
      reservedEndTime: reservationData.reservedEndTime,
      secondaryServicesCount: reservationData.secondaryServices?.length || 0,
    });

    const updatedItem = {
      ...cart[itemIndex],
      reservationData,
    };

    cart[itemIndex] = updatedItem;
    await setCartStorage(cart);

    console.log('✅ [updateReservationData] Successfully updated cart item:', {
      cartId,
      productId: itemToUpdate.product?.id,
    });

    // NOTE: Do NOT sync to ReservationStore here to avoid circular updates
    // The CartServiceCard listener will handle syncing when quantities change
  } catch (error) {
    console.error(
      '❌ [updateReservationData] Error updating reservation data:',
      {
        cartId,
        error,
      },
    );
    throw new Error('Failed to update reservation data');
  }
};

export const getCartItems = async (): Promise<CartItem[]> => {
  return await getCart();
};

export const clearCart = async (): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(CART_KEY);
    } else {
      await EncryptedStorage?.removeItem(CART_KEY);
    }

    // Clear all reservations from ReservationStore when cart is cleared
    try {
      const {clearReservations} = useReservationStore.getState();
      await clearReservations();
      console.log('✅ [clearCart] Cleared ReservationStore');
    } catch (error) {
      console.error('⚠️ [clearCart] Error clearing ReservationStore:', error);
      // Don't throw - cart operation should succeed even if sync fails
    }
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw new Error('Failed to clear cart');
  }
};
