import React from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import {ArrowRight2} from 'iconsax-react-native';
import BaseButton from '../Button/BaseButton';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import BaseText from '../BaseText';
import Animated, {
  Extrapolate,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {useTheme} from '../../utils/ThemeContext';
import {goBackSafe} from '../../navigation/navigationRef';
import {useNavigation} from '@react-navigation/native';

// Make SafeAreaView animatable
const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);

type NavigationHeaderProps = {
  navigation?: NativeStackNavigationProp<any, any>;
  title?: string | undefined;
  onBackPress?: () => void;
  MainBack?: boolean;
  scrollY?: Animated.SharedValue<number>;
  range?: number[];
  rangeColor?: any;
  CenterText?: Boolean;
};

const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  title = '',
  onBackPress,
  range,
  MainBack,
  scrollY,
  rangeColor,
  CenterText,
}) => {
  const {theme} = useTheme();
  const baseRange = theme === 'dark' ? '#1b1d21' : '#f4f4f5';
  const navigate = useNavigation();
  // Animated style for the SafeAreaView
  const SafeAreaAnimatedStyle = useAnimatedStyle(() => {
    if (scrollY && range) {
      return {
        backgroundColor: interpolateColor(
          scrollY.value,
          range,
          rangeColor ? rangeColor : ['rgba(0, 0, 0, 0)', baseRange],
        ),
      };
    }
    return {};
  });

  const TextAnimatedStyle = useAnimatedStyle(() => {
    if (scrollY && range && !CenterText) {
      const opacity = interpolate(
        scrollY.value,
        range,
        [0, 1],
        Extrapolate.CLAMP,
      );
      const translateX = interpolate(
        scrollY.value,
        range,
        [-20, 0],
        Extrapolate.CLAMP,
      );
      return {
        opacity,
        transform: [{translateX}],
      };
    }
    return {};
  });

  return (
    <AnimatedSafeAreaView
      edges={['top']}
      style={[SafeAreaAnimatedStyle, {zIndex: 999}]}>
      <Animated.View style={[styles.container]}>
        <View style={styles.leftButton}>
          <BaseButton
            onPress={() => (MainBack ? navigate.goBack() : goBackSafe())}
            noText
            LeftIcon={ArrowRight2}
            type="Outline"
            color="Black"
            rounded
          />
        </View>
        {title ? (
          <Animated.View
            style={[
              TextAnimatedStyle,
              CenterText ? styles.centeredTitle : styles.defaultTitle,
            ]}>
            <BaseText type="body3">{title}</BaseText>
          </Animated.View>
        ) : null}
      </Animated.View>
    </AnimatedSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: Platform.OS === 'web' ? 20 : 10,
    paddingBottom: Platform.OS === 'web' ? 20 : 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0,
    elevation: 0,
  },
  leftButton: {
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
  },
  defaultTitle: {
    alignSelf: 'center',
  },
  centeredTitle: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NavigationHeader;
