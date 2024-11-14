import React, {useEffect} from 'react';
import {Pressable, View, Platform} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import {useTheme} from '../../../utils/ThemeContext';
import {Moon, Sun1} from 'iconsax-react-native';

const ThemeSwitchButton = () => {
  const {toggleTheme, theme} = useTheme();
  const isDarkMode = theme === 'dark';

  // For mobile animation
  const translateX = useSharedValue(isDarkMode ? 50 : 4);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return; // Skip reanimated logic on web
    }
    // Animate the circle to move based on the theme change on mobile
    translateX.value = withTiming(isDarkMode ? 50 : 4, {duration: 200});
  }, [isDarkMode]);

  // Animated translation for mobile
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value}],
  }));

  return (
    <Pressable
      onPress={toggleTheme}
      className="w-[88px] h-12 rounded-full p-1 bg-neutral-100 dark:bg-neutral-dark-100 relative">
      {/* Moving Button */}
      {Platform.OS === 'web' ? (
        <View
          className={`${
            isDarkMode ? 'left-[45px]' : 'left-1'
          } w-10 h-10 absolute transition-all duration-200 ease-in-out bg-neutral-900 dark:bg-neutral-dark-900 rounded-full shadow-md flex items-center justify-center z-10`}>
          {isDarkMode ? (
            <Moon size={24} variant="Bold" color="#55575C" />
          ) : (
            <Sun1 size={24} variant="Bold" color="#F4F4F5" />
          )}
        </View>
      ) : (
        <Animated.View
          style={animatedStyle}
          className="absolute w-10 h-10 top-[3.2px] bg-neutral-900 dark:bg-neutral-dark-900 rounded-full shadow-md flex items-center justify-center z-10">
          {isDarkMode ? (
            <Moon size={24} variant="Bold" color="#55575C" />
          ) : (
            <Sun1 size={24} variant="Bold" color="#F4F4F5" />
          )}
        </Animated.View>
      )}

      {/* Static Icons */}
      <View
        className={`absolute  ${
          Platform.OS === 'web'
            ? 'top-[12px] left-[12px]'
            : 'top-[9px] left-[9px]'
        }  -z-1`}>
        <Sun1 size={24} variant="Bold" color="#55575C" />
      </View>
      <View
        className={`absolute ${
          Platform.OS === 'web'
            ? 'top-[12px] right-[12px]'
            : 'top-[9px] right-[9px]'
        }   -z-1`}>
        <Moon size={24} variant="Bold" color="#55575C" />
      </View>
    </Pressable>
  );
};

export default ThemeSwitchButton;
