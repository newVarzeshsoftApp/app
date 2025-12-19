import React, {useEffect} from 'react';
import {View} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type StatusDotProps = {
  isActive: boolean;
  size?: number; // dot size in px
};

const ACTIVE_COLOR = '#37c976'; // success-500

const StatusDot: React.FC<StatusDotProps> = ({isActive, size = 8}) => {
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      pulseScale.value = withRepeat(
        withTiming(2.2, {duration: 900, easing: Easing.out(Easing.quad)}),
        -1,
        true,
      );
      pulseOpacity.value = withRepeat(
        withTiming(0.35, {duration: 900, easing: Easing.out(Easing.quad)}),
        -1,
        true,
      );
    } else {
      pulseScale.value = 1;
      pulseOpacity.value = 0;
    }
  }, [isActive, pulseOpacity, pulseScale]);

  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: pulseScale.value}],
      opacity: pulseOpacity.value,
    };
  });

  if (!isActive) {
    return <View className="w-2 h-2 rounded-full bg-error-500" />;
  }

  return (
    <View
      style={{width: size, height: size}}
      className="items-center justify-center">
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: 999,
            backgroundColor: ACTIVE_COLOR,
          },
          pulseStyle,
        ]}
      />
      <View
        style={{width: size, height: size, backgroundColor: ACTIVE_COLOR}}
        className="rounded-full"
      />
    </View>
  );
};

export default StatusDot;


