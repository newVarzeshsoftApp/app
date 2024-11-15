import React from 'react';
import {View, Text, Button} from 'react-native';
import {useAuth} from '../../store/context/AuthProvider';

const HomeScreen: React.FC = () => {
  const {logout} = useAuth();

  return (
    <View>
      <Text>Home Screen</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
};

export default HomeScreen;
