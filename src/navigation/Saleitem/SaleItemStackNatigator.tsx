import React from 'react';
import SaleItemScreen from '../../screens/Saleitem/SaleItemScreen';
import {SaleItemStackParamList} from '../../utils/types/NavigationTypes';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useTheme} from '../../utils/ThemeContext';
import NavigationHeader from '../../components/header/NavigationHeader';
import {useTranslation} from 'react-i18next';
import SaleItemDetailScreen from '../../screens/Saleitem/SaleItemDetailScreen';

const Stack = createNativeStackNavigator<SaleItemStackParamList>();

const SaleItemNavigator: React.FC = ({navigation}: any) => {
  const {theme} = useTheme();
  const {t} = useTranslation('translation', {keyPrefix: 'SaleItem'});

  return (
    <Stack.Navigator
      initialRouteName="saleItem"
      screenOptions={() => ({
        headerTransparent: true,
        headerShown: false,
        unmountOnBlur: true,
      })}>
      <Stack.Screen
        name="saleItem"
        component={SaleItemScreen}
        options={({navigation}) => ({
          headerShown: true,
          unmountOnBlur: true,
          headerTransparent: false,
          header: () => (
            <NavigationHeader
              CenterText
              navigation={navigation}
              title={t('saleItem')}
            />
          ),
        })}
      />
      <Stack.Screen name="saleItemDetail" component={SaleItemDetailScreen} />
    </Stack.Navigator>
  );
};

export default SaleItemNavigator;
