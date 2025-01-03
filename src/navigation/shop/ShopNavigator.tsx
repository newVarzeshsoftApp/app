import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ShopStackParamList} from '../../utils/types/NavigationTypes';

import Header from '../../components/Header';
import {View} from 'react-native';

const Stack = createNativeStackNavigator<ShopStackParamList>();

const ShopNavigator: React.FC = ({navigation}: any) => {
  return (
    <Stack.Navigator
      screenOptions={({route}) => ({
        unmountOnBlur: true,
        headerShown: false,
      })}>
      <Stack.Screen name="creditService" component={View} />
      <Stack.Screen name="packageService" component={View} />
      <Stack.Screen name="service" component={View} />
    </Stack.Navigator>
  );
};
export default ShopNavigator;
