import React from 'react';
import {Dimensions, I18nManager, Platform, View} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../../utils/ThemeContext';
import ResponsiveImage from '../../components/ResponsiveImage';
import {useGetOrganizationBySKU} from '../../utils/hooks/Organization/useGetOrganizationBySKU';
import {BlurView} from '@react-native-community/blur';
function Banner() {
  const {width: screenWidth, height: screenHeight} = Dimensions.get('screen');
  const IsRtl = I18nManager.isRTL;
  const {theme, toggleTheme} = useTheme();
  const {data: OrganizationBySKU} = useGetOrganizationBySKU();
  return (
    <View
      style={{height: screenHeight * 0.3}}
      className={`w-full   overflow-hidden relative`}>
      <ResponsiveImage
        customSource={OrganizationBySKU?.banners[0]?.srcset}
        fallback={require('../../assets/images/testImage.png')}
        resizeMode="cover"
        style={{
          width: '100%',
          height: screenHeight * 0.6,
        }}
      />

      <View
        className={`absolute flex items-center bottom-10 flex-row gap-4 left-1/2  ${
          IsRtl ? 'translate-x-1/2' : '-translate-x-1/2'
        }  z-20 w-[185px] h-[55px] `}>
        <ResponsiveImage
          customSource={OrganizationBySKU?.brandedLogo.srcset}
          fallback={require('../../assets/images/testImage.png')}
          resizeMode="contain"
        />
      </View>
      {Platform.OS === 'web' ? (
        <View className="w-full absolute top-0 left-0 h-full backdrop-blur-sm bg-black/70"></View>
      ) : (
        <BlurView
          style={{
            position: 'absolute',
            zIndex: 1,
            bottom: -100,
            width: '100%',
            height: screenHeight * 0.6,
          }}
          blurType="dark"
          blurAmount={1}
          reducedTransparencyFallbackColor="white"
        />
      )}

      <LinearGradient
        colors={['transparent', theme === 'dark' ? '#16181b' : '#f4f4f5']} // Gradient from transparent to black
        style={{
          position: 'absolute',
          zIndex: 1,
          bottom: 0,
          width: '100%',
          height: screenHeight * 0.2,
        }}
      />
    </View>
  );
}

export default Banner;
