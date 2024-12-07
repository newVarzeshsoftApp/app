import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ShopStackParamList} from '../../utils/types/NavigationTypes';
import OrdersScreen from '../../screens/history/OrdersScreen';
import ReceptionScreen from '../../screens/history/ReceptionScreen';
import TransactionScreen from '../../screens/history/TransactionScreen';
import PaymentsScreen from '../../screens/history/PaymentsScreen';
import Header from '../../components/Header';

const Stack = createNativeStackNavigator<ShopStackParamList>();

const ShopNavigator: React.FC = ({navigation}: any) => {
  return (
    <Stack.Navigator
      screenOptions={{
        header: () => <Header navigation={navigation} />,
      }}>
      <Stack.Screen name="creditService" component={OrdersScreen} />
      <Stack.Screen name="packageService" component={PaymentsScreen} />
      <Stack.Screen name="service" component={ReceptionScreen} />
    </Stack.Navigator>
  );
};
export default ShopNavigator;
