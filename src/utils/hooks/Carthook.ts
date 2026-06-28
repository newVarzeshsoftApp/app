import {useState, useCallback, useEffect, useMemo} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {
  getCart,
  addCart,
  removeCart,
  updateQuantity,
  updateReservationData,
  clearCart,
  CartItem,
  ReservationData,
  setSyncingCartToStore,
} from '../helpers/CartStorage';
import {releaseGroupClassRoomFromCartItem} from '../helpers/groupClassRoomCartHelpers';
import {logGroupClassRoomReleaseFlow} from '../helpers/groupClassRoomSseDebug';
import {useReservationStore} from '../../store/reservationStore';
import {useAuth} from './useAuth';

interface CartSummary {
  totalItems: number;
  items: CartItem[];
}

export const useCart = () => {
  const queryClient = useQueryClient();
  const {profile, SKU: organization} = useAuth();
  const [cartSummary, setCartSummary] = useState<CartSummary>({
    totalItems: 0,
    items: [],
  });
  const sortedCartItems = useMemo(() => {
    return [...cartSummary.items].sort(
      (a, b) =>
        new Date(b?.submitAt!).getTime() - new Date(a?.submitAt!).getTime(),
    );
  }, [cartSummary.items]);

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
    async (
      cartId: string,
      options?: {skipGroupClassRoomRelease?: boolean},
    ) => {
      try {
        const cart = await getCart();
        const itemToRemove = cart.find(item => item.CartId === cartId);

        logGroupClassRoomReleaseFlow('removeFromCart called', {
          cartId,
          skipGroupClassRoomRelease: options?.skipGroupClassRoomRelease ?? false,
          isGroupClassRoom: itemToRemove?.isGroupClassRoom ?? false,
          groupClassRoomId: itemToRemove?.groupClassRoomData?.groupClassRoomId,
          contractorId: itemToRemove?.groupClassRoomData?.contractorId,
          userId: profile?.id,
        });

        if (
          !options?.skipGroupClassRoomRelease &&
          itemToRemove?.isGroupClassRoom &&
          itemToRemove.groupClassRoomData &&
          profile?.id
        ) {
          await releaseGroupClassRoomFromCartItem({
            item: itemToRemove,
            userId: profile.id,
            organization,
            queryClient,
          });
        } else if (
          itemToRemove?.isGroupClassRoom &&
          !options?.skipGroupClassRoomRelease
        ) {
          logGroupClassRoomReleaseFlow('release skipped (missing user or data)', {
            cartId,
            hasGroupClassRoomData: !!itemToRemove.groupClassRoomData,
            userId: profile?.id,
          });
        }

        await removeCart(cartId);
        await refreshCart();

        logGroupClassRoomReleaseFlow('removeFromCart finished', {cartId});
      } catch (error) {
        logGroupClassRoomReleaseFlow('removeFromCart FAILED', {
          cartId,
          error:
            error instanceof Error
              ? {name: error.name, message: error.message}
              : error,
        });
        console.error('Failed to remove item from cart:', error);
      }
    },
    [organization, profile?.id, queryClient, refreshCart],
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

  // Update reservation data
  const updateReservationItemData = useCallback(
    async ({
      cartId,
      reservationData,
    }: {
      cartId: string;
      reservationData: ReservationData;
    }) => {
      try {
        await updateReservationData(cartId, reservationData);
        await refreshCart();
      } catch (error) {
        console.error('Failed to update reservation data:', error);
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

  // Sync ReservationStore when cart changes
  const {syncWithCart} = useReservationStore();

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return {
    items: sortedCartItems,
    totalItems: cartSummary.totalItems,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    updateReservationItemData,
    emptyCart,
    refreshCart,
  };
};
