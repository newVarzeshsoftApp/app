import React from 'react';
import {Text, View} from 'react-native';
import BaseText from '../components/BaseText';

const NotFound: React.FC = () => {
  return (
    <View className="h-screen flex-1 justify-center items-center">
      <BaseText color="Primary600" type="title1">
        401
      </BaseText>
      <BaseText color="muted" type="body1">
        عدم دسترسی
      </BaseText>
    </View>
  );
};

export default NotFound;
