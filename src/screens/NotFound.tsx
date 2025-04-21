import React, {useEffect} from 'react';
import {View, Text} from 'react-native';
import {navigate} from '../navigation/navigationRef';
import {useAuth} from '../utils/hooks/useAuth';

const NotFound = () => {
  const {isLoggedIn} = useAuth();
  useEffect(() => {
    const timeout = setTimeout(() => {
      isLoggedIn
        ? navigate('Root', {
            screen: 'HomeNavigator',
            params: {screen: 'Home'},
          })
        : navigate('Auth', {
            screen: 'Login',
          });
    }, 200);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>صفحه‌ای که دنبالش بودی پیدا نشد. انتقال به صفحه اصلی...</Text>
    </View>
  );
};

export default NotFound;
