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
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../utils/ThemeContext';
import BaseText from '../BaseText';
import BaseButton from '../Button/BaseButton';
import {CloseCircle} from 'iconsax-react-native';
import {Portal} from 'react-native-portalize';

export interface BottomSheetProps {
  activeHeight: number;
  children?: ReactNode;
  Title?: string;
  buttonText?: string;
  onButtonPress?: () => void;
  buttonDisabled?: boolean;
  scrollView?: boolean;
  disablePan?: boolean;
}

export interface BottomSheetMethods {
  expand: () => void;
  close: () => void;
}
const BottomSheet = forwardRef<BottomSheetMethods, BottomSheetProps>(
  (
    {
      activeHeight,
      children,
      Title,
      buttonText,
      onButtonPress,
      buttonDisabled,
      disablePan,
      scrollView,
    },
    ref,
  ) => {
    const inset = useSafeAreaInsets();
    const {height} = Dimensions.get('screen');
    const newActiveHeight = height - activeHeight;
    const topAnimation = useSharedValue(height);
    const context = useSharedValue(0);
    const {theme} = useTheme();
    // ScrollView
    const scrollBegin = useSharedValue(0);
    const scrollY = useSharedValue(0);
    const [enableScroll, setEnableScroll] = useState(true);

    const closeHeight = height;

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

    const expand = useCallback(() => {
      'worklet';
      topAnimation.value = withSpring(newActiveHeight, {
        damping: 100,
        stiffness: 400,
      });
    }, []);

    const close = useCallback(() => {
      'worklet';
      topAnimation.value = withSpring(height, {
        damping: 100,
        stiffness: 400,
      });
    }, []);

    useImperativeHandle(ref, () => ({expand, close}), [expand, close]);

    const animationStyle = useAnimatedStyle(() => ({
      top: topAnimation.value,
    }));

    const backDropAnimation = useAnimatedStyle(() => {
      const opacity = interpolate(
        topAnimation.value,
        [height, newActiveHeight],
        [0, 0.5],
      );
      return {
        opacity,
        display: opacity === 0 ? 'none' : 'flex',
      };
    });

    const pan = Gesture.Pan()
      .onBegin(() => {
        context.value = topAnimation.value;
      })
      .onUpdate(event => {
        if (event.translationY < 0) {
          topAnimation.value = withSpring(newActiveHeight, {
            damping: 100,
            stiffness: 400,
          });
        } else {
          topAnimation.value = withSpring(context.value + event.translationY, {
            damping: 100,
            stiffness: 400,
          });
        }
      })
      .onEnd(() => {
        if (topAnimation.value > newActiveHeight + 50) {
          topAnimation.value = withSpring(height, {
            damping: 100,
            stiffness: 400,
          });
        } else {
          topAnimation.value = withSpring(newActiveHeight, {
            damping: 100,
            stiffness: 400,
          });
        }
      });
    const onScroll = useAnimatedScrollHandler({
      onBeginDrag: event => {
        scrollBegin.value = event.contentOffset.y;
      },
      onScroll: event => {
        scrollY.value = event.contentOffset.y;
      },
    });

    const panScroll = Gesture.Pan()
      .onBegin(() => {
        context.value = topAnimation.value;
      })
      .onUpdate(event => {
        if (event.translationY < 0) {
          topAnimation.value = withSpring(newActiveHeight, {
            damping: 100,
            stiffness: 400,
          });
        } else if (event.translationY > 0 && scrollY.value === 0) {
          runOnJS(setEnableScroll)(false);
          topAnimation.value = withSpring(
            Math.max(
              context.value + event.translationY - scrollBegin.value,
              newActiveHeight,
            ),
            {
              damping: 100,
              stiffness: 400,
            },
          );
        }
      })
      .onEnd(() => {
        runOnJS(setEnableScroll)(true);
        if (topAnimation.value > newActiveHeight + 50) {
          topAnimation.value = withSpring(closeHeight, {
            damping: 100,
            stiffness: 400,
          });
        } else {
          topAnimation.value = withSpring(newActiveHeight, {
            damping: 100,
            stiffness: 400,
          });
        }
      });

    const scrollViewGesture = Gesture.Native();

    return (
      <Portal>
        <TouchableWithoutFeedback onPress={close}>
          <Animated.View
            style={[
              styles.backDrop,
              backDropAnimation,
              {backgroundColor: 'rgba(0,0,0,0.8)'},
            ]}
          />
        </TouchableWithoutFeedback>
        <GestureDetector gesture={disablePan ? Gesture.Tap() : pan}>
          <Animated.View
            style={[
              styles.container,
              animationStyle,
              {
                paddingBottom: inset.bottom,
              },
            ]}>
            {!disablePan && (
              <View style={styles.lineContainer}>
                <View style={styles.line} />
              </View>
            )}
            <View
              className={`Container gap-4 mx-auto  flex-1 android:pb-4 web:pb-4 ${
                disablePan && 'pt-4'
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
                <GestureDetector
                  gesture={
                    disablePan
                      ? scrollViewGesture
                      : Gesture.Simultaneous(scrollViewGesture, panScroll)
                  }>
                  <Animated.ScrollView
                    scrollEnabled={enableScroll}
                    bounces={false}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    scrollEventThrottle={16}
                    onScroll={onScroll}>
                    {children}
                  </Animated.ScrollView>
                </GestureDetector>
              ) : (
                <View className="flex-grow gap-3">
                  <View className="flex-1"> {children}</View>
                  {buttonText && onButtonPress && (
                    <BaseButton
                      text={buttonText || ''}
                      disabled={buttonDisabled}
                      color="Black"
                      type="Fill"
                      rounded
                      size="Large"
                      onPress={onButtonPress}
                    />
                  )}
                </View>
              )}
            </View>
          </Animated.View>
        </GestureDetector>
      </Portal>
    );
  },
);

export default BottomSheet;
