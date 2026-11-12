import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ReserveStackParamList} from '../../utils/types/NavigationTypes';
import ReserveScreen from '../../screens/home/ReserveScreen';
import ReserveDetailScreen from '../../screens/home/ReserveDetailScreen';
import FeatureUnavailable from '../../components/organization/FeatureUnavailable';
import {useIsOrgFeatureEnabled} from '../../utils/hooks/Organization/useOrgConfigs';

const Stack = createNativeStackNavigator<ReserveStackParamList>();

const ReserveStackNavigator: React.FC = () => {
  const reservationEnabled = useIsOrgFeatureEnabled('reservation');
  if (!reservationEnabled) {
    return <FeatureUnavailable />;
  }

  return (
    <Stack.Navigator
      initialRouteName="reserve"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="reserve" component={ReserveScreen} />
      <Stack.Screen name="reserveDetail" component={ReserveDetailScreen} />
    </Stack.Navigator>
  );
};

export default ReserveStackNavigator;
