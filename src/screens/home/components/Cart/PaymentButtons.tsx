import React from 'react';
import {View} from 'react-native';
import BaseButton from '../../../../components/Button/BaseButton';

interface PaymentButtonsProps {
  NextStep: () => void;
  BackStep: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  Steps: number;
  t: (key: string) => string;
}

const PaymentButtons: React.FC<PaymentButtonsProps> = ({
  NextStep,
  BackStep,
  isLoading,
  disabled,
  t,
  Steps,
}) => (
  <View className="absolute  web:bottom-24 bottom-32 left-0 right-0  flex-1 Container">
    <View className="flex-row  items-center gap-4 px-[2px] ">
      <View className="flex-1">
        <BaseButton
          isLoading={isLoading}
          disabled={Steps > 1 ? disabled : false}
          onPress={NextStep}
          type="Fill"
          color="Black"
          size="Large"
          text={t('payment')}
          rounded
        />
      </View>
      {Steps === 2 && (
        <BaseButton
          onPress={BackStep}
          type="Outline"
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
