import React from 'react';
import {Image, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Logo from '../assets/icons/Logo.svg';
import LinearGradient from 'react-native-linear-gradient';
import {useProfile} from '../utils/hooks/useProfile';
import ResponsiveImage from './ResponsiveImage';
import {useGetOrganizationBySKU} from '../utils/hooks/Organization/useGetOrganizationBySKU';

function Header() {
  const {data, isLoading, isSuccess} = useProfile();
  const {data: OrganizationBySKU} = useGetOrganizationBySKU();

  return (
    <SafeAreaView className="dark:bg-neutral-dark-300/90 web:backdrop-blur max-w-[450px] mx-auto  bg-neutral-0/80 border web:justify-center  android:justify-center border-neutral-0 rounded-b-[32px] dark:border-neutral-dark-400/40 -translate-y-1 shadow android:h-[100px] web:h-[100px] web:fixed web:left-1/2 web:-translate-x-1/2  w-full ios:h-[120px]  ">
      <View className="px-5 flex-row justify-between">
        <View className="w-[43px] h-[43px]">
          <ResponsiveImage
            customSource={OrganizationBySKU?.officialLogo.srcset}
            fallback={require('../assets/images/testImage.png')}
            resizeMode="contain"
          />
        </View>
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
    </SafeAreaView>
  );
}

export default Header;
