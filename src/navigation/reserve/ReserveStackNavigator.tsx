import React, {useRef, useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {CommonActions} from '@react-navigation/native';
import {HomeStackParamList} from '../../utils/types/NavigationTypes';
import ReserveScreen from '../../screens/home/ReserveScreen';
import ReserveDetailScreen from '../../screens/home/ReserveDetailScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const ReserveStackNavigator: React.FC = () => {
  const navigation = useNavigation();
  const shouldResetRef = useRef(false);

  // Listen for resetReserveStack event from TabBar
  useEffect(() => {
    const unsubscribe = navigation.addListener(
      'resetReserveStack' as any,
      () => {
        shouldResetRef.current = true;
      },
    );

    return unsubscribe;
  }, [navigation]);

  // Reset when tab is focused and reset was requested
  useFocusEffect(
    React.useCallback(() => {
      if (shouldResetRef.current) {
        const state = navigation.getState();
        // If we're in reserveDetail (index > 0), reset to reserve
        if (state && state.index !== undefined && state.index > 0) {
          // Small delay to ensure navigation is ready
          setTimeout(() => {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{name: 'reserve'}],
              }),
            );
            shouldResetRef.current = false;
          }, 100);
        } else {
          shouldResetRef.current = false;
        }
      }
    }, [navigation]),
  );

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
