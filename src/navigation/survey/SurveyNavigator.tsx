import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SurveyStackParamList} from '../../utils/types/NavigationTypes';
import SurveyListScreen from '../../screens/survey/SurveyListScreen';
import SurveyDetailScreen from '../../screens/survey/SurveyDetailScreen';
import NavigationHeader from '../../components/header/NavigationHeader';
import {useTranslation} from 'react-i18next';

const Stack = createNativeStackNavigator<SurveyStackParamList>();

const SurveyNavigator: React.FC = () => {
  const {t} = useTranslation('translation', {keyPrefix: 'Survey'});

  return (
    <Stack.Navigator
      initialRouteName="SurveyList"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="SurveyList"
        component={SurveyListScreen}
        options={({navigation}) => ({
          headerShown: true,
          header: () => (
            <NavigationHeader
              CenterText
              navigation={navigation}
              title={t('pageTitle')}
            />
          ),
        })}
      />
      <Stack.Screen
        name="SurveyDetail"
        component={SurveyDetailScreen}
        options={({navigation, route}) => ({
          headerShown: true,
          header: () => (
            <NavigationHeader
              CenterText
              navigation={navigation}
              title={route.params?.title || t('detailTitle')}
            />
          ),
        })}
      />
    </Stack.Navigator>
  );
};

export default SurveyNavigator;
