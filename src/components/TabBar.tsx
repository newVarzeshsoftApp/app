import React from 'react';
import {TouchableOpacity, Text, View, StyleProp, ViewStyle} from 'react-native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {Home2, Message, ShoppingBag, Wallet2} from 'iconsax-react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import BaseText from './BaseText';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../utils/ThemeContext';

const TabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
  ...props
}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Global'});
  const {theme} = useTheme();
  const tabIcons: Record<string, React.ReactElement> = {
    Home: <Home2 size="24" />,
    ticket: <Message size="24" />,
    cart: <ShoppingBag size="24" />,
    wallet: <Wallet2 size="24" />,
  };

  const focusedRoute = state.routes[state.index];
  const focusedDescriptor = descriptors[focusedRoute.key];
  const tabBarStyle = focusedDescriptor.options.tabBarStyle as
    | StyleProp<ViewStyle>
    | undefined;

  return (
    <View
      style={tabBarStyle}
      className="flex-row ios:absolute bottom-7 web:backdrop-blur max-w-[420px] mx-auto  left-[18px] right-[18px] web:fixed web:bottom-4 
    justify-around items-center dark:bg-neutral-dark-300/80
     bg-neutral-0/80 border border-neutral-0 dark:border-neutral-dark-400/40 
     p-4 rounded-full shadow-lg gap-1">
      {state.routes.map((route, index) => {
        const {options} = descriptors[route.key];
        const label =
          typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : route.name;
        const isFocused = state.index === index;

        // Shared values for animations
        const width = useSharedValue(30);
        const backgroundColor = useSharedValue('transparent');
        const textOpacity = useSharedValue(0);

        // Animated styles
        const animatedContainerStyle = useAnimatedStyle(() => ({
          width: withTiming(width.value, {duration: 300}),
          backgroundColor: withTiming(backgroundColor.value, {
            duration: 300,
          }),
        }));

        const animatedTextStyle = useAnimatedStyle(() => ({
          opacity: withTiming(textOpacity.value, {duration: 300}),
        }));

        React.useEffect(() => {
          if (isFocused) {
            // On focus, expand width and show text
            width.value = 100;
            backgroundColor.value = theme === 'dark' ? '#FFFFFF' : '#1B1D21';
            textOpacity.value = 1;
          } else {
            // On blur, collapse width and hide text
            textOpacity.value = 0;
            width.value = 30;
            backgroundColor.value = 'transparent';
          }
        }, [isFocused, theme]);

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const iconColor =
          theme === 'dark'
            ? isFocused
              ? '#16181B'
              : '#55575C'
            : isFocused
            ? '#FFFFFF'
            : '#AAABAD';

        const iconElement = tabIcons[route.name] || <Home2 size="24" />;

        return (
          <TouchableOpacity key={index} onPress={onPress}>
            <Animated.View
              style={[
                {
                  height: 50,
                  borderRadius: 999,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  // overflow: 'hidden',

                  paddingHorizontal: 8,
                },
                animatedContainerStyle,
              ]}>
              <View className="w-[24px] h-[24px]">
                {React.cloneElement(iconElement, {
                  color: iconColor,
                  variant: 'Bold',
                })}
              </View>
              {isFocused && (
                <Animated.View
                  style={[animatedTextStyle]}
                  className="flex-row items-center">
                  <BaseText type="caption" color="button">
                    {t(label)}
                  </BaseText>
                </Animated.View>
              )}
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default TabBar;
