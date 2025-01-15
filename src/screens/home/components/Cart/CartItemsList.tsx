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
      const CardComponent = cardComponentMapping[item.product.type!];
      if (CardComponent) {
        return <CardComponent key={item.CartId} data={item} />;
      }
      return <Text>Unknown type: {item.product.id}</Text>;
    },
    [cardComponentMapping],
  );

  return <>{items.reverse().map(item => renderItem({item}))}</>;
};

export default CartItemsList;
