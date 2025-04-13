import React from 'react';
import {Image, ScrollView, TouchableOpacity, View} from 'react-native';
import {DrawerContentComponentProps} from '@react-navigation/drawer';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useGetOrganizationBySKU} from '../../utils/hooks/Organization/useGetOrganizationBySKU';
import ResponsiveImage from '../ResponsiveImage';
import {Add, LogoutCurve} from 'iconsax-react-native';
import BaseText from '../BaseText';
import ProfileDrawer from './ProfileDrawer';
import {useTranslation} from 'react-i18next';
import MenuDrawer from './MenuDrawer';
import ThemeSwitchButton from '../Button/SwitchButton/ThemeSwitchButton';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import AuthService from '../../services/AuthService';
import {handleMutationError} from '../../utils/helpers/errorHandler';
import {removeTokens} from '../../utils/helpers/tokenStorage';
import {CommonActions, DrawerActions} from '@react-navigation/native';
import {
  navigate,
  navigationRef,
  resetNavigationHistory,
} from '../../navigation/navigationRef';

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = props => {
  const {data: OrganizationBySKU} = useGetOrganizationBySKU();
  const {t} = useTranslation('translation', {keyPrefix: 'Drawer'});
  const queryClient = useQueryClient();
  const Logout = useMutation({
    mutationFn: AuthService.Logout,
    onSuccess: async () => {
      await removeTokens();
      queryClient.invalidateQueries({queryKey: ['Tokens']});
      queryClient.removeQueries();

      resetNavigationHistory();

      navigate('Root');
    },
    onError: handleMutationError,
  });

  return (
    <View className="flex-1 bg-neutral-100 dark:bg-neutral-dark-100">
      <SafeAreaView className="flex-1">
        <View className="Container justify-between web:pb-4 flex-1   web:pt-6 gap-3">
          <View className="gap-4 flex-1">
            {/* Header */}
            <View className=" w-full flex-row h-[45px] items-center justify-between relative ">
              <View></View>
              <TouchableOpacity
                onPress={() => navigate('Root', {screen: 'HomeNavigator'})}>
                <View className="w-[45px] h-[45px] ">
                  <ResponsiveImage
                    ImageType="App"
                    customSource={OrganizationBySKU?.officialLogo.srcset}
                    fallback={require('../../assets/images/testImage.png')}
                    resizeMode="contain"
                  />
                </View>
              </TouchableOpacity>
              <View></View>
              <TouchableOpacity
                // onPress={props.navigation.closeDrawer}
                onPress={() =>
                  props.navigation.dispatch(DrawerActions.closeDrawer())
                }
                className="rotate-45 h-6 w-6 absolute top-0 web:left-0   android:right-0 ios:right-0 bottom-0 ">
                <Add size="24" color="#717181" />
              </TouchableOpacity>
            </View>
            {/* Header */}
            <ScrollView
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}>
              <View className="gap-4">
                <TouchableOpacity
                  onPress={() => navigate('Root', {screen: 'ProfileTab'})}>
                  <ProfileDrawer />
                </TouchableOpacity>
                <MenuDrawer {...props} />
              </View>
            </ScrollView>
          </View>
          <View className="gap-5">
            <TouchableOpacity
              onPress={() => Logout.mutate()}
              className="px-6 flex-row p-3 gap-3">
              <BaseText type="title4" color="error">
                {t('logout')}
              </BaseText>
              <LogoutCurve size="24" color="#FD504F" variant="Bold" />
            </TouchableOpacity>
            <View className="w-full h-[70px] relative  overflow-hidden rounded-3xl">
              <View className="w-[300px] h-[300px] z-[1] -bottom-[70px] web:-left-[24%] left-[30%] absolute opacity-40 ">
                <Image
                  source={require('../../assets/images/shade/shape/Whiteshade.png')}
                  resizeMode="contain"
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                />
              </View>
              <View className="w-full h-full justify-between z-10  dark:bg-neutral-dark-300/80 backdrop-blur-xl bg-neutral-0/80 flex-row items-center px-6 ">
                <BaseText type="title4">{t('changeTheme')}</BaseText>
                <ThemeSwitchButton />
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default CustomDrawerContent;
