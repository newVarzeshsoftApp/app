import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {OrderStackParamList} from '../../utils/types/NavigationTypes';
import OrdersScreen from '../../screens/history/OrdersScreen';
import ReceptionScreen from '../../screens/history/ReceptionScreen';
import TransactionScreen from '../../screens/history/TransactionScreen';
import PaymentsScreen from '../../screens/history/PaymentsScreen';
import Header from '../../components/Header';
import OrderDetailScreen from '../../screens/history/OrderDetailScreen';
import WithdrawDetailScreen from '../../screens/history/WithdrawDetailScreen';
import DepositDetailScreen from '../../screens/history/DepositDetailScreen';

const Stack = createNativeStackNavigator<OrderStackParamList>();

const HistoryNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTransparent: true,
        headerShown: false,
      }}>
      <Stack.Screen name="orders" component={OrdersScreen} />
      <Stack.Screen name="payments" component={PaymentsScreen} />
      <Stack.Screen name="reception" component={ReceptionScreen} />
      <Stack.Screen name="orderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="WithdrawDetail" component={WithdrawDetailScreen} />
      <Stack.Screen name="DepositDetail" component={DepositDetailScreen} />
      <Stack.Screen name="transaction" component={TransactionScreen} />
    </Stack.Navigator>
  );
};
export default HistoryNavigator;
