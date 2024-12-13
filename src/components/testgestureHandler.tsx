import React from 'react';
import {PanGestureHandler} from 'react-native-gesture-handler';
import {View, StyleSheet, Text} from 'react-native';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

export default function GestureTest() {
  // Shared values to track the box's position
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Gesture handler to update the position during drag
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
      context.startY = translateY.value;
    },
    onActive: (event, context) => {
      //@ts-ignore
      translateX.value = context.startX + event.translationX;
      //@ts-ignore
      translateY.value = context.startY + event.translationY;
    },
    onEnd: () => {
      console.log('Drag ended');
    },
  });

  // Animated style to move the box
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {translateX: translateX.value},
        {translateY: translateY.value},
      ],
    };
  });

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.box, animatedStyle]}>
        <Text>Drag me</Text>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 100,
    height: 100,
    backgroundColor: 'lightblue',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
});
