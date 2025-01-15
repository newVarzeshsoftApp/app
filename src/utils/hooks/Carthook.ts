import {useState, useCallback, useEffect} from 'react';
import {
  getCart,
  addCart,
  removeCart,
  updateQuantity,
  clearCart,
  CartItem,
} from '../helpers/CartStorage';

interface CartSummary {
  totalItems: number;
  items: CartItem[];
}

export const useCart = () => {
  const [cartSummary, setCartSummary] = useState<CartSummary>({
    totalItems: 0,
    items: [],
  });

  // Refresh cart
  const refreshCart = useCallback(async () => {
    try {
      const items = await getCart();
      setCartSummary({
        items,
        totalItems: items.length,
      });
    } catch (error) {
      console.error('Failed to refresh cart:', error);
    }
  }, []);

  // Add item to cart
  const addToCart = useCallback(
    async (
      item: Omit<CartItem, 'CartId' | 'quantity'> & {quantity?: number},
    ) => {
      try {
        await addCart(item);
        await refreshCart();
      } catch (error) {
        console.error('Failed to add item to cart:', error);
      }
    },
    [refreshCart],
  );

  // Remove item from cart
  const removeFromCart = useCallback(
    async (cartId: string) => {
      try {
        await removeCart(cartId);
        await refreshCart();
      } catch (error) {
        console.error('Failed to remove item from cart:', error);
      }
    },
    [refreshCart],
  );

  // Update item quantity
  const updateItemQuantity = useCallback(
    async ({cartId, quantity}: {cartId: string; quantity: number}) => {
      try {
        await updateQuantity(cartId, quantity);
        await refreshCart();
      } catch (error) {
        console.error('Failed to update item quantity:', error);
      }
    },
    [refreshCart],
  );

  // Clear cart
  const emptyCart = useCallback(async () => {
    try {
      await clearCart();
      setCartSummary({
        items: [],
        totalItems: 0,
      });
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return {
    items: cartSummary.items,
    totalItems: cartSummary.totalItems,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    emptyCart,
    refreshCart,
  };
};
