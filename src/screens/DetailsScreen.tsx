import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Details'>;

const DetailsScreen: React.FC<Props> = ({navigation}) => {
  return (
    <View className="flex-1 items-center justify-center bg-gray-100">
      <Text className="text-2xl font-bold mb-5">Details Screen</Text>
      <TouchableOpacity
        className="bg-red-500 py-3 px-6 rounded-lg mt-5 shadow-lg"
        onPress={() => navigation.goBack()}>
        <Text className="text-white text-base font-semibold">Go back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default DetailsScreen;
