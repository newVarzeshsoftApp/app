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
} from '@react-navigation/native';
import {Platform, View} from 'react-native';
import {RootStackParamList} from '../utils/types/NavigationTypes';
import DrawerNavigator from './DrawerNavigator';
import linking from './Linking';
import {navigationRef} from './navigationRef';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const {data, isLoading} = useQuery({
    queryKey: ['Tokens'],
    queryFn: getTokens,
  });
  useEffect(() => {
    if (Platform.OS === 'web') {
      const unsubscribe = navigationRef?.addListener('state', () => {
        // This scrolls to the top when route changes
        window.scrollTo(0, 0);
      });

      return unsubscribe;
    }
  }, [navigationRef]);
  const {theme} = useTheme();

  const MinimalTheme: Theme = {
    ...DefaultTheme,

    colors: {
      ...DefaultTheme.colors,
      background: theme === 'dark' ? '#16181b' : '#F4F4F5',
      primary: 'black',
      text: 'black',
      border: 'transparent',
    },
  };
  return (
    <NavigationContainer
      theme={MinimalTheme}
      // linking={linking}}
      ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        {data?.accessToken ? (
          <Stack.Screen name="Root" component={DrawerNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
