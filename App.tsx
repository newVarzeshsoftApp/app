import React, {useEffect} from 'react';
import {
  DefaultTheme,
  NavigationContainer,
  Theme,
} from '@react-navigation/native';
import {loadLanguage} from './src/utils/helpers/languageUtils';
import {ThemeProvider} from './src/utils/ThemeContext';
import {RootNavigator} from './src/navigation/RootNavigator';
import {useColorScheme, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import TenstackProvider from './src/utils/Providers/TenstackProvider';
import ToastProvider from './src/components/Toast/Toast';

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
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ThemeProvider>
        <TenstackProvider>
          <View className="flex-1 bg-neutral-0 dark:bg-neutral-dark-0 max-w-[450px] mx-auto w-full">
            <NavigationContainer theme={MinimalTheme}>
              <RootNavigator />
            </NavigationContainer>
            <ToastProvider />
          </View>
        </TenstackProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
