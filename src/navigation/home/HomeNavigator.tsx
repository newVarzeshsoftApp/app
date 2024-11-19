// src/navigation/HomeNavigator.tsx
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {HomeStackParamList} from '../../utils/types/NavigationTypes';
import HomeScreen from '../../screens/home/HomeScreen';

const Tab = createBottomTabNavigator<HomeStackParamList>();

const HomeNavigator: React.FC = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
    </Tab.Navigator>
  );
};

export default HomeNavigator;
