import React from 'react';
import {View} from 'react-native';
import BaseButton from '../../../../components/Button/BaseButton';

interface PaymentButtonsProps {
  setSteps: React.Dispatch<React.SetStateAction<1 | 2>>;
  Steps: number;
  t: (key: string) => string;
}

const PaymentButtons: React.FC<PaymentButtonsProps> = ({
  setSteps,
  t,
  Steps,
}) => (
  <View className="absolute  web:bottom-28 bottom-32 left-0 right-0  flex-1 Container">
    <View className="flex-row  items-center gap-4 px-[2px] ">
      <View className="flex-1">
        <BaseButton
          onPress={() => setSteps(2)}
          type="Fill"
          color="Black"
          size="Large"
          text={t('payment')}
          rounded
        />
      </View>
      {Steps === 2 && (
        <BaseButton
          onPress={() => setSteps(1)}
          type="Tonal"
          redbutton
          color="Black"
          size="Large"
          text={t('cancel')}
          rounded
        />
      )}
    </View>
  </View>
);

export default PaymentButtons;
