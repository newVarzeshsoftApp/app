import React, {useCallback} from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import ShopNavigator from './shop/ShopNavigator';
import HistoryNavigator from './history/HistoryNavigator';
import HomeNavigator from './home/HomeNavigator';
import SaleItemNavigator from './Saleitem/SaleItemStackNatigator';
import {DrawerStackParamList} from '../utils/types/NavigationTypes';
import CustomDrawerContent from '../components/Drawer/CustomDrawerContent';
import PaymentScreen from '../screens/payments/PaymentScreen';
import {useFocusEffect} from '@react-navigation/native';
import {navigationRef} from './navigationRef';
import {Alert, BackHandler, Platform} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import WebViewScreen from '../screens/web/WebViewScreen';
import PaymentDetail from '../screens/payments/PaymentDetail';

const Drawer = createDrawerNavigator<DrawerStackParamList>();

const DrawerNavigator: React.FC = () => {
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'web') {
        return;
      }

      const onBackPress = () => {
        try {
          if (!navigationRef.isReady() || !navigationRef.current) {
            return false;
          }

          const navigation = navigationRef.current;
          const state = navigation.getState();
          if (!state?.routes?.length) {
            return false;
          }
          const previousRoute = state.routes[state.routes.length - 2];
          if (navigation.canGoBack() && previousRoute?.name !== 'Auth') {
            navigation.goBack();
            return true;
          }
          Alert.alert(
            'Exit App',
            'Do you want to quit the app?',
            [
              {text: 'Cancel', style: 'cancel'},
              {text: 'OK', onPress: () => BackHandler.exitApp()},
            ],
            {cancelable: false},
          );
          return true;
        } catch (error) {
          console.warn('Navigation error:', error);
          return false;
        }
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []),
  );
  return (
    <GestureHandlerRootView style={{flex: 1}}>
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
        <Drawer.Screen name="Paymentresult" component={PaymentScreen} />
        <Drawer.Screen name="PaymentDetail" component={PaymentDetail} />
        <Drawer.Screen name="WebViewParamsList" component={WebViewScreen} />
      </Drawer.Navigator>
    </GestureHandlerRootView>
  );
};

export default DrawerNavigator;
