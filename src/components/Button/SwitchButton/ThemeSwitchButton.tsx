import React, {useEffect} from 'react';
import {Pressable, View} from 'react-native';
import CheckIcon from '../../../assets/icons/check.svg';
import CrossIcon from '../../../assets/icons/cross.svg';
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
  const translateX = useSharedValue(isDarkMode ? 50 : 4); // Start at the end if status is true, otherwise at the start

  useEffect(() => {
    // Animate the circle to move based on the status change
    translateX.value = withTiming(isDarkMode ? 50 : 4, {duration: 200});
  }, [isDarkMode]);

  // Apply the animated translation style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value}],
  }));

  return (
    <Pressable
      onPress={toggleTheme}
      className={`w-[88px] h-12 rounded-full p-1 bg-neutral-100 dark:bg-neutral-dark-100 relative`}>
      <Animated.View
        style={animatedStyle}
        className="absolute w-10 h-10 top-[3.2px] bg-neutral-900 dark:bg-neutral-dark-900 rounded-full shadow-md flex items-center justify-center z-10 ">
        {isDarkMode ? (
          <Moon
            size={24}
            variant="Bold"
            color={isDarkMode ? '#55575C' : '#F4F4F5'}
          />
        ) : (
          <Sun1
            size={24}
            variant="Bold"
            color={isDarkMode ? '#55575C' : '#F4F4F5'}
          />
        )}
      </Animated.View>
      <View className="absolute top-[9px] left-[9px] -z-1 ">
        <Sun1 size={24} variant="Bold" color={'#55575C'} />
      </View>
      <View className="absolute top-[9px] right-[9px] -z-1 ">
        <Moon size={24} variant="Bold" color={'#55575C'} />
      </View>
    </Pressable>
  );
};

export default ThemeSwitchButton;
