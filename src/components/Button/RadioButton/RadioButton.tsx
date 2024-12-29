import React, {useState} from 'react';
import {Pressable, View, Text, Platform} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import {useTheme} from '../../../utils/ThemeContext';
import {ICheckboxProps} from '../../../models/props';
import BaseText from '../../BaseText';

const RadioButton: React.FC<ICheckboxProps> = ({
  id,
  checked,
  onCheckedChange,
  label,
  asButton,
}) => {
  const {theme} = useTheme();

  // For web pop effect
  const [isScaled, setIsScaled] = useState(false);

  // Reanimated values for mobile
  const circleScale = useSharedValue(0);
  const radioScale = useSharedValue(1);

  const handlePress = () => {
    if (onCheckedChange) {
      onCheckedChange(!checked);
    }

    if (Platform.OS === 'web') {
      // Web-only scale effect
      setIsScaled(true);
      setTimeout(() => setIsScaled(false), 250); // Reset scale after a brief delay
    } else {
      // Mobile animation with reanimated
      circleScale.value = withSequence(
        withTiming(1.2, {duration: 200, easing: Easing.out(Easing.quad)}),
        withTiming(0, {duration: 200, easing: Easing.in(Easing.quad)}),
      );

      radioScale.value = withSequence(
        withTiming(1.2, {duration: 100, easing: Easing.out(Easing.quad)}),
        withTiming(1, {duration: 100, easing: Easing.in(Easing.quad)}),
      );
    }
  };

  // Animated styles for mobile
  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{scale: circleScale.value}],
  }));

  const animatedRadioStyle = useAnimatedStyle(() => ({
    transform: [{scale: radioScale.value}],
  }));

  return (
    <Pressable
      onPress={handlePress}
      className={`flex-row items-center gap-2  ${
        asButton &&
        `p-2 border rounded-full ${
          checked
            ? `border-primary-500`
            : 'border-neutral-300 dark:border-neutral-dark-300'
        }`
      }`}>
      <View className="relative">
        {/* Background circle */}
        {Platform.OS === 'web' ? (
          <View
            className={`absolute -top-[8px] -left-[8px] w-10 h-10 rounded-full transition-transform duration-200 ${
              isScaled ? '' : 'scale-0'
            } ${checked ? 'bg-primary-100  ' : ''} dark:bg-primary-dark-100`}
          />
        ) : (
          <Animated.View
            style={animatedCircleStyle}
            className="absolute -top-[7px] -left-[7px] w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-dark-100"
          />
        )}

        {/* Radio button */}
        {Platform.OS === 'web' ? (
          <View
            className={`w-6 h-6 rounded-full flex items-center border justify-center ${
              checked
                ? `border-primary-500 ${
                    isScaled ? 'scale-110' : 'scale-100'
                  } transition-transform duration-100`
                : 'border-neutral-300 dark:border-neutral-dark-300 scale-100 transition-transform duration-100'
            }`}>
            {checked && (
              <View className="w-3 h-3 rounded-full bg-primary-400 dark:bg-primary-dark-400" />
            )}
          </View>
        ) : (
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
        )}
      </View>
      {label && <BaseText color={'base'}>{label}</BaseText>}
    </Pressable>
  );
};

export default RadioButton;
