import './gesture-handler';
import React, {useEffect} from 'react';
import {loadLanguage} from './src/utils/helpers/languageUtils';
import {Button, Platform, View, StatusBar} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import TenstackProvider from './src/utils/Providers/TenstackProvider';
import ToastProvider from './src/components/Toast/Toast';
import {ThemeProvider, useTheme} from './src/utils/ThemeContext';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Host} from 'react-native-portalize';
import {RootNavigator} from './src/navigation/RootNavigator';
import {CartProvider} from './src/utils/CartContext';
import {SENTRY, SENTRY_DSN} from './src/utils/helpers/sentryConfig';
import {Buffer} from 'buffer';
global.Buffer = global.Buffer || Buffer;
SENTRY.init({
  dsn: SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: Platform.OS === 'web' ? 'web' : 'native',
  debug: true,
  integrations: [],
});

function AppContent() {
  const {theme} = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    // Fix Safari scroll detection and viewport height
    if (Platform.OS === 'web') {
      // Set CSS variable for viewport height
      const setViewportHeight = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };

      setViewportHeight();
      window.addEventListener('resize', setViewportHeight);
      window.addEventListener('scroll', setViewportHeight);
      window.addEventListener('orientationchange', setViewportHeight);

      // For Safari, trigger resize on scroll to detect address bar changes
      let lastScrollTop = 0;
      const handleScroll = () => {
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        if (Math.abs(scrollTop - lastScrollTop) > 5) {
          setViewportHeight();
          lastScrollTop = scrollTop;
        }
      };

      window.addEventListener('scroll', handleScroll, {passive: true});

      return () => {
        window.removeEventListener('resize', setViewportHeight);
        window.removeEventListener('scroll', setViewportHeight);
        window.removeEventListener('orientationchange', setViewportHeight);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  return (
    <>
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
    </>
  );
}

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
            <AppContent />
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
