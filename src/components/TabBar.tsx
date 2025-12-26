import React from 'react';
import {TouchableOpacity, Text, View, StyleProp, ViewStyle} from 'react-native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {CommonActions} from '@react-navigation/native';
import {
  CalendarAdd,
  Home2,
  Message,
  Profile,
  ProfileCircle,
  ShoppingBag,
  Wallet2,
} from 'iconsax-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import BaseText from './BaseText';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../utils/ThemeContext';
import {useCartContext} from '../utils/CartContext';
import {navigate} from '../navigation/navigationRef';
import {navigationRef} from '../navigation/navigationRef';
import {HomeStackParamList} from '../utils/types/NavigationTypes';

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
    reserve: <CalendarAdd size="24" />,
    cart: <ShoppingBag size="24" />,
    wallet: <Wallet2 size="24" />,
    myServices: <Profile size="24" />,
  };
  const {totalItems} = useCartContext();
  const focusedRoute = state.routes[state.index];
  const focusedDescriptor = descriptors[focusedRoute.key];
  const tabBarStyle = focusedDescriptor.options.tabBarStyle as
    | StyleProp<ViewStyle>
    | undefined;

  return (
    <View
      style={tabBarStyle}
      className="flex-row ios:absolute android:absolute bottom-7  web:backdrop-blur max-w-[408px] mx-auto  left-[18px] right-[18px] web:fixed web:bottom-4 
    justify-around items-center dark:bg-neutral-dark-300/80
     bg-neutral-0/80 border border-neutral-0 dark:border-neutral-dark-400/40 
     px-4 py-2 rounded-full shadow-lg gap-1">
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

          if (!event.defaultPrevented) {
            // For reserve tab, always reset to the initial screen (reserve)
            // even if already focused, to reset the stack to initial route
            if (route.name === 'reserve') {
              // Navigate to reserve tab first if not focused
              if (!isFocused) {
                navigate('Root', {
                  screen: 'HomeNavigator',
                  params: {
                    screen: 'reserve' as keyof HomeStackParamList,
                  } as any,
                });
              }

              // Reset ReserveStackNavigator to initial route (reserve)
              // If we're on a nested route (e.g., reserveDetail), reset the stack to 'reserve'
              const reserveRoute = state.routes.find(r => r.name === 'reserve');
              if (
                reserveRoute?.state &&
                reserveRoute.state.index !== undefined &&
                reserveRoute.state.index > 0
              ) {
                // Use navigationRef to navigate to reserve tab with undefined params
                // This will reset the nested ReserveStackNavigator to initial route
                if (navigationRef.isReady()) {
                  navigationRef.navigate('Root' as any, {
                    screen: 'HomeNavigator',
                    params: {
                      screen: 'reserve',
                      params: undefined, // This resets nested stack to initial route
                    },
                  });
                }
              }
            } else if (!isFocused) {
              navigate('Root', {
                screen: 'HomeNavigator',
                params: {screen: route.name as keyof HomeStackParamList} as any,
              });
            }
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
          <TouchableOpacity onPress={onPress} key={index}>
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
              <View className="w-[24px] h-[24px] relative">
                {React.cloneElement(iconElement, {
                  color: iconColor,
                  variant: 'Bold',
                })}
                {totalItems > 0 && route.name === 'cart' && (
                  <View
                    className="absolute top-[2px] right-0 w-4 h-4 bg-primary-500 z-10 rounded-2xl flex items-center justify-center"
                    style={{transform: [{translateX: 8}, {translateY: -8}]}}>
                    <BaseText type="badge" color="button">
                      {totalItems}
                    </BaseText>
                  </View>
                )}
                <View className="absolute"></View>
              </View>
              {isFocused && (
                <Animated.View
                  style={[animatedTextStyle]}
                  className="flex-row items-center">
                  <BaseText type="subtitle3" color="button">
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
