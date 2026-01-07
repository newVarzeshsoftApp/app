import React, {useEffect, useRef, useCallback} from 'react';
import {View, Animated, TouchableOpacity, Platform} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import BaseText from '../../BaseText';
import {TickCircle, Gift} from 'iconsax-react-native';
import {useTranslation} from 'react-i18next';
import {ClipboardTickDarkIcon, ClipboardTickIcon} from '../../../assets/icons';
import {navigate} from '../../../navigation/navigationRef';
import {useTheme} from '../../../utils/ThemeContext';

interface SurveySuccessNotificationProps {
  hasGift: boolean;
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

const SurveySuccessNotification: React.FC<SurveySuccessNotificationProps> = ({
  hasGift,
  visible,
  onClose,
  duration = 5000,
}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Survey'});
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const {theme} = useTheme();
  // Calculate top position considering header (approximately 80-100px)
  const headerHeight =
    Platform.OS === 'ios' ? 100 : Platform.OS === 'android' ? 80 : 20;
  const topOffset = insets.top + headerHeight + 200;

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -150,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [slideAnim, opacityAnim, onClose]);

  useEffect(() => {
    if (visible) {
      // Reset animations before showing
      slideAnim.setValue(-150);
      opacityAnim.setValue(0);

      // Slide down animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto close after duration
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, slideAnim, opacityAnim, handleClose, duration]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={{
        transform: [{translateY: slideAnim}],
        opacity: opacityAnim,
        position: 'absolute',
        top: topOffset,
        left: 0,
        right: 0,
        zIndex: 9999,
        paddingHorizontal: 16,
      }}>
      <View className="bg-bg-secondary dark:bg-bg-secondary-dark rounded-2xl border border-white dark:border-neutral-700 shadow-2xl">
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleClose}
          className="p-4 gap-3">
          <View className="flex-row items-center gap-3">
            <View>
              {hasGift ? (
                <View className="w-10 h-10  flex items-center justify-center rounded-full bg-[#52C41A]">
                  <Gift size="28" color="#ffffff" variant="Bold" />
                </View>
              ) : theme === 'dark' ? (
                <ClipboardTickDarkIcon size="28" />
              ) : (
                <ClipboardTickIcon size="28" />
              )}
            </View>
            <View className="flex-1 gap-1">
              <BaseText type="body3" color="base">
                {hasGift
                  ? t('successWithGiftMessage')
                  : t('successWithoutGiftMessage')}
              </BaseText>
              {hasGift && (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() =>
                    navigate('Root', {
                      screen: 'HomeNavigator',
                      params: {screen: 'myServices'},
                    })
                  }>
                  <View className="flex-row items-center gap-1">
                    <BaseText type="body3" color="base">
                      برو به{' '}
                      <BaseText type="body3" color="secondaryPurple">
                        «خدمات من»
                      </BaseText>{' '}
                      و هدیه‌ت رو دریافت کن.
                    </BaseText>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default SurveySuccessNotification;
