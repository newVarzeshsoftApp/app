import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeNavigator from './home/HomeNavigator';
import AuthNavigator from './auth/AuthNavigator';
import {getTokens} from '../utils/helpers/tokenStorage';
import {useQuery} from '@tanstack/react-query';
import {useTheme} from '../utils/ThemeContext';
import {
  DefaultTheme,
  NavigationContainer,
  Theme,
  useNavigationContainerRef,
} from '@react-navigation/native';
import {Platform} from 'react-native';
import {RootStackParamList} from '../utils/types/NavigationTypes';
import SaleItemNavigator from './Saleitem/SaleItemStackNatigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const {data, isLoading} = useQuery({
    queryKey: ['Tokens'],
    queryFn: getTokens,
  });

  const navigationRef = useNavigationContainerRef();
  useEffect(() => {
    if (Platform.OS === 'web') {
      const unsubscribe = navigationRef?.addListener('state', () => {
        // This scrolls to the top when route changes
        window.scrollTo(0, 0);
      });

      return unsubscribe;
    }
  }, [navigationRef]);
  if (isLoading) {
    return null;
  }
  const {theme} = useTheme();

  const MinimalTheme: Theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: theme === 'dark' ? '#16181b' : '#F4F4F5', // Dark or Light
      primary: 'black',
      text: 'black',
      border: 'transparent',
    },
  };
  return (
    <NavigationContainer theme={MinimalTheme} ref={navigationRef}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {data?.accessToken ? (
          <>
            <Stack.Screen name="Home" component={HomeNavigator} />
            <Stack.Screen name="SaleItem" component={SaleItemNavigator} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
