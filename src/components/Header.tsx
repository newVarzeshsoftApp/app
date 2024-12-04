import React from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Logo from '../assets/icons/Logo.svg';
import LinearGradient from 'react-native-linear-gradient';
import {useProfile} from '../utils/hooks/useProfile';
import ResponsiveImage from './ResponsiveImage';
import {useGetOrganizationBySKU} from '../utils/hooks/Organization/useGetOrganizationBySKU';
import {Menu} from 'iconsax-react-native';
import {DrawerActions} from '@react-navigation/native';

function Header({navigation}: {navigation: any}) {
  const {data, isLoading, isSuccess} = useProfile();
  const {data: OrganizationBySKU} = useGetOrganizationBySKU();

  return (
    <SafeAreaView className="dark:bg-neutral-dark-300/90 web:backdrop-blur max-w-[450px] mx-auto  bg-neutral-0/95 border web:justify-center  android:justify-center border-neutral-0 rounded-b-[32px] dark:border-neutral-dark-400/40 -translate-y-1 shadow android:h-[100px] web:h-[80px] web:fixed web:left-1/2 web:-translate-x-1/2  w-full ios:h-[120px]  ">
      <View className="px-5 flex-row justify-between">
        <View className="w-[45px] h-[45px]">
          <ResponsiveImage
            customSource={OrganizationBySKU?.officialLogo.srcset}
            fallback={require('../assets/images/testImage.png')}
            resizeMode="contain"
          />
        </View>
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            className="w-12 h-12 rounded-full items-center justify-center bg-neutral-100  dark:bg-neutral-dark-100">
            <Menu size="24" color="#717181" variant="Bold" />
          </TouchableOpacity>
          <LinearGradient
            colors={['#7676EE', '#9191F1', '#C9E483', '#BCDD64']}
            start={{x: 1, y: 1}}
            locations={[0, 0.3, 1]}
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View className="w-[44px] h-[44px] rounded-full dark:bg-neutral-dark-300 bg-neutral-0 justify-center items-center">
              {isLoading && (
                <View className="w-[40px] h-[40px] dark:bg-neutral-dark-300 bg-neutral-0 rounded-full animate-pulse"></View>
              )}
              {isSuccess && (
                <Image
                  className="w-[40px] h-[40px] rounded-full"
                  source={{
                    uri: `https://avatar.iran.liara.run/public/${
                      data.gender === 0 ? 'boy' : 'girl'
                    }?username=${data.firstName}`,
                  }}
                />
              )}
            </View>
          </LinearGradient>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default Header;
