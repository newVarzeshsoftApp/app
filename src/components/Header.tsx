import React, {useCallback, useMemo, useRef} from 'react';
import {
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import ResponsiveImage from './ResponsiveImage';
import {useGetOrganizationBySKU} from '../utils/hooks/Organization/useGetOrganizationBySKU';
import {Gift, Menu} from 'iconsax-react-native';
import {DrawerActions} from '@react-navigation/native';
import ProfilePic from './header/ProfilePic';
import Logo from './Logo';
import {navigate} from '../navigation/navigationRef';
import {useGetUserSaleItem} from '../utils/hooks/User/useGetUserSaleItem';
import BottomSheet, {BottomSheetMethods} from './BottomSheet/BottomSheet';
import ShopCreditService from './cards/shopCard/ShopCreditService';
import BaseText from './BaseText';
import {Content} from '../services/models/response/UseResrService';

function Header({navigation}: {navigation: any}) {
  const {data: OrganizationBySKU} = useGetOrganizationBySKU();
  const giftSheetRef = useRef<BottomSheetMethods>(null);

  const {data: giftSaleItems} = useGetUserSaleItem({
    status: 0,
    isGift: true,
    limit: 50,
    offset: 0,
  });
  const hasGift = (giftSaleItems?.total ?? 0) > 0;

  const openGiftSheet = useCallback(() => {
    giftSheetRef.current?.expand();
  }, []);

  const giftItems = useMemo<Content[]>(
    () => giftSaleItems?.content ?? [],
    [giftSaleItems?.content],
  );

  return (
    <SafeAreaView className="dark:bg-neutral-dark-300/90 web:backdrop-blur max-w-[450px] mx-auto  bg-neutral-0/95 border web:justify-center  android:justify-center border-neutral-0 rounded-b-[32px] dark:border-neutral-dark-400/40 -translate-y-1 shadow android:h-[100px] web:h-[80px] web:fixed web:left-1/2 web:-translate-x-1/2  w-full ios:h-[120px]  ">
      <BottomSheet
        ref={giftSheetRef}
        snapPoints={[70, 95]}
        scrollView
        Title="هدیه‌های من">
        <View className="gap-3">
          {giftItems.length > 0 ? (
            giftItems.map(item => {
              if (!item.product) return null;
              return (
                <ShopCreditService
                  key={`gift-${item.id}`}
                  data={item.product}
                  isGift
                />
              );
            })
          ) : (
            <View className="py-10 items-center">
              <BaseText type="body2" color="secondary">
                موردی یافت نشد
              </BaseText>
            </View>
          )}
        </View>
      </BottomSheet>

      <View className="px-5 flex-row justify-between ">
        <View className="w-[45px] h-[45px]  ">
          <Logo header />
        </View>
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={openGiftSheet}
            className="w-12 h-12 rounded-full items-center justify-center bg-neutral-100  dark:bg-neutral-dark-100">
            <View className="relative">
              {hasGift && (
                <View className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-error-500 border border-neutral-0 dark:border-neutral-dark-300" />
              )}
              <Gift size="24" color="#717181" variant="Bold" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigate('Root', {screen: 'ProfileTab'})}>
            <ProfilePic />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              navigation.dispatch(DrawerActions.openDrawer());
              if (Platform.OS === 'web') {
                window?.history?.pushState({name: 'Drawer'}, '', 'Drawer');
              }
            }}
            className="w-12 h-12 rounded-full items-center justify-center bg-neutral-100  dark:bg-neutral-dark-100">
            <Menu size="24" color="#717181" variant="Bold" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default Header;
