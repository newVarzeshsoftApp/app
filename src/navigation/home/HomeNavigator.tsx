import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {HomeStackParamList} from '../../utils/types/NavigationTypes';
import HomeScreen from '../../screens/home/HomeScreen';
import Header from '../../components/Header';
import {Text, View} from 'react-native';
import TabBar from '../../components/TabBar';

const Tab = createBottomTabNavigator<HomeStackParamList>();

const HomeNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={props => <TabBar {...props} />}
      screenOptions={({route}) => ({
        headerShown: route.name === 'Home' || route.name === 'wallet', // Show Header only for Home and Wallet
        header: () => <Header />,
        tabBarStyle: {
          display:
            route.name === 'Home' || route.name === 'wallet' ? 'flex' : 'none', // Show TabBar only for Home and Wallet
        },
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="ticket" component={View} />
      <Tab.Screen name="cart" component={View} />
      <Tab.Screen name="wallet" component={View} />
    </Tab.Navigator>
  );
};

export default HomeNavigator;
