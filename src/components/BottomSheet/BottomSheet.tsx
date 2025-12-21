/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  forwardRef,
  useImperativeHandle,
  useCallback,
  ReactNode,
  useState,
} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  useAnimatedScrollHandler,
  runOnJS,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {Portal} from 'react-native-portalize';

import {useTheme} from '../../utils/ThemeContext';
import BaseText from '../BaseText';
import BaseButton from '../Button/BaseButton';
import {CloseCircle} from 'iconsax-react-native';

export interface BottomSheetProps {
  /**
   * Snap points in percentages, e.g. `[30, 80, 20]`
   * The first value in the array will be used as the "initial" snap
   * when calling `.expand()`.
   */
  snapPoints: number[];

  children?: ReactNode;
  Title?: string;
  buttonText?: string;
  onButtonPress?: () => void;
  deleteButtonText?: string;
  onDeleteButtonPress?: () => void;
  buttonDisabled?: boolean;
  scrollView?: boolean;
  disablePan?: boolean;
}

export interface BottomSheetMethods {
  expand: () => void;
  close: () => void;
}

/**
 * Utility to clamp a number between two values.
 */
const clamp = (value: number, min: number, max: number) => {
  'worklet';
  return Math.max(min, Math.min(value, max));
};

const BottomSheet = forwardRef<BottomSheetMethods, BottomSheetProps>(
  (
    {
      snapPoints,
      children,
      Title,
      buttonText,
      onButtonPress,
      buttonDisabled,
      disablePan,
      scrollView,
      deleteButtonText,
      onDeleteButtonPress,
    },
    ref,
  ) => {
    const [visible, setVisible] = useState(false);
    const insets = useSafeAreaInsets();
    const screenDimensions = Dimensions.get('screen');
    const windowDimensions = Dimensions.get('window');
    // Use window height instead of screen height to exclude status bar and navigation bar
    // Subtract top inset (status bar) to get the actual usable height
    // For snap points calculation, we use window height minus top inset
    const usableHeight = windowDimensions.height - insets.top;
    const {theme} = useTheme();

    /**
     * 1) Convert each user snapPoint % => top offset
     *    preserve array order so [30,80,20] => [0.7*h, 0.2*h, 0.8*h]
     *    - `snapOffsetsInOrder[0]` => the offset for the "first" snap point.
     *    We use usableHeight and add top inset to position correctly
     */
    const snapOffsetsInOrder = snapPoints.map(
      p => insets.top + usableHeight * (1 - p / 100),
    );

    /**
     * 2) For "nearest" snapping after drag, we want a sorted array
     *    e.g. [0.2*h, 0.7*h, 0.8*h]
     *    - The smallest offset => largest coverage
     *    - The largest offset => smallest coverage
     */
    const sortedSnapOffsets = [...snapOffsetsInOrder].sort((a, b) => a - b);

    // The first item in user array => initial snap offset
    const initialSnapOffset = snapOffsetsInOrder[0];
    // The last offset in sorted array => smallest coverage => biggest number
    const lastSnapOffset = sortedSnapOffsets[sortedSnapOffsets.length - 1];
    // The smallest offset => largest coverage => sortedSnapOffsets[0]

    // Reanimated shared values
    // Start from full screen height (including safe areas)
    const maxHeight = screenDimensions.height;
    const topAnimation = useSharedValue(maxHeight); // fully hidden by default
    const context = useSharedValue(0);

    // For scrollable content
    const scrollBegin = useSharedValue(0);
    const scrollY = useSharedValue(0);
    const [enableScroll, setEnableScroll] = useState(true);

    const isDarkMode = theme === 'dark';

    const styles = StyleSheet.create({
      container: {
        position: 'absolute',
        backgroundColor: isDarkMode ? '#24262C' : '#F8F8F9',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
        borderWidth: 1,
        borderColor: isDarkMode ? '#24262C' : 'white',
      },
      lineContainer: {
        marginVertical: 10,
        alignItems: 'center',
      },
      line: {
        width: 100,
        height: 4,
        backgroundColor: isDarkMode ? '#2A2D33' : '#D4D5D6',
        borderRadius: 100,
      },
      backDrop: {
        position: 'absolute',
        zIndex: 999,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        display: 'none',
      },
    });

    // ================ Imperative methods =================
    const expand = useCallback(() => {
      setVisible(true);
      topAnimation.value = withSpring(initialSnapOffset, {
        damping: 100,
        stiffness: 400,
      });
    }, [initialSnapOffset]);

    const close = useCallback(() => {
      topAnimation.value = withSpring(
        maxHeight,
        {
          damping: 100,
          stiffness: 400,
        },
        isFinished => {
          if (isFinished) {
            runOnJS(setVisible)(false);
          }
        },
      );
    }, [maxHeight]);

    useImperativeHandle(ref, () => ({expand, close}), [expand, close]);

    // ================ Animations =================
    const animationStyle = useAnimatedStyle(() => ({
      top: topAnimation.value,
    }));

    const backDropAnimation = useAnimatedStyle(() => {
      const opacity = interpolate(
        topAnimation.value,
        [maxHeight, initialSnapOffset],
        [0, 0.5],
      );
      return {
        opacity,
        display: opacity === 0 ? 'none' : 'flex',
      };
    });

    // ================ Nearest Snap Logic =================
    const findClosestSnap = (value: number) => {
      'worklet';
      let closest = sortedSnapOffsets[0];
      let minDist = Math.abs(value - sortedSnapOffsets[0]);
      for (let i = 1; i < sortedSnapOffsets.length; i++) {
        const dist = Math.abs(value - sortedSnapOffsets[i]);
        if (dist < minDist) {
          minDist = dist;
          closest = sortedSnapOffsets[i];
        }
      }
      return closest;
    };

    // ================ Gesture: Non-Scroll =================
    const pan = Gesture.Pan()
      .onBegin(() => {
        context.value = topAnimation.value;
      })
      .onUpdate(event => {
        // We simply add the drag translation to the existing offset
        // and clamp it between min offset & max offset in sortedSnapOffsets.
        const minOffset = sortedSnapOffsets[0]; // e.g. 0.2*height
        const maxOffset = sortedSnapOffsets[sortedSnapOffsets.length - 1]; // e.g. 0.8*height

        // Proposed new offset
        let newOffset = context.value + event.translationY;

        // Keep it in range
        newOffset = clamp(newOffset, minOffset, maxHeight);
        topAnimation.value = newOffset;
      })
      .onEnd(() => {
        runOnJS(setEnableScroll)(true);

        if (topAnimation.value > lastSnapOffset + 50) {
          topAnimation.value = withSpring(
            maxHeight,
            {
              damping: 100,
              stiffness: 400,
            },
            isFinished => {
              if (isFinished) {
                runOnJS(setVisible)(false);
              }
            },
          );
        } else {
          const closestSnap = findClosestSnap(topAnimation.value);
          topAnimation.value = withSpring(closestSnap, {
            damping: 100,
            stiffness: 400,
          });
        }
      });

    // ================ Gesture: Scrollable =================
    const onScroll = useAnimatedScrollHandler({
      onBeginDrag: event => {
        scrollBegin.value = event?.contentOffset?.y;
      },
      onScroll: event => {
        scrollY.value = event?.contentOffset?.y;
      },
    });

    const panScroll = Gesture.Pan()
      .onBegin(() => {
        context.value = topAnimation.value;
      })
      .onUpdate(event => {
        const minOffset = sortedSnapOffsets[0];
        const maxOffset = maxHeight;
        let newOffset = context.value + event.translationY - scrollBegin.value;

        newOffset = clamp(newOffset, minOffset, maxOffset);

        if (scrollY.value === 0 || event.translationY < 0) {
          runOnJS(setEnableScroll)(false);
          topAnimation.value = newOffset;
        }
      })
      .onEnd(() => {
        runOnJS(setEnableScroll)(true);

        if (topAnimation.value > lastSnapOffset + 50) {
          // close
          topAnimation.value = withSpring(maxHeight, {
            damping: 100,
            stiffness: 400,
          });
        } else {
          // nearest snap
          const closestSnap = findClosestSnap(topAnimation.value);
          topAnimation.value = withSpring(closestSnap, {
            damping: 100,
            stiffness: 400,
          });
        }
      });

    // Combine scroll & pan gestures for the ScrollView
    const scrollViewGesture = Gesture.Native();
    if (!visible) return null;

    return (
      <Portal>
        <SafeAreaView edges={['bottom']} style={{flex: 1}}>
          {/* Backdrop */}
          {visible && (
            <Animated.View style={[StyleSheet.absoluteFill, backDropAnimation]}>
              <TouchableWithoutFeedback onPress={close}>
                <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,1)'}} />
              </TouchableWithoutFeedback>
            </Animated.View>
          )}
          {/* Main container with gesture handling */}
          <GestureDetector gesture={disablePan ? Gesture.Tap() : pan}>
            <Animated.View
              style={[
                styles.container,
                animationStyle,
                {
                  paddingBottom: insets.bottom,
                },
              ]}>
              {/* Optional "grabber line" */}
              {!disablePan && (
                <View style={styles.lineContainer}>
                  <View style={styles.line} />
                </View>
              )}

              <View
                style={{
                  flex: 1,
                  paddingBottom: Math.max(insets.bottom, 16), // Ensure buttons are above safe area
                }}
                className={`Container gap-4 mx-auto ${
                  disablePan ? 'pt-4' : ''
                }`}>
                {Title && (
                  <View className="flex-row items-center justify-between">
                    <BaseText type="title4">{Title || ''}</BaseText>
                    <BaseButton
                      onPress={close}
                      LeftIcon={CloseCircle}
                      size="Medium"
                      type="TextButton"
                      noText
                      color="Black"
                    />
                  </View>
                )}

                {scrollView ? (
                  // Scrollable Content
                  <GestureDetector
                    gesture={
                      disablePan
                        ? scrollViewGesture
                        : Gesture.Simultaneous(scrollViewGesture, panScroll)
                    }>
                    <Animated.ScrollView
                      className={'relative'}
                      scrollEnabled={enableScroll}
                      showsHorizontalScrollIndicator={false}
                      showsVerticalScrollIndicator={false}
                      scrollEventThrottle={16}
                      style={{
                        flex: 1,
                        paddingBottom: Math.max(insets.bottom, 40),
                      }}
                      onScroll={onScroll}>
                      {children}
                    </Animated.ScrollView>
                  </GestureDetector>
                ) : (
                  // Non-scrollable Content
                  <View className="flex-grow gap-3">
                    <View className="flex-1">{children}</View>
                    <View className="flex-row  justify-center gap-3">
                      {deleteButtonText && onDeleteButtonPress && (
                        <BaseButton
                          text={deleteButtonText || ''}
                          // disabled={buttonDisabled}
                          color="Black"
                          type="Tonal"
                          role="button"
                          redbutton
                          rounded
                          Extraclass="flex-1"
                          size="Large"
                          onPress={onDeleteButtonPress}
                        />
                      )}
                      {buttonText && onButtonPress && (
                        <BaseButton
                          text={buttonText || ''}
                          disabled={buttonDisabled}
                          color="Black"
                          role="button"
                          type="Fill"
                          rounded
                          Extraclass="flex-1"
                          size="Large"
                          onPress={onButtonPress}
                        />
                      )}
                    </View>
                  </View>
                )}
              </View>
            </Animated.View>
          </GestureDetector>
        </SafeAreaView>
      </Portal>
    );
  },
);

export default BottomSheet;
