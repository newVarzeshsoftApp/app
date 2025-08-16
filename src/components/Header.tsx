import React from 'react';
import {Platform, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import ResponsiveImage from './ResponsiveImage';
import {useGetOrganizationBySKU} from '../utils/hooks/Organization/useGetOrganizationBySKU';
import {Menu} from 'iconsax-react-native';
import {DrawerActions} from '@react-navigation/native';
import ProfilePic from './header/ProfilePic';
import Logo from './Logo';
import {navigate} from '../navigation/navigationRef';

function Header({navigation}: {navigation: any}) {
  const {data: OrganizationBySKU} = useGetOrganizationBySKU();

  return (
    <SafeAreaView className="dark:bg-neutral-dark-300/90 web:backdrop-blur max-w-[450px] mx-auto  bg-neutral-0/95 border web:justify-center  android:justify-center border-neutral-0 rounded-b-[32px] dark:border-neutral-dark-400/40 -translate-y-1 shadow android:h-[100px] web:h-[80px] web:fixed web:left-1/2 web:-translate-x-1/2  w-full ios:h-[120px]  ">
      <View className="px-5 flex-row justify-between">
        <View className="w-[45px] h-[45px]">
          <Logo header />
        </View>
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={() => {
              navigation.dispatch(DrawerActions.openDrawer());
              if (Platform.OS === 'web') {
                window?.history?.pushState({name: 'Drawer'}, '', 'Drawer');
              }
            }}
            className="w-12 h-12 rounded-full items-center justify-center bg-neutral-100  dark:bg-neutral-dark-100">
            <Menu size="24" color="#717181" variant="Bold" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigate('Root', {screen: 'ProfileTab'})}>
            <ProfilePic />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default Header;
