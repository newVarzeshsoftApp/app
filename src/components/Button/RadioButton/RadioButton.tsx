import React, {useEffect, useState} from 'react';
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
import {ArrowDown2} from 'iconsax-react-native';

const RadioButton: React.FC<ICheckboxProps> = ({
  id,
  checked,
  label,
  onCheckedChange,
  asButton,
  haveArrow,
  readonly,
}) => {
  const {theme} = useTheme();

  // For web pop effect
  const [isScaled, setIsScaled] = useState(false);

  // Reanimated values for mobile
  const circleScale = useSharedValue(0);
  const radioScale = useSharedValue(1);
  const arrowRotation = useSharedValue(checked ? 0 : 90);
  const handlePress = () => {
    if (onCheckedChange && !readonly) {
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
  useEffect(() => {
    arrowRotation.value = withTiming(checked ? 0 : 90, {
      duration: 200,
      easing: Easing.out(Easing.quad),
    });
  }, [checked]);
  // Animated styles for mobile
  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{scale: circleScale.value}],
  }));

  const animatedRadioStyle = useAnimatedStyle(() => ({
    transform: [{scale: radioScale.value}],
  }));
  const animatedArrowStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${arrowRotation.value}deg`}],
  }));

  return (
    <Pressable
      onPress={handlePress}
      className={`flex-row items-center justify-between gap-2 ${
        haveArrow && 'pl-4'
      }  ${
        asButton &&
        `px-2 py-3 border rounded-full ${
          checked
            ? `border-primary-500`
            : 'border-neutral-400 dark:border-neutral-dark-700'
        }`
      }`}>
      <View className="flex-row gap-2">
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
                  : 'border-neutral-400 dark:border-neutral-dark-700 scale-100 transition-transform duration-100'
              }`}>
              {checked && (
                <View className="w-3.5 h-3.5 rounded-full bg-primary-400 dark:bg-primary-dark-400" />
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
        {label && (
          <BaseText
            type="body2"
            className=" truncate max-w-[300px]"
            color={checked ? 'base' : 'secondary'}>
            {label}
          </BaseText>
        )}
      </View>
      {haveArrow && (
        <Animated.View style={[animatedArrowStyle]}>
          <ArrowDown2 size={20} color="#717181" />
        </Animated.View>
      )}
    </Pressable>
  );
};

export default RadioButton;
