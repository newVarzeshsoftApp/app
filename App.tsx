import React, {useEffect} from 'react';
import {
  DefaultTheme,
  NavigationContainer,
  Theme,
} from '@react-navigation/native';
import {loadLanguage} from './src/utils/helpers/languageUtils';
import {ThemeProvider, useTheme} from './src/utils/ThemeContext';
import {RootNavigator} from './src/navigation/RootNavigator';
import {AuthProvider} from './src/store/context/AuthProvider';
import {useColorScheme, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

export default function App() {
  useEffect(() => {
    loadLanguage();
  }, []);
  const colorScheme = useColorScheme();

  const MinimalTheme: Theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colorScheme === 'dark' ? '#16181b' : '#ffffff', // Dark or Light
      primary: 'black',
      text: 'black',
      border: 'transparent',
    },
  };

  useEffect(() => {
    loadLanguage();
  }, []);
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ThemeProvider>
        <AuthProvider>
          <View className="flex-1 bg-neutral-0 dark:bg-neutral-dark-0">
            <NavigationContainer theme={MinimalTheme}>
              <RootNavigator />
            </NavigationContainer>
          </View>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
