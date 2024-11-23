import React from 'react';
import {Dimensions, I18nManager, Image, Platform, View} from 'react-native';
import Logo from '../../assets/icons/Logo.svg';
import LogoWithText from '../../assets/icons/LogoWithText.svg';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../../utils/ThemeContext';

function Banner() {
  const {width: screenWidth, height: screenHeight} = Dimensions.get('screen');
  const IsRtl = I18nManager.isRTL;
  const {theme, toggleTheme} = useTheme();

  return (
    <View
      style={{height: screenHeight * 0.3}}
      className={`w-full rounded-b-3xl  overflow-hidden relative`}>
      <Image
        source={require('../../assets/testImage.png')}
        resizeMode="cover"
        style={{
          width: '100%',
          height: screenHeight * 0.6,
        }}
      />
      <View
        className={`absolute flex items-center bottom-10 flex-row gap-4 left-1/2  ${
          IsRtl ? 'translate-x-1/2' : '-translate-x-1/2'
        }  z-20 `}>
        <LogoWithText width={155} height={55} />
        <Logo width={55} height={55} />
      </View>

      <LinearGradient
        colors={['transparent', theme === 'dark' ? '#16181b' : '#F4F4F5']} // Gradient from transparent to black
        style={{
          position: 'absolute',
          zIndex: 1,
          bottom: 0,
          width: '100%',
          height: screenHeight * 0.6,
        }}
      />
    </View>
  );
}

export default Banner;
