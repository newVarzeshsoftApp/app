import React from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';
import {removeTokens} from '../../utils/helpers/tokenStorage';
import BaseButton from '../../components/Button/BaseButton';
import {useQueryClient} from '@tanstack/react-query';

const HomeScreen: React.FC = () => {
  const queryClient = useQueryClient();
  const handleRemoveTokens = async () => {
    try {
      await removeTokens();
      queryClient.invalidateQueries({queryKey: ['Tokens']});
      console.log('Tokens removed');
    } catch (error) {
      console.error('Error removing tokens:', error);
    }
  };

  return (
    <View>
      <Text>Home Screen</Text>
      <BaseButton
        color="Primary"
        type="Fill"
        text="Remove Tokens"
        onPress={handleRemoveTokens}
      />
    </View>
  );
};

const styles = StyleSheet.create({});

export default HomeScreen;
