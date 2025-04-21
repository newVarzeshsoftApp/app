import React, {useEffect, useState} from 'react';
import {View, TouchableOpacity} from 'react-native';
import {MaterialTopTabBarProps} from '@react-navigation/material-top-tabs';
import {Edges, SafeAreaView} from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import BaseText from './BaseText';
import {useTheme} from '../utils/ThemeContext';
import {navigate} from '../navigation/navigationRef';
import {ProfileTabParamsList} from '../utils/types/NavigationTypes';

interface CustomTabBarProps extends MaterialTopTabBarProps {
  customLabels?: Record<string, string>;
  tabIcons?: Record<string, React.ReactElement>;
  edges: Edges;
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({
  state,
  navigation,
  customLabels = {},
  tabIcons = {},
  edges,
}) => {
  const [tabWidth, setTabWidth] = useState<number>(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withTiming(state.index * tabWidth, {duration: 200});
  }, [state.index, tabWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value}],
  }));

  const {theme} = useTheme();
  const BaseColor = theme === 'dark' ? '#8ac14f' : '#bcdc64';
  const SecondaryColor = theme === 'dark' ? '#AAABAD' : '#55575c';
  const Border = theme === 'dark' ? '#4d4d50' : '#aaabad';

  const handleTabLayout = (event: any) => {
    const {width} = event.nativeEvent.layout;
    setTabWidth(width);
  };

  return (
    <View style={{width: '100%'}}>
      <SafeAreaView style={{flexDirection: 'row'}} edges={edges}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const label = customLabels[route.name] || route.name;
          const iconElement = tabIcons[route.name];
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigate('Root', {
                screen: 'ProfileTab',
                params: {screen: route.name as keyof ProfileTabParamsList},
              });
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              onLayout={handleTabLayout} // Get width of each tab using onLayout
              style={{
                flex: 1,
                borderBottomWidth: 1,
                borderColor: Border,
                paddingVertical: 12,
                gap: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {iconElement && (
                <View style={{marginRight: 8}}>
                  {React.cloneElement(iconElement, {
                    color: isFocused ? BaseColor : SecondaryColor,
                  })}
                </View>
              )}
              {label && (
                <BaseText
                  type="button1"
                  color={isFocused ? 'active' : 'secondary'}>
                  {label}
                </BaseText>
              )}
            </TouchableOpacity>
          );
        })}
        <Animated.View
          style={[
            {
              height: 2,
              width: tabWidth * 0.6,
              backgroundColor: '#bcdc64',
              position: 'absolute',
              bottom: 0,

              left: tabWidth * 0.2,
              borderTopStartRadius: 20,
              borderTopEndRadius: 20,
            },
            animatedStyle,
          ]}
        />
      </SafeAreaView>
    </View>
  );
};

export default CustomTabBar;
