import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeNavigator from './home/HomeNavigator';
import AuthNavigator from './auth/AuthNavigator';
import {getTokens} from '../utils/helpers/tokenStorage';
import {useQuery} from '@tanstack/react-query';

type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const {data, isLoading} = useQuery({
    queryKey: ['Tokens'],
    queryFn: getTokens,
  });

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {data?.accessToken ? (
        <Stack.Screen name="Home" component={HomeNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};
