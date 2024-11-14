import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {loadLanguage} from './src/utils/helpers/languageUtils';
import {ThemeProvider} from './src/utils/ThemeContext';

// // Define types for the navigation stack
export type RootStackParamList = {
  Home: undefined;
  Details: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
export default function App() {
  useEffect(() => {
    loadLanguage();
  }, []);
  return (
    <ThemeProvider>
      <NavigationContainer>
        <></>
      </NavigationContainer>
    </ThemeProvider>
  );
}
