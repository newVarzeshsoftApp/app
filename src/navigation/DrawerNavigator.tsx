import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';

import ShopNavigator from './shop/ShopNavigator';
import HistoryNavigator from './history/HistoryNavigator';
import HomeNavigator from './home/HomeNavigator';
import SaleItemNavigator from './Saleitem/SaleItemStackNatigator';
import {DrawerStackParamList} from '../utils/types/NavigationTypes';
import {Platform} from 'react-native';
import CustomDrawerContent from '../components/Drawer/CustomDrawerContent';

const Drawer = createDrawerNavigator<DrawerStackParamList>();

const DrawerNavigator: React.FC = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: {width: '100%'},
        drawerType: 'slide',
        headerShown: false,
        drawerPosition: 'right',
        // swipeEnabled: true,
      }}
      drawerContent={props => <CustomDrawerContent {...props} />}>
      <Drawer.Screen name="HomeNavigator" component={HomeNavigator} />
      <Drawer.Screen name="SaleItemNavigator" component={SaleItemNavigator} />
      <Drawer.Screen name="ShopNavigator" component={ShopNavigator} />
      <Drawer.Screen name="HistoryNavigator" component={HistoryNavigator} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
