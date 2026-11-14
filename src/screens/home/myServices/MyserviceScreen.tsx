import React, {useCallback, useMemo} from 'react';
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from 'react-native';
import InfoCards from '../../../components/cards/infoCards/InfoCards';
import WalletBalance from '../components/WalletBalance';
import MyServise from '../components/MyServise';
import {useGetUserSaleItem} from '../../../utils/hooks/User/useGetUserSaleItem';
import {limit} from '../../../constants/options';
import {useTheme} from '../../../utils/ThemeContext';
import {Content} from '../../../services/models/response/UseResrService';
import ShopReservationCard from '../../../components/cards/shopCard/ShopReservationCard';
import BaseText from '../../../components/BaseText';
import {CalendarTick, ArrowUp} from 'iconsax-react-native';
import {useTranslation} from 'react-i18next';
import {navigate} from '../../../navigation/navigationRef';
import {useIsOrgFeatureEnabled} from '../../../utils/hooks/Organization/useOrgConfigs';

const MyserviceScreen: React.FC = () => {
  const {t} = useTranslation('translation', {keyPrefix: 'Drawer'});
  const {theme} = useTheme();
  const showMembership = useIsOrgFeatureEnabled('showMembership');
  const showLocker = useIsOrgFeatureEnabled('showLocker');
  const showInsurance = useIsOrgFeatureEnabled('showInsurance');
  const showBmi = useIsOrgFeatureEnabled('showBmi');
  const leftCards = [
    showMembership ? ('MembershipInfo' as const) : null,
    showLocker ? ('ClosetInfo' as const) : null,
  ].filter(
    (card): card is 'MembershipInfo' | 'ClosetInfo' => card !== null,
  );
  const rightCards = [
    showInsurance ? ('InsuranceInfo' as const) : null,
    showBmi ? ('BMIInfo' as const) : null,
  ].filter((card): card is 'InsuranceInfo' | 'BMIInfo' => card !== null);

  // Fetch reservations data (same as MainShop)
  const {data: reservationsData, isLoading: reservationsLoading} =
    useGetUserSaleItem({
      isReserved: true,
      status: 0,
      limit: limit,
      offset: 0,
      isCanceled: false,
    });

  const filteredReservations = useMemo(() => {
    if (!reservationsData?.content) return [];
    return reservationsData.content.filter(item => item.status === 0);
  }, [reservationsData]);

  const renderReservationItem = useCallback(({item}: {item: Content}) => {
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => {
          navigate('Root', {
            screen: 'SaleItemNavigator',
            params: {
              screen: 'saleItemDetail',
              params: {
                id: item.id,
                title: item.title || 'رزرو',
                fromReservation: true,
              },
            },
          });
        }}>
        <ShopReservationCard data={item} />
      </TouchableOpacity>
    );
  }, []);

  const reservationsSection =
    filteredReservations.length > 0 ? (
      <View key="reservations" className="mb-6">
        {/* Section Header */}
        <View className="flex-row justify-between items-center px-5 Container mb-4">
          <View className="flex-row items-center gap-1">
            <CalendarTick
              size="28"
              color={theme === 'dark' ? '#FFFFFF' : '#7f8185'}
              variant="Bold"
            />
            <BaseText type="body2" color="secondary">
              رزروهای من
            </BaseText>
          </View>
          {/* Button to navigate to the full category page - only show if more than 1 item */}
          {(reservationsData?.total || 0) > 1 && (
            <TouchableOpacity
              className="flex-row gap-1 items-center"
              onPress={() => {
                navigate('Root', {
                  screen: 'SaleItemNavigator',
                  params: {
                    screen: 'saleItem',
                    params: {fromReservations: true},
                  },
                });
              }}>
              <BaseText type="body2" color="secondary">
                {t('all')}
              </BaseText>
              <View className="-rotate-45">
                <ArrowUp size="16" color="#55575c" />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Section Content */}
        <FlatList
          data={filteredReservations}
          horizontal
          renderItem={renderReservationItem}
          keyExtractor={(reservationItem, index) =>
            `reservation-${reservationItem.id}-${index}`
          }
          ItemSeparatorComponent={() => <View style={{height: 16}} />}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{gap: 16, paddingHorizontal: 16}}
          ListFooterComponent={
            reservationsLoading ? (
              <View style={{marginTop: 16, alignItems: 'center'}}>
                <ActivityIndicator size="large" color="#bcdd64" />
              </View>
            ) : null
          }
        />
      </View>
    ) : null;

  const renderHeader = () => (
    <>
      <View className="Container py-5 web:pt-[85px] gap-5">
        <WalletBalance />
        {(leftCards.length > 0 || rightCards.length > 0) && (
          <View className="flex-row items-center justify-center gap-4">
            {leftCards.length > 0 && (
              <View className="gap-4 flex-1">
                {leftCards.map(type => (
                  <InfoCards key={type} type={type} />
                ))}
              </View>
            )}
            {rightCards.length > 0 && (
              <View className="gap-4 flex-1">
                {rightCards.map(type => (
                  <InfoCards key={type} type={type} />
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </>
  );

  return (
    <FlatList
      data={[]}
      renderItem={null}
      nestedScrollEnabled
      keyExtractor={(item, index) => `key` + index}
      ListHeaderComponent={
        <>
          {renderHeader()}
          <View className="">{reservationsSection}</View>
        </>
      }
      ListFooterComponent={
        <View className="flex-1 pb-[125px]">
          <MyServise />
        </View>
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

export default MyserviceScreen;
