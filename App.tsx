import './gesture-handler';
import React, {useEffect} from 'react';
import {loadLanguage} from './src/utils/helpers/languageUtils';
import {Button, Platform, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import TenstackProvider from './src/utils/Providers/TenstackProvider';
import ToastProvider from './src/components/Toast/Toast';
import {ThemeProvider} from './src/utils/ThemeContext';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Host} from 'react-native-portalize';
import {RootNavigator} from './src/navigation/RootNavigator';
import {CartProvider} from './src/utils/CartContext';
import {SENTRY, SENTRY_DSN} from './src/utils/helpers/sentryConfig';

SENTRY.init({
  dsn: SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: Platform.OS === 'web' ? 'web' : 'native',
  debug: true,
  integrations: [],
});

function App() {
  useEffect(() => {
    loadLanguage();
  }, []);
  const SentryErrorBoundary = SENTRY.ErrorBoundary;

  return (
    <SentryErrorBoundary>
      <GestureHandlerRootView>
        <SafeAreaProvider>
          <ThemeProvider>
            <TenstackProvider>
              <CartProvider>
                <View className="flex-1 bg-neutral-100 dark:bg-neutral-dark-100 max-w-[450px] web:overflow-hidden mx-auto w-full">
                  <Host>
                    <RootNavigator />
                    <ToastProvider />
                  </Host>
                </View>
              </CartProvider>
            </TenstackProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </SentryErrorBoundary>
  );
}

const WrappedApp =
  Platform.OS === 'web'
    ? App
    : (SENTRY as typeof import('@sentry/react-native')).wrap(App);

export default WrappedApp;
