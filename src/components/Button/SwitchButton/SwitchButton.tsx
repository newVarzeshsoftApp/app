import React, {useEffect} from 'react';
import {Pressable, Platform, View, I18nManager} from 'react-native';
import CheckIcon from '../../../assets/icons/check.svg';
import CrossIcon from '../../../assets/icons/cross.svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

interface SwitchButtonProps {
  status: boolean | null;
  isDisabled?: boolean;
  onPress: () => void;
}

const SwitchButton: React.FC<SwitchButtonProps> = ({
  status,
  isDisabled = false,
  onPress,
}) => {
  const isRTL = I18nManager.isRTL;
  // For mobile animation
  const translateX = useSharedValue(status ? 30 : 4);
  // Handle Press
  const handlePress = () => {
    if (!isDisabled && onPress) {
      onPress();
    }
  };

  useEffect(() => {
    if (Platform.OS === 'web') {
      return; // Skip reanimated logic on web
    }
    // Animate the circle to move based on the status change for mobile
    translateX.value = withTiming(
      status ? (isRTL ? -30 : 30) : isRTL ? -4 : 4,
      {duration: 200},
    );
  }, [status]);

  // Apply the animated translation style for mobile
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value}],
  }));

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      className={`w-16 h-8 rounded-full p-1 ${
        status
          ? 'bg-primary-600 dark:bg-text-Primary600-dark'
          : 'bg-neutral-500'
      } ${isDisabled && 'opacity-50'}`}>
      {Platform.OS === 'web' ? (
        <View
          className={`${
            status ? 'left-[36px]' : 'left-1'
          } w-6 h-6 absolute transition-all duration-200 ease-in-out bg-white dark:bg-neutral-dark-0 rounded-full shadow-md flex items-center justify-center`}>
          {status ? (
            <CheckIcon width={16} height={16} stroke="#BCDD64" />
          ) : (
            <CrossIcon width={16} height={16} stroke="gray" />
          )}
        </View>
      ) : (
        <Animated.View
          style={animatedStyle}
          className="absolute w-6 h-6 top-[3.2px] bg-white dark:bg-neutral-dark-0 rounded-full shadow-md flex items-center justify-center">
          {status ? (
            <CheckIcon width={16} height={16} stroke="#BCDD64" />
          ) : (
            <CrossIcon width={16} height={16} stroke="gray" />
          )}
        </Animated.View>
      )}
    </Pressable>
  );
};

export default SwitchButton;
