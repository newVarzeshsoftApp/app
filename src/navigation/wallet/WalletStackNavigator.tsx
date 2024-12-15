import React from 'react';
import WalletScreen from '../../screens/home/WalletScreen';
import ChargeWalletScreen from '../../screens/home/ChargeWalletScreen';
import Header from '../../components/Header';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {WalletStackParamList} from '../../utils/types/NavigationTypes';

const WalletStack = createNativeStackNavigator<WalletStackParamList>();

const WalletStackNavigator: React.FC = ({navigation}: any) => {
  return (
    <WalletStack.Navigator>
      <WalletStack.Screen
        name="wallet"
        component={WalletScreen}
        options={{
          header: () => <Header navigation={navigation} />,
        }}
      />
      <WalletStack.Screen
        name="ChargeWalletScreen"
        component={ChargeWalletScreen}
        options={{headerShown: false}}
      />
    </WalletStack.Navigator>
  );
};

export default WalletStackNavigator;
