import {Platform} from 'react-native';
import type EncryptedStorageType from 'react-native-encrypted-storage';
import {
  Contractors,
  PriceList,
  Product,
} from '../../services/models/response/ProductResService';

let EncryptedStorage: typeof EncryptedStorageType;

if (Platform.OS !== 'web') {
  EncryptedStorage = require('react-native-encrypted-storage').default;
}

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
}

const CART_KEY = 'shopping_cart';

// Generate unique ID without uuid dependency
const generateCartId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Storage operations
const setCartStorage = async (cart: CartItem[]): Promise<void> => {
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
        console.warn(
          '⚠️ [addCart] Duplicate reservation detected - same service, date, and time already exists',
          {
            productId: item.product?.id,
            date: newReservation.reservedDate,
            startTime: newReservation.reservedStartTime,
            endTime: newReservation.reservedEndTime,
          },
        );
        // برای رزروها، نمی‌توانیم quantity را افزایش دهیم
        // فقط از اضافه شدن جلوگیری می‌کنیم (یا می‌توانیم خطا بدهیم)
        throw new Error(
          'این رزرو قبلاً به سبد خرید اضافه شده است. نمی‌توانید همان خدمت را در همان تاریخ و ساعت دوباره رزرو کنید.',
        );
      }

      // اگر تکراری نبود، آیتم جدید اضافه می‌شود
      console.log('✅ [addCart] Adding new reservation item');
      const newItem: CartItem = {
        ...item,
        quantity: 1, // برای رزروها همیشه quantity = 1
        CartId: generateCartId(),
        submitAt: new Date().toISOString(),
      };
      cart.push(newItem);
    } else {
      // برای آیتم‌های غیر رزروی
      const existingItemIndex = cart.findIndex(
        cartItem => cartItem.product?.id === item.product?.id,
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
    const updatedCart = cart.filter(item => item.CartId !== cartId);
    await setCartStorage(updatedCart);
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
      throw new Error('Cart item not found');
    }

    cart[itemIndex].reservationData = reservationData;
    await setCartStorage(cart);
  } catch (error) {
    console.error('Error updating reservation data:', error);
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
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw new Error('Failed to clear cart');
  }
};
