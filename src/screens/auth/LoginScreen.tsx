import React from 'react';
import {View, Text, Button, Dimensions, Image, Platform} from 'react-native';
import {useAuth} from '../../store/context/AuthProvider';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../utils/types/NavigationTypes';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../../utils/ThemeContext';
import {SafeAreaView} from 'react-native-safe-area-context';
type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const LoginScreen: React.FC<LoginScreenProps> = ({navigation}) => {
  const {login} = useAuth();
  const {theme, toggleTheme} = useTheme();

  return (
    <View className="flex-1 justify-start items-center ">
      <View
        style={{height: screenHeight * 0.4}}
        className={`w-full rounded-b-3xl overflow-hidden`}>
        <Image
          source={require('../../assets/testImage.jpeg')}
          resizeMode="cover"
          style={{
            width: '100%',
            height: screenHeight * 0.6,
          }}
        />
        {Platform.OS !== 'web' && (
          <LinearGradient
            colors={['transparent', theme === 'dark' ? '#16181b' : '#ffffff']} // Gradient from transparent to black
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              height: screenHeight * 0.4,
            }}
          />
        )}
      </View>

      <View className="px-5">
        <Button title="Login" onPress={toggleTheme} />
        <Button title="Sign Up" onPress={() => navigation.navigate('Signup')} />
        <Button
          title="Forget Password"
          onPress={() => navigation.navigate('ForgetPassword')}
        />
      </View>
    </View>
  );
};

export default LoginScreen;
