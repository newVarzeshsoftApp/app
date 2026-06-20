import React, {useCallback, useMemo} from 'react';
import {
  View,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import NavigationHeader from '../../components/header/NavigationHeader';
import BaseText from '../../components/BaseText';
import BaseButton from '../../components/Button/BaseButton';
import GroupClassRoomCard from '../../components/cards/GroupClassRoom/GroupClassRoomCard';
import {useGetGroupClassRooms} from '../../utils/hooks/GroupClassRoom/useGetGroupClassRooms';
import {HomeStackParamList} from '../../utils/types/NavigationTypes';
import {GroupClassRoom} from '../../services/models/response/GroupClassRoomResService';
import {
  groupClassRoomListParamsToQuery,
  normalizeGroupClassRoomResponse,
} from '../../utils/helpers/groupClassRoomHelpers';

type GroupClassRoomListRouteProp = RouteProp<
  HomeStackParamList,
  'groupClassRoomList'
>;

const GroupClassRoomListScreen: React.FC = () => {
  const route = useRoute<GroupClassRoomListRouteProp>();
  const query = useMemo(
    () => groupClassRoomListParamsToQuery(route.params ?? {}),
    [route.params],
  );

  const {
    data: classRoomsData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetGroupClassRooms(query);

  const classRooms = useMemo(
    () => normalizeGroupClassRoomResponse(classRoomsData),
    [classRoomsData],
  );

  const selectedContractorId = route.params?.contractor
    ? Number(route.params.contractor)
    : undefined;

  const handleJoinClass = useCallback((_item: GroupClassRoom) => {
    // TODO: Navigate to group class room join / pre-reserve flow
  }, []);

  const isResultsLoading = isLoading || isFetching;

  return (
    <View className="flex-1 bg-neutral-100 dark:bg-neutral-dark-100 relative">
      <View className="absolute -top-[25%] web:rotate-[10deg] web:-left-[30%] android:-right-[80%] ios:-right-[80%] opacity-45 w-[600px] h-[600px]">
        <Image
          source={require('../../assets/images/shade/shape/ShadeBlue.png')}
          style={{width: '100%', height: '100%'}}
          resizeMode="contain"
        />
      </View>
      <View className="absolute -top-[20%] web:-rotate-[25deg] web:-left-[38%] w-[400px] h-[400px] opacity-90">
        <Image
          source={require('../../assets/images/shade/shape/ShadeBlue.png')}
          style={{width: '100%', height: '100%'}}
        />
      </View>

      <NavigationHeader title="نتایج کلاس گروهی" CenterText MainBack />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 32}}>
        <View className="Container gap-4 pt-4">
          {isResultsLoading ? (
            <View className="py-10 items-center">
              <ActivityIndicator size="large" color="#bcdc64" />
            </View>
          ) : isError ? (
            <View className="py-10 items-center gap-3">
              <BaseText type="body2" color="muted">
                خطا در دریافت لیست کلاس‌ها
              </BaseText>
              <BaseButton
                text="تلاش مجدد"
                type="Outline"
                color="Black"
                size="Medium"
                rounded
                onPress={() => refetch()}
              />
            </View>
          ) : classRooms.length > 0 ? (
            classRooms.map(item => {
              const selectedContractor = selectedContractorId
                ? item.contractors?.find(
                    contractor => contractor.id === selectedContractorId,
                  )
                : undefined;

              return (
                <GroupClassRoomCard
                  key={item.id}
                  data={item}
                  selectedContractor={selectedContractor}
                  onJoinPress={handleJoinClass}
                />
              );
            })
          ) : (
            <View className="py-10 items-center">
              <BaseText type="body2" color="muted">
                کلاسی یافت نشد
              </BaseText>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default GroupClassRoomListScreen;
