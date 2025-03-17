import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AuthNavigator from './auth/AuthNavigator';
import {useTheme} from '../utils/ThemeContext';
import {
  DefaultTheme,
  NavigationContainer,
  Theme,
} from '@react-navigation/native';
import {ActivityIndicator, Platform, View} from 'react-native';
import {RootStackParamList} from '../utils/types/NavigationTypes';
import DrawerNavigator from './DrawerNavigator';
import {navigationRef} from './navigationRef';
import linking from './Linking';
import {useAuth} from '../utils/hooks/useAuth';
import NotFound from '../screens/NotFound';
import {useNavigationStore} from '../store/navigationStore';

const Stack = createNativeStackNavigator<RootStackParamList>();
export const RootNavigator: React.FC = () => {
  const {isLoggedIn, SKU, isLoading} = useAuth();
  const {setInitialRoute} = useNavigationStore();

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state && state.name) {
        console.log(
          `🔄 Browser navigation detected: ${state.name}`,
          state.params,
        );

        const currentRoute = useNavigationStore.getState().history.at(-1);
        if (currentRoute?.name === state.name) {
          console.log('⏭ Skipping redundant popstate event.');
          return;
        }

        useNavigationStore.getState().addRoute(state.name, state.params);
        navigationRef.navigate(state.name as any, state.params as any);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  useEffect(() => {
    !isLoading && setInitialRoute(isLoggedIn);
  }, [isLoggedIn, isLoading]);
  useEffect(() => {
    if (Platform.OS === 'web') {
      const unsubscribe = navigationRef.current?.addListener('state', e => {
        try {
          if (e?.data?.state) {
            window.scrollTo(0, 0);
          }
        } catch (error) {
          console.warn('Navigation state error:', error);
        }
      });

      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, []);
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
      linking={linking}
      ref={navigationRef}>
      {isLoading ? (
        <View className="w-full h-screen items-center justify-center">
          <ActivityIndicator size="large" color="#bcdd64" />
        </View>
      ) : (
        <Stack.Navigator screenOptions={{headerShown: false}}>
          {SKU === null ? (
            <Stack.Screen name="notFound" component={NotFound} />
          ) : isLoggedIn ? (
            <Stack.Screen name="Root" component={DrawerNavigator} />
          ) : (
            <Stack.Screen name="Auth" component={AuthNavigator} />
          )}
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};
