import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {HomeStackParamList} from '../../utils/types/NavigationTypes';
import HomeScreen from '../../screens/home/HomeScreen';
import Header from '../../components/Header';
import TabBar from '../../components/TabBar';
import TicketScreen from '../../screens/home/TicketScreen';
import CartScreen from '../../screens/home/CartScreen';
import WalletStackNavigator from '../wallet/WalletStackNavigator';
import MyserviceScreen from '../../screens/home/myServices/MyserviceScreen';

const Tab = createBottomTabNavigator<HomeStackParamList>();

const HomeNavigator: React.FC = ({navigation}: any) => {
  return (
    <Tab.Navigator
      tabBar={props => <TabBar {...props} />}
      initialRouteName="Home"
      screenOptions={({route}) => ({
        animation: 'shift',
        unmountOnBlur: true,
        headerShown:
          route.name === 'Home' ||
          route.name === 'ticket' ||
          route.name === 'myServices' ||
          route.name === 'cart',
        header: () => <Header navigation={navigation} />,
      })}>
      <Tab.Screen name="myServices" component={MyserviceScreen} />
      <Tab.Screen name="ticket" component={TicketScreen} />
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="cart" component={CartScreen} />
      <Tab.Screen name="wallet" component={WalletStackNavigator} />
    </Tab.Navigator>
  );
};

export default HomeNavigator;
