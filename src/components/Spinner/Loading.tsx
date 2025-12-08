import React, {useEffect} from 'react';
import Svg, {Circle} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';

interface ISpinnerProps {
  size?: number;
  circleClassName?: string;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function Loading({size = 60, circleClassName = 'white'}: ISpinnerProps) {
  const opacity1 = useSharedValue(1);
  const opacity2 = useSharedValue(1);
  const opacity3 = useSharedValue(1);

  const translateY1 = useSharedValue(0);
  const translateY2 = useSharedValue(0);
  const translateY3 = useSharedValue(0);

  const animatedProps1 = useAnimatedProps(() => ({
    opacity: opacity1.value,
    transform: [{translateY: translateY1.value}],
  }));
  const animatedProps2 = useAnimatedProps(() => ({
    opacity: opacity2.value,
    transform: [{translateY: translateY2.value}],
  }));
  const animatedProps3 = useAnimatedProps(() => ({
    opacity: opacity3.value,
    transform: [{translateY: translateY3.value}],
  }));

  useEffect(() => {
    opacity1.value = withRepeat(
      withTiming(0, {duration: 800, easing: Easing.linear}),
      -1,
      true,
    );
    translateY1.value = withRepeat(
      withTiming(-10, {duration: 800, easing: Easing.inOut(Easing.ease)}),
      -1,
      true,
    );

    opacity2.value = withRepeat(
      withTiming(0, {duration: 900, easing: Easing.linear}),
      -1,
      true,
    );
    translateY2.value = withRepeat(
      withTiming(-10, {duration: 900, easing: Easing.inOut(Easing.ease)}),
      -1,
      true,
    );

    opacity3.value = withRepeat(
      withTiming(0, {duration: 1000, easing: Easing.linear}),
      -1,
      true,
    );
    translateY3.value = withRepeat(
      withTiming(-10, {duration: 1000, easing: Easing.inOut(Easing.ease)}),
      -1,
      true,
    );
  }, []);

  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <AnimatedCircle
        cx="40"
        cy="100"
        r="15"
        strokeWidth="15"
        fill={circleClassName}
        animatedProps={animatedProps1}
      />
      <AnimatedCircle
        cx="100"
        cy="100"
        r="15"
        strokeWidth="15"
        fill={circleClassName}
        animatedProps={animatedProps2}
      />
      <AnimatedCircle
        cx="160"
        cy="100"
        r="15"
        strokeWidth="15"
        fill={circleClassName}
        animatedProps={animatedProps3}
      />
    </Svg>
  );
}

export default Loading;
