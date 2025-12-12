import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../../utils/types/NavigationTypes';
import ReserveScreen from '../../screens/home/ReserveScreen';
import ReserveDetailScreen from '../../screens/home/ReserveDetailScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const ReserveStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        unmountOnBlur: true,
      }}>
      <Stack.Screen name="reserve" component={ReserveScreen} />
      <Stack.Screen name="reserveDetail" component={ReserveDetailScreen} />
    </Stack.Navigator>
  );
};

export default ReserveStackNavigator;


