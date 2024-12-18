import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import ShopNavigator from './shop/ShopNavigator';
import HistoryNavigator from './history/HistoryNavigator';
import HomeNavigator from './home/HomeNavigator';
import SaleItemNavigator from './Saleitem/SaleItemStackNatigator';
import {DrawerStackParamList} from '../utils/types/NavigationTypes';
import CustomDrawerContent from '../components/Drawer/CustomDrawerContent';
import PaymentScreen from '../screens/payments/PaymentScreen';

const Drawer = createDrawerNavigator<DrawerStackParamList>();

const DrawerNavigator: React.FC = () => {
  return (
    <Drawer.Navigator
      screenOptions={() => ({
        drawerStyle: {width: '100%'},
        drawerType: 'slide',
        headerShown: false,
        drawerPosition: 'right',
        unmountOnBlur: true,
      })}
      initialRouteName="HomeNavigator"
      drawerContent={props => <CustomDrawerContent {...props} />}>
      <Drawer.Screen name="HomeNavigator" component={HomeNavigator} />
      <Drawer.Screen name="SaleItemNavigator" component={SaleItemNavigator} />
      <Drawer.Screen name="ShopNavigator" component={ShopNavigator} />
      <Drawer.Screen name="HistoryNavigator" component={HistoryNavigator} />
      <Drawer.Screen name="PaymentResult" component={PaymentScreen} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
