import React from 'react';
import SaleItemScreen from '../../screens/Saleitem/SaleItemScreen';
import {SaleItemStackParamList} from '../../utils/types/NavigationTypes';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useTheme} from '../../utils/ThemeContext';
import NavigationHeader from '../../components/header/NavigationHeader';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import Header from '../../components/Header';

const Stack = createNativeStackNavigator<SaleItemStackParamList>();

const SaleItemNavigator: React.FC = ({navigation}: any) => {
  const {theme} = useTheme();
  const {t} = useTranslation('translation', {keyPrefix: 'SaleItem'});

  return (
    <Stack.Navigator
      screenOptions={{
        animation: 'slide_from_left',
      }}>
      <Stack.Screen
        name="saleItem"
        component={SaleItemScreen}
        options={({navigation}) => ({
          header: () => (
            <NavigationHeader navigation={navigation} title={t('saleItem')} />
          ),
        })}
      />
      <Stack.Screen
        name="saleItemDetail"
        component={View}
        options={({navigation, route}) => ({
          header: () => {
            const title = route.params?.title || t('saleItem');

            return <NavigationHeader navigation={navigation} title={title} />;
          },
        })}
      />
    </Stack.Navigator>
  );
};

export default SaleItemNavigator;
