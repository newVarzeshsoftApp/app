import React, {useEffect} from 'react';
import {
  DefaultTheme,
  NavigationContainer,
  Theme,
} from '@react-navigation/native';
import {loadLanguage} from './src/utils/helpers/languageUtils';
import {ThemeProvider} from './src/utils/ThemeContext';
import {RootNavigator} from './src/navigation/RootNavigator';
import {AuthProvider} from './src/store/context/AuthProvider';
import {View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
const MinimalTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
    primary: 'black',
    text: 'black',
    border: 'transparent',
  },
};
export default function App() {
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
