import React from 'react';
import {View, Text} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../utils/types/NavigationTypes';

type ForgetPasswordScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'ForgetPassword'
>;

const ForgetPasswordScreen: React.FC<ForgetPasswordScreenProps> = () => {
  return (
    <View>
      <Text>ForgetPassword</Text>
    </View>
  );
};

export default ForgetPasswordScreen;
