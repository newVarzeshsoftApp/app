import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ShopStackParamList} from '../../utils/types/NavigationTypes';
import CreditServiceSreen from '../../screens/shop/CreditServiceSreen';
import PackageServiceScreen from '../../screens/shop/PackageServiceScreen';
import ServiceScreen from '../../screens/shop/ServiceScreen';
import CreditDetail from '../../screens/shop/CreditDetail';
import PackageDetail from '../../screens/shop/PackageDetail';
import ServiceDetail from '../../screens/shop/ServiceDetail';

const Stack = createNativeStackNavigator<ShopStackParamList>();

const ShopNavigator: React.FC = ({navigation}: any) => {
  return (
    <Stack.Navigator
      screenOptions={({route}) => ({
        unmountOnBlur: true,
        headerShown: false,
      })}>
      <Stack.Screen name="creditService" component={CreditServiceSreen} />
      <Stack.Screen name="packageService" component={PackageServiceScreen} />
      <Stack.Screen name="service" component={ServiceScreen} />
      {/* Detail Screens */}
      <Stack.Screen name="creditDetail" component={CreditDetail} />
      <Stack.Screen name="packageDetail" component={PackageDetail} />
      <Stack.Screen name="serviceDetail" component={ServiceDetail} />
    </Stack.Navigator>
  );
};
export default ShopNavigator;
