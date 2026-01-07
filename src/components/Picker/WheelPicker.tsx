import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ViewStyle, TextStyle} from 'react-native';
import {
  PanGestureHandler,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
  SharedValue,
} from 'react-native-reanimated';
import BaseText from '../BaseText';

const ITEM_HEIGHT = 40;

interface WheelPickerItem {
  value: string;
  label: string;
}

interface WheelPickerProps {
  values: WheelPickerItem[];
  defaultValue?: string;
  onChange: (item: WheelPickerItem) => void;
  containerStyle?: ViewStyle;
  visibleItemCount?: number;
  position: 'CENTER' | 'LEFT' | 'RIGHT' | 'SINGLE';
}

const WheelPicker: React.FC<WheelPickerProps> = ({
  values,
  defaultValue,
  onChange,
  containerStyle,
  visibleItemCount = 6,
  position,
}) => {
  const translateY = useSharedValue(0);
  const selectedIndexShared = useSharedValue<number>(
    defaultValue ? values.findIndex(item => item.value === defaultValue) : 0,
  );
  const [selectedIndex, setSelectedIndex] = useState<number>(
    defaultValue ? values.findIndex(item => item.value === defaultValue) : 0,
  );

  const centerIndexOffset = Math.floor(visibleItemCount / 2);

  useEffect(() => {
    if (defaultValue) {
      const index = values.findIndex(item => item.value === defaultValue);
      translateY.value = -(index - centerIndexOffset) * ITEM_HEIGHT;
      selectedIndexShared.value = index;
      setSelectedIndex(index);
    }
  }, [defaultValue, visibleItemCount]);

  const snapToIndex = (index: number) => {
    translateY.value = withSpring(-(index - centerIndexOffset) * ITEM_HEIGHT, {
      damping: 80,
      stiffness: 100,
      mass: 1,
    });
    selectedIndexShared.value = index;
    runOnJS(setSelectedIndex)(index);
    runOnJS(onChange)(values[index]);
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_: any, context: {startY: number}) => {
      context.startY = translateY.value;
    },
    onActive: (event: {translationY: number}, context: {startY: number}) => {
      translateY.value = context.startY + event.translationY;

      const currentOffset = translateY.value;
      const index = Math.round(
        (centerIndexOffset * ITEM_HEIGHT - currentOffset) / ITEM_HEIGHT,
      );
      const clampedIndex = Math.max(0, Math.min(values.length - 1, index));

      if (clampedIndex !== selectedIndexShared.value) {
        selectedIndexShared.value = clampedIndex;
        runOnJS(setSelectedIndex)(clampedIndex);
        runOnJS(onChange)(values[clampedIndex]);
      }
    },
    onEnd: () => {
      const index = Math.round(
        (centerIndexOffset * ITEM_HEIGHT - translateY.value) / ITEM_HEIGHT,
      );
      const clampedIndex = Math.max(0, Math.min(values.length - 1, index));
      snapToIndex(clampedIndex);
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateY: translateY.value}],
  }));

  // Separate component for each item to avoid hooks in loop
  const WheelPickerItem: React.FC<{
    item: WheelPickerItem;
    index: number;
    selectedIndexShared: SharedValue<number>;
    centerIndexOffset: number;
    onPress: () => void;
  }> = ({item, index, selectedIndexShared, centerIndexOffset, onPress}) => {
    const animatedItemStyle = useAnimatedStyle(() => {
      const distanceFromSelected = index - selectedIndexShared.value;

      const opacity = interpolate(
        Math.abs(distanceFromSelected),
        [0, centerIndexOffset],
        [1, 0.2], // Higher minimum opacity for smoother fade-out
        Extrapolate.CLAMP,
      );

      const rotateX = interpolate(
        distanceFromSelected,
        [-centerIndexOffset, 0, centerIndexOffset],
        [-50, 0, 50], // Reduced rotation for a subtler effect
        Extrapolate.CLAMP,
      );

      return {
        opacity,
        transform: [
          {perspective: 1000}, // Lower perspective for a more natural 3D effect
          {rotateX: `${rotateX}deg`},
        ],
      };
    });

    return (
      <Animated.View
        style={[
          styles.itemContainer,
          {height: ITEM_HEIGHT},
          animatedItemStyle,
        ]}>
        <TouchableWithoutFeedback onPress={onPress}>
          <BaseText type="subtitle1" color="secondary">
            {item.label || ''}
          </BaseText>
        </TouchableWithoutFeedback>
      </Animated.View>
    );
  };

  return (
    <View
      className="w-full  items-center relative overflow-hidden"
      style={[{height: ITEM_HEIGHT * visibleItemCount}, containerStyle]}>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.list, animatedStyle]}>
          {values.map((item, index) => (
            <WheelPickerItem
              key={index}
              item={item}
              index={index}
              selectedIndexShared={selectedIndexShared}
              centerIndexOffset={centerIndexOffset}
              onPress={() => snapToIndex(index)}
            />
          ))}
        </Animated.View>
      </PanGestureHandler>
      <View
        className={`dark:bg-neutral-dark-300 bg-neutral-0 -z-10 ${
          position === 'LEFT'
            ? 'rounded-e-xl'
            : position === 'RIGHT'
            ? 'rounded-s-xl'
            : position === 'CENTER'
            ? ''
            : 'rounded-xl'
        }`}
        style={[
          styles.highlight,
          {
            top: ITEM_HEIGHT * centerIndexOffset,
            height: ITEM_HEIGHT,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
  },
  itemContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
    color: '#999',
  },
  selectedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  highlight: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});

export default WheelPicker;
