import React from 'react';
import {View} from 'react-native';
import BaseText from '../../../../components/BaseText';
import BottomSheet, {
  BottomSheetMethods,
} from '../../../../components/BottomSheet/BottomSheet';

interface HelpBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheetMethods>;
}

const HelpBottomSheet: React.FC<HelpBottomSheetProps> = ({bottomSheetRef}) => {
  return (
    <BottomSheet ref={bottomSheetRef} snapPoints={[45]} Title="راهنما">
      <View className="gap-4 px-2">
        {/* Legend Item - Pre Reserved (Dashed) */}
        <View className="flex-row items-center gap-3">
          <View
            className="w-10 h-10 rounded-lg items-center justify-center bg-neutral-0 dark:bg-neutral-dark-300/90"
            style={{
              borderWidth: 2,
              borderStyle: 'dashed',
              borderColor: '#B56725',
            }}
          />
          <View className="flex-1">
            <BaseText type="body2" color="base">
              در حال رزرو دیگران
            </BaseText>
            <BaseText type="caption" color="secondary">
              این خدمت توسط شخص دیگری در حال رزرو شدن است
            </BaseText>
          </View>
        </View>

        {/* Legend Item - Reserved by others (Disabled) */}
        <View className="flex-row items-center gap-3">
          <View
            className="w-10 h-10 rounded-lg items-center justify-center bg-[#F5F5F5] dark:bg-neutral-dark-300/90"
            style={{
              borderWidth: 2,
              borderStyle: 'solid',
              borderColor: '#E0E0E0',
            }}
          />
          <View className="flex-1">
            <BaseText type="body2" color="base">
              رزرو شده
            </BaseText>
            <BaseText type="caption" color="secondary">
              این خدمت قبلاً توسط شخص دیگری رزرو شده است
            </BaseText>
          </View>
        </View>

        {/* Legend Item - My Reservation (Filled) */}
        <View className="flex-row items-center gap-3">
          <View
            className="w-10 h-10 rounded-lg items-center justify-center"
            style={{
              borderWidth: 2,
              borderStyle: 'solid',
              borderColor: '#B56725',
              backgroundColor: '#B56725',
            }}
          />
          <View className="flex-1">
            <BaseText type="body2" color="base">
              درحال رزرو توسط من
            </BaseText>
            <BaseText type="caption" color="secondary">
              این خدمت توسط شما درحال رزرو شده است
            </BaseText>
          </View>
        </View>

        {/* Legend Item - Available */}
        <View className="flex-row items-center gap-3">
          <View
            className="w-10 h-10 rounded-lg items-center justify-center bg-neutral-0 dark:bg-neutral-dark-300/90"
            style={{
              borderWidth: 2,
              borderStyle: 'solid',
              borderColor: '#B56725',
            }}
          />
          <View className="flex-1">
            <BaseText type="body2" color="base">
              قابل رزرو
            </BaseText>
            <BaseText type="caption" color="secondary">
              این خدمت آزاد است و می‌توانید رزرو کنید
            </BaseText>
          </View>
        </View>
      </View>
    </BottomSheet>
  );
};

export default HelpBottomSheet;
