import {useState, useCallback, useEffect, useMemo} from 'react';
import {
  getCart,
  addCart,
  removeCart,
  updateQuantity,
  updateReservationData,
  clearCart,
  CartItem,
  ReservationData,
} from '../helpers/CartStorage';
import {useReservationStore} from '../../store/reservationStore';

interface CartSummary {
  totalItems: number;
  items: CartItem[];
}

export const useCart = () => {
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

  // Sync ReservationStore with cart items whenever cart changes
  useEffect(() => {
    if (cartSummary.items.length > 0) {
      syncWithCart(cartSummary.items).catch(error => {
        console.error('Error syncing ReservationStore with cart:', error);
      });
    }
  }, [cartSummary.items, syncWithCart]);

  // Listen to ReservationStore changes and update cart items if needed
  useEffect(() => {
    const unsubscribe = useReservationStore.subscribe(
      state => state.reservations,
      async () => {
        // When ReservationStore changes, check if any cart items need updating
        const reservations = useReservationStore.getState().reservations;
        const {getCart, updateReservationData} = await import(
          '../helpers/CartStorage'
        );
        const cart = await getCart();

        let hasUpdates = false;

        // Update cart items from ReservationStore
        for (const reservation of reservations) {
          if (!reservation.cartId) continue;

          const cartItem = cart.find(item => item.CartId === reservation.cartId);
          if (!cartItem || !cartItem.isReserve || !cartItem.reservationData) {
            continue;
          }

          // Check if modifiedQuantities have changed
          const storeQuantities = reservation.modifiedQuantities || {};
          // Extract quantities from cart item's secondaryServices
          const cartQuantities: Record<number, number> = {};
          (cartItem.reservationData.secondaryServices || []).forEach(service => {
            if (service.subProductId && service.quantity) {
              cartQuantities[service.subProductId] = service.quantity;
            }
          });

          if (
            JSON.stringify(storeQuantities) !== JSON.stringify(cartQuantities)
          ) {
            // Update cart item with new quantities from ReservationStore
            // Convert modifiedQuantities to secondaryServices format
            const secondaryServices: any[] = [];
            const subProducts = cartItem.product?.subProducts || [];

            Object.entries(storeQuantities).forEach(([subProductId, quantity]) => {
              if (quantity > 0) {
                const subProduct = subProducts.find(
                  sp => sp.id === Number(subProductId),
                );

                if (subProduct) {
                  const reservedDate = cartItem.reservationData!.reservedDate || '';
                  const startDate = reservedDate.split(' ')[0] || '';
                  const duration = subProduct.product?.duration || 1;
                  const moment = require('jalali-moment');
                  const endDate = startDate
                    ? moment(startDate).add(duration, 'days').format('YYYY-MM-DD')
                    : '';

                  secondaryServices.push({
                    user: 0,
                    product: subProduct.productId || subProduct.product?.id,
                    start: startDate,
                    end: endDate,
                    discount: subProduct.discount || 0,
                    type: subProduct.product?.type || 1,
                    tax: subProduct.tax || 0,
                    price: subProduct.product?.price || subProduct.amount || 0,
                    quantity: quantity,
                    subProductId: subProduct.id,
                  });
                }
              }
            });

            // Update cart item
            await updateReservationData(reservation.cartId, {
              ...cartItem.reservationData,
              secondaryServices: secondaryServices,
            });

            hasUpdates = true;
            console.log(
              '✅ [useCart] Updated cart item from ReservationStore:',
              reservation.cartId,
            );
          }
        }

        // If there are updates, refresh cart to update UI
        if (hasUpdates) {
          await refreshCart();
        }
      },
    );

    return () => {
      unsubscribe();
    };
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
