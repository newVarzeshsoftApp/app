import React, {useCallback} from 'react';
import {Text} from 'react-native';
import {CartItem} from '../../../../utils/helpers/CartStorage';

interface CartItemsListProps {
  items: CartItem[];
  cardComponentMapping: Record<number, React.FC<{data: CartItem}>>;
}

const CartItemsList: React.FC<CartItemsListProps> = ({
  items,
  cardComponentMapping,
}) => {
  const renderItem = useCallback(
    ({item}: {item: CartItem}) => {
      // Check if product exists and has type
      if (!item.product || item.product.type === undefined) {
        return (
          <Text key={item.CartId}>
            Invalid item: {item.product?.id || 'Unknown'}
          </Text>
        );
      }

      const CardComponent = cardComponentMapping[item.product.type];
      if (CardComponent) {
        return <CardComponent key={item.CartId} data={item} />;
      }
      return (
        <Text key={item.CartId}>
          Unknown type: {item.product.type} (Product ID: {item.product.id})
        </Text>
      );
    },
    [cardComponentMapping],
  );

  return <>{items.map(item => renderItem({item}))}</>;
};

export default CartItemsList;
