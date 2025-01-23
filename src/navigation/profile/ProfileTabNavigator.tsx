import React, {lazy} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {ProfileTabParamsList} from '../../utils/types/NavigationTypes';

import {Lock, Profile} from 'iconsax-react-native';
import PersonalInfoScreen from '../../screens/profile/PersonalInfo';
import SecurityScreen from '../../screens/profile/SecurityScreen';
import CustomTabBar from '../../components/CustomTabBar';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';

const Tab = createMaterialTopTabNavigator<ProfileTabParamsList>();

const ProfileTabNavigator: React.FC = () => {
  const {t} = useTranslation('translation', {
    keyPrefix: 'Profile',
  });
  const customLabels: Record<string, string> = {
    PersonalInfo: t('Personal Info'),
    Security: t('Security'),
  };

  // Define custom icons for each tab
  const tabIcons: Record<string, React.ReactElement> = {
    PersonalInfo: <Profile size={24} />,
    Security: <Lock size="24" />,
  };
  return (
    <View style={{direction: 'ltr', flex: 1}}>
      <Tab.Navigator
        direction="ltr"
        screenOptions={{
          swipeEnabled: false,
        }}
        initialRouteName="PersonalInfo"
        tabBar={props => (
          <CustomTabBar
            edges={['left']}
            tabIcons={tabIcons}
            customLabels={customLabels}
            {...props}
          />
        )}>
        <Tab.Screen name="Security" component={SecurityScreen} />
        <Tab.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      </Tab.Navigator>
    </View>
  );
};

export default ProfileTabNavigator;
