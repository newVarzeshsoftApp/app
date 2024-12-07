import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {HomeStackParamList} from '../../utils/types/NavigationTypes';
import HomeScreen from '../../screens/home/HomeScreen';
import Header from '../../components/Header';
import {View} from 'react-native';
import TabBar from '../../components/TabBar';
import TicketScreen from '../../screens/home/TicketScreen';
import CartScreen from '../../screens/home/CartScreen';
import WalletScreen from '../../screens/home/WalletScreen';

const Tab = createBottomTabNavigator<HomeStackParamList>();

const HomeNavigator: React.FC = ({navigation}: any) => {
  return (
    <Tab.Navigator
      tabBar={props => <TabBar {...props} />}
      screenOptions={({route}) => ({
        headerShown: route.name === 'Home' || route.name === 'wallet', // Show Header only for Home and Wallet
        header: () => <Header navigation={navigation} />,
        tabBarStyle: {
          display:
            route.name === 'Home' || route.name === 'wallet' ? 'flex' : 'none', // Show TabBar only for Home and Wallet
        },
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="ticket" component={TicketScreen} />
      <Tab.Screen name="cart" component={CartScreen} />
      <Tab.Screen name="wallet" component={WalletScreen} />
    </Tab.Navigator>
  );
};

export default HomeNavigator;
