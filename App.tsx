import React, {useEffect} from 'react';
import {loadLanguage} from './src/utils/helpers/languageUtils';
import {RootNavigator} from './src/navigation/RootNavigator';
import {View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import TenstackProvider from './src/utils/Providers/TenstackProvider';
import ToastProvider from './src/components/Toast/Toast';
import {ThemeProvider} from './src/utils/ThemeContext';
import 'react-native-gesture-handler';
export default function App() {
  useEffect(() => {
    loadLanguage();
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ThemeProvider>
        <TenstackProvider>
          <View className="flex-1 bg-neutral-100 dark:bg-neutral-dark-100 max-w-[450px] web:overflow-hidden mx-auto w-full">
            <RootNavigator />
            <ToastProvider />
          </View>
        </TenstackProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
