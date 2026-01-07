import React from 'react';
import {View} from 'react-native';

import {Bag, CardPos, Receipt1} from 'iconsax-react-native';
import BaseText from '../../../../components/BaseText';

interface CartStepsProps {
  steps: 1 | 2;
  t: (key: string) => string;
  ActiveIcon: string;
  DisableIcon: string;
}

const CartSteps: React.FC<CartStepsProps> = ({
  steps,
  t,
  ActiveIcon,
  DisableIcon,
}) => {
  return (
    <View className="flex-row items-center justify-between gap-4">
      <View className="items-center gap-1">
        <Bag size="24" color={ActiveIcon} variant="Bold" />
        <BaseText type="subtitle3" color="success">
          {t('Cart')}
        </BaseText>
      </View>
      <View
        style={{
          flex: 1,
          height: 0.5,
          backgroundColor: steps === 2 ? ActiveIcon : DisableIcon,
        }}
      />
      <View className="items-center gap-1">
        <CardPos
          size="24"
          color={steps === 1 ? DisableIcon : ActiveIcon}
          variant="Bold"
        />
        <BaseText
          type="subtitle3"
          color={steps === 1 ? 'secondary' : 'success'}>
          {t('payment')}
        </BaseText>
      </View>
      <View style={{flex: 1, height: 0.5, backgroundColor: DisableIcon}} />
      <View className="items-center gap-1">
        <Receipt1 size="24" color={DisableIcon} variant="Bold" />
        <BaseText type="subtitle3" color="secondary">
          {t('orders')}
        </BaseText>
      </View>
    </View>
  );
};

export default CartSteps;
