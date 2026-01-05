import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../../utils/types/NavigationTypes';
import ReserveScreen from '../../screens/home/ReserveScreen';
import ReserveDetailScreen from '../../screens/home/ReserveDetailScreen';
import GroupClassRoomScreen from '../../screens/home/GroupClassRoomScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const ReserveStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="reserve"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="reserve" component={ReserveScreen} />
      <Stack.Screen name="reserveDetail" component={ReserveDetailScreen} />
      <Stack.Screen name="groupClassRoom" component={GroupClassRoomScreen} />
    </Stack.Navigator>
  );
};

export default ReserveStackNavigator;
