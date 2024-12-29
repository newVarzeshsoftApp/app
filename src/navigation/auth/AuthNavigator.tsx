import React, {useCallback} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '../../screens/auth/LoginScreen';
import {AuthStackParamList} from '../../utils/types/NavigationTypes';
import SignupScreen from '../../screens/auth/SignupScreen';
import ForgetPasswordScreen from '../../screens/auth/ForgetPasswordScreen';
import BaseButton from '../../components/Button/BaseButton';
import {ArrowRight2} from 'iconsax-react-native';
import {useTheme} from '../../utils/ThemeContext';
import {Alert, BackHandler, Platform, View} from 'react-native';
import VerifyOTPScreen from '../../screens/auth/VerifyOTPScreen';
import ResetPasswordScreen from '../../screens/auth/ResetPasswordScreen';
import LoginWithOTPScreen from '../../screens/auth/LoginWithOTPScreen';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useFocusEffect} from '@react-navigation/native';
import {navigationRef} from '../navigationRef';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  const {theme} = useTheme();

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (!navigationRef.isReady()) {
          return false;
        }

        const currentRoute = navigationRef.current?.getCurrentRoute();
        const state = navigationRef.current?.getState();

        // Show exit dialog only on Login screen with no previous routes
        if (
          (currentRoute?.name as keyof AuthStackParamList) === 'Login' &&
          (!state || state.routes.length <= 1)
        ) {
          Alert.alert(
            'Exit App',
            'Do you want to quit the app?',
            [
              {text: 'Cancel', style: 'cancel'},
              {text: 'OK', onPress: () => BackHandler.exitApp()},
            ],
            {cancelable: false},
          );
          return true;
        }

        // Handle back navigation for other auth screens
        if (navigationRef.current?.canGoBack()) {
          navigationRef.current?.goBack();
          return true;
        }

        return false;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []),
  );
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <Stack.Navigator
        screenOptions={{headerShown: false, contentStyle: {height: 300}}}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="OTP" component={VerifyOTPScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen
          name="LoginWithOTP"
          options={({navigation}) => ({
            headerShown: true,
            headerShadowVisible: false,
            headerTransparent: true,
            headerLeft: () => (
              <View
                className={
                  Platform.OS === 'ios' ? '' : 'px-3 rtl:justify-start'
                }>
                <BaseButton
                  onPress={() => navigation.push('Login')}
                  noText
                  LeftIcon={ArrowRight2}
                  type="Outline"
                  color="Black"
                  rounded
                />
              </View>
            ),
            headerTitle: '',
            headerStyle: {
              backgroundColor: theme === 'dark' ? '#16181b' : '#F4F4F5',
            },
          })}
          component={LoginWithOTPScreen}
        />

        <Stack.Screen
          name="ForgetPassword"
          options={({navigation}) => ({
            headerShown: true,
            headerShadowVisible: false,
            headerTransparent: true,
            headerLeft: () => (
              <View
                className={
                  Platform.OS === 'ios' ? '' : 'px-3 rtl:justify-start'
                }>
                <BaseButton
                  onPress={() => navigation.push('Login')}
                  noText
                  LeftIcon={ArrowRight2}
                  type="Outline"
                  color="Black"
                  rounded
                />
              </View>
            ),
            headerTitle: '',
            headerStyle: {
              backgroundColor: theme === 'dark' ? '#16181b' : '#F4F4F5',
            },
          })}
          component={ForgetPasswordScreen}
        />
      </Stack.Navigator>
    </GestureHandlerRootView>
  );
};

export default AuthNavigator;
