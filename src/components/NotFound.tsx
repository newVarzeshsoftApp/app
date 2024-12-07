import React from 'react';
import {Text, View} from 'react-native';
import BaseText from './BaseText';
import BaseButton from './Button/BaseButton';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../utils/types/NavigationTypes';
type NotFoundScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Root'
>;

const NotFound: React.FC = () => {
  const navigation = useNavigation<NotFoundScreenNavigationProp>();
  return (
    <View className="flex-1 justify-center items-center gap-4 ">
      <BaseText type="title2" color="error">
        صفحه پیدا نشد
      </BaseText>
      <BaseButton
        onPress={() => navigation.navigate('Root', {screen: 'HomeNavigator'})}
        text="بازگشت"
        type="Fill"
        color="Primary"
      />
    </View>
  );
};

export default NotFound;
