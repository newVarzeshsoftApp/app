import React, {useState} from 'react';
import {Platform, Text, TouchableOpacity, View} from 'react-native';
import {menuItems} from '../../constants/options';
import {NavigationState, ParamListBase} from '@react-navigation/native';

import {useTranslation} from 'react-i18next';
import {useTheme} from '../../utils/ThemeContext';
import BaseText from '../BaseText';
import {ArrowLeft2} from 'iconsax-react-native';
import {Collapse} from 'react-collapse';
import {DrawerContentComponentProps} from '@react-navigation/drawer';
import Collapsible from 'react-native-collapsible';
import {CommonActions} from '@react-navigation/native';
import {navigate} from '../../navigation/navigationRef';

const getActiveRouteName = (state: NavigationState | undefined): string => {
  try {
    if (!state?.index || !state?.routes) {
      return '';
    }
    const route = state?.routes?.[state.index];
    if (!route) {
      return '';
    }
    if (route?.state && 'routes' in route.state) {
      return getActiveRouteName(route?.state as NavigationState);
    }
    return route?.name || '';
  } catch (error) {
    console.warn('Error getting active route name:', error);
    return '';
  }
};

const MenuDrawer: React.FC<DrawerContentComponentProps> = props => {
  const {t} = useTranslation('translation', {keyPrefix: 'Drawer'});
  const {theme} = useTheme();
  const [openSections, setOpenSections] = useState<{[key: number]: boolean}>(
    () => {
      const initialState: {[key: number]: boolean} = {};
      menuItems.forEach((_, index) => (initialState[index] = true));
      return initialState;
    },
  );

  const toggleSection = (index: number) => {
    setOpenSections(prevState => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const currentRoute = React.useMemo(() => {
    return getActiveRouteName(props.state);
  }, [props.state]);

  return (
    <>
      {menuItems.map((item, index) => {
        return (
          <View key={index}>
            {/* Parent Item */}
            <TouchableOpacity
              onPress={() => toggleSection(index)}
              className="bg-neutral-0 dark:bg-neutral-dark-200 flex-row justify-between px-5 py-3 rounded-2xl">
              <View className="flex-row items-center gap-3">
                <item.Icon
                  size="24"
                  color={theme === 'dark' ? '#eaeaeb' : '#232529'}
                  variant="Bold"
                />
                <BaseText type="title4">{t(item?.title)}</BaseText>
              </View>
              <View
                className={`${
                  openSections[index] ? '-rotate-90' : 'rotate-0'
                } duration-150`}>
                <ArrowLeft2
                  size="20"
                  color={theme === 'dark' ? '#eaeaeb' : '#232529'}
                />
              </View>
            </TouchableOpacity>
            {Platform.OS === 'web' ? (
              <Collapse isOpened={!!openSections[index]}>
                <View className="px-8 pt-4">
                  {item?.children?.map((child, childIndex) => {
                    const AvtiveTab = currentRoute === child?.slug;
                    return (
                      <TouchableOpacity
                        key={childIndex}
                        className={`py-3 px-8 border-r border-neutral-200 dark:border-neutral-dark-200 relative `}
                        onPress={() =>
                          navigate('Root', {
                            // @ts-ignore
                            screen: item?.slug,
                            // @ts-ignore
                            params: {screen: child?.slug},
                          })
                        }>
                        {AvtiveTab && (
                          <View className="h-[60%] w-[4px] rounded-full bg-secondary-500 absolute -right-[2.5px] top-1/2 transform -translate-y-1/2" />
                        )}
                        <BaseText
                          type="title4"
                          color={AvtiveTab ? 'base' : 'secondary'}
                          key={childIndex}>
                          {t(child?.title)}
                        </BaseText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Collapse>
            ) : (
              <Collapsible
                collapsed={!openSections[index]}
                style={{zIndex: 10}}>
                <View className="px-8 pt-4 z-10">
                  {item?.children?.map((child, childIndex) => {
                    const AvtiveTab = currentRoute === child?.slug;
                    return (
                      <TouchableOpacity
                        key={childIndex}
                        className="py-4 px-8 border-r border-neutral-200 dark:border-neutral-dark-200 z-20"
                        onPress={() =>
                          navigate('Root', {
                            // @ts-ignore
                            screen: item?.slug,
                            // @ts-ignore
                            params: {screen: child?.slug},
                          })
                        }>
                        {AvtiveTab && (
                          <View className="h-[60%] w-[4px] rounded-full bg-secondary-500 absolute -right-[2.5px] top-1/2 transform -translate-y-1/2" />
                        )}
                        <BaseText type="title4" key={childIndex}>
                          {t(child?.title)}
                        </BaseText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Collapsible>
            )}
          </View>
        );
      })}
    </>
  );
};

export default MenuDrawer;
