import React, {createContext, useContext} from 'react';
import {CartItem} from './helpers/CartStorage';
import {useCart} from './hooks/Carthook';

interface CartContextProps {
  items: CartItem[];
  totalItems: number;
  addToCart: (
    item: Omit<CartItem, 'CartId' | 'quantity'> & {quantity?: number},
  ) => Promise<void>;
  removeFromCart: (cartId: string) => Promise<void>;
  updateItemQuantity: ({
    cartId,
    quantity,
  }: {
    cartId: string;
    quantity: number;
  }) => Promise<void>;
  emptyCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextProps | null>(null);

export const CartProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const {
    items,
    totalItems,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    emptyCart,
    refreshCart,
  } = useCart();

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        addToCart,
        removeFromCart,
        updateItemQuantity,
        emptyCart,
        refreshCart,
      }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCartContext must be used inside CartProvider');
  }
  return ctx;
};
