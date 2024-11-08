import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({navigation}) => {
  return (
    <View className="flex-1 items-center justify-center bg-gray-100">
      <Text className="text-2xl font-bold mb-5">Home Screen</Text>
      <TouchableOpacity
        className="bg-blue-500 py-3 px-6 rounded-lg mt-5 shadow-lg"
        onPress={() => navigation.navigate('Details')}>
        <Text className="text-white text-base font-semibold">
          Go to Details
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;
