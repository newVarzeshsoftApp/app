import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '../../screens/auth/LoginScreen';
import {AuthStackParamList} from '../../utils/types/NavigationTypes';
import SignupScreen from '../../screens/auth/SignupScreen';
import ForgetPasswordScreen from '../../screens/auth/ForgetPasswordScreen';
import BaseButton from '../../components/Button/BaseButton';
import {ArrowRight2} from 'iconsax-react-native';
import {useTheme} from '../../utils/ThemeContext';
import {Platform, View} from 'react-native';
import VerifyOTPScreen from '../../screens/auth/VerifyOTPScreen';
import ResetPasswordScreen from '../../screens/auth/ResetPasswordScreen';
import LoginWithOTPScreen from '../../screens/auth/LoginWithOTPScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  const {theme} = useTheme();

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
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
              className={Platform.OS === 'ios' ? '' : 'px-3 rtl:justify-start'}>
              <BaseButton
                onPress={() => navigation.navigate('Login')}
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
              className={Platform.OS === 'ios' ? '' : 'px-3 rtl:justify-start'}>
              <BaseButton
                onPress={() => navigation.navigate('Login')}
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
  );
};

export default AuthNavigator;
