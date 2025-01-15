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

export interface CartItem {
  product: Product;
  quantity: number;
  SelectedPriceList?: PriceList;
  SelectedContractor?: Contractors | null;
  CartId: string;
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

    // پیدا کردن محصول مشابه در سبد خرید
    const existingItemIndex = cart.findIndex(
      cartItem => cartItem.product?.id === item.product?.id,
    );

    if (existingItemIndex !== -1) {
      // اگر محصول وجود داشت
      const existingItem = cart[existingItemIndex];

      const isSamePriceList =
        existingItem.SelectedPriceList?.id === item.SelectedPriceList?.id;

      const isSameContractor =
        existingItem.SelectedContractor?.id === item.SelectedContractor?.id;

      if (isSamePriceList && isSameContractor) {
        // اگر همه موارد یکسان بود، quantity را افزایش می‌دهیم
        existingItem.quantity += item.quantity ?? 1;
      } else {
        // اگر متفاوت بودند، آیتم جدید اضافه میشه
        const newItem: CartItem = {
          ...item,
          quantity: item.quantity ?? 1,
          CartId: generateCartId(),
        };
        cart.push(newItem);
      }
    } else {
      // اگر محصول وجود نداشت، آیتم جدید اضافه میشه
      const newItem: CartItem = {
        ...item,
        quantity: item.quantity ?? 1,
        CartId: generateCartId(),
      };
      cart.push(newItem);
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
