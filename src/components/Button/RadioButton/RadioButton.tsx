import React from 'react';
import {Pressable, View, Text} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import {useTheme} from '../../../utils/ThemeContext';
import {ICheckboxProps} from '../../../models/props';

const RadioButton: React.FC<ICheckboxProps> = ({
  id,
  checked,
  onPress,
  label,
}) => {
  const {theme} = useTheme();
  // Animation values for the background circle and the pop effect on the radio button itself
  const circleScale = useSharedValue(0);
  const radioScale = useSharedValue(1);

  const handlePress = () => {
    if (onPress) {
      onPress(!checked);
    }
    // Animate the background circle from scale 0 to 1, and then back to 0
    circleScale.value = withSequence(
      withTiming(1.2, {duration: 200, easing: Easing.out(Easing.quad)}), // Expand to full size
      withTiming(0, {duration: 200, easing: Easing.in(Easing.quad)}), // Shrink back to 0
    );

    // Pop animation for the radio button circle
    radioScale.value = withSequence(
      withTiming(1.2, {duration: 100, easing: Easing.out(Easing.quad)}), // Slightly larger
      withTiming(1, {duration: 100, easing: Easing.in(Easing.quad)}), // Return to normal size
    );
  };

  // Animated style for the background circle
  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{scale: circleScale.value}],
  }));

  // Animated style for the radio button pop effect
  const animatedRadioStyle = useAnimatedStyle(() => ({
    transform: [{scale: radioScale.value}],
  }));

  return (
    <View className="flex-row items-center space-x-2">
      <Pressable onPress={handlePress} className="relative">
        {/* Background circle that scales down */}
        <Animated.View
          style={animatedCircleStyle}
          className="absolute -top-[7px] -left-[7px] w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-dark-100 z-[-1]"
        />

        {/* Radio button with pop animation */}
        <Animated.View
          style={animatedRadioStyle}
          className={`w-6 h-6 rounded-full flex items-center border justify-center ${
            checked
              ? 'border-primary-500'
              : 'border-neutral-300 dark:border-neutral-dark-300'
          }`}>
          {checked && (
            <View className="w-3 h-3 rounded-full bg-primary-400 dark:bg-primary-dark-400" />
          )}
        </Animated.View>
      </Pressable>

      {label && (
        <Text className={`text-${theme === 'dark' ? 'white' : 'gray-700'}`}>
          {label}
        </Text>
      )}
    </View>
  );
};

export default RadioButton;
