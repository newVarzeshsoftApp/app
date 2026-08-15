import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {GroupClassRoomStackParamList} from '../../utils/types/NavigationTypes';
import GroupClassRoomScreen from '../../screens/home/GroupClassRoomScreen';
import GroupClassRoomListScreen from '../../screens/home/GroupClassRoomListScreen';
import GroupClassRoomDetailScreen from '../../screens/home/GroupClassRoomDetailScreen';

const Stack = createNativeStackNavigator<GroupClassRoomStackParamList>();

const GroupClassRoomStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="groupClassRoom"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="groupClassRoom" component={GroupClassRoomScreen} />
      <Stack.Screen
        name="groupClassRoomList"
        component={GroupClassRoomListScreen}
      />
      <Stack.Screen
        name="groupClassRoomDetail"
        component={GroupClassRoomDetailScreen}
      />
    </Stack.Navigator>
  );
};

export default GroupClassRoomStackNavigator;
