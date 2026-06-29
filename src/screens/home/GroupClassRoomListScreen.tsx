import React, {useCallback, useMemo} from 'react';
import {View, Image, ScrollView, ActivityIndicator} from 'react-native';
import {RouteProp, useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import NavigationHeader from '../../components/header/NavigationHeader';
import BaseText from '../../components/BaseText';
import BaseButton from '../../components/Button/BaseButton';
import GroupClassRoomCard from '../../components/cards/GroupClassRoom/GroupClassRoomCard';
import {useGetGroupClassRooms} from '../../utils/hooks/GroupClassRoom/useGetGroupClassRooms';
import {GroupClassRoomStackParamList} from '../../utils/types/NavigationTypes';
import {GroupClassRoom} from '../../services/models/response/GroupClassRoomResService';
import {
  getGroupClassRoomConfig,
  groupClassRoomListParamsToQuery,
  normalizeGroupClassRoomResponse,
  resolveGroupClassRoomDetailContractorId,
} from '../../utils/helpers/groupClassRoomHelpers';
import {logGroupClassRoomSseDebug} from '../../utils/helpers/groupClassRoomSseDebug';

const GROUP_CLASS_ROOM_LIST_POLL_MS = 5000;

type GroupClassRoomListRouteProp = RouteProp<
  GroupClassRoomStackParamList,
  'groupClassRoomList'
>;

const GroupClassRoomListScreen: React.FC = () => {
  const route = useRoute<GroupClassRoomListRouteProp>();
  const navigation =
    useNavigation<NativeStackNavigationProp<GroupClassRoomStackParamList>>();
  const query = useMemo(
    () => groupClassRoomListParamsToQuery(route.params ?? {}),
    [route.params],
  );

  const selectedContractorId = route.params?.contractor
    ? Number(route.params.contractor)
    : undefined;

  const {
    data: classRoomsData,
    isLoading,
    isError,
    refetch,
  } = useGetGroupClassRooms(query);

  useFocusEffect(
    useCallback(() => {
      void refetch();

      // Fallback while backend does not broadcast CLIENT_REMOTE on release
      const intervalId = setInterval(() => {
        logGroupClassRoomSseDebug(
          'POLL',
          'list refetch (release SSE fallback)',
        );
        void refetch();
      }, GROUP_CLASS_ROOM_LIST_POLL_MS);

      return () => clearInterval(intervalId);
    }, [refetch]),
  );

  const classRooms = useMemo(
    () => normalizeGroupClassRoomResponse(classRoomsData),
    [classRoomsData],
  );

  const navigateToDetail = useCallback(
    (item: GroupClassRoom, waitingList: boolean) => {
      const contractorId = resolveGroupClassRoomDetailContractorId(
        item,
        selectedContractorId,
      );
      if (!contractorId) return;

      navigation.navigate('groupClassRoomDetail', {
        ...(route.params ?? {}),
        groupClassRoomId: item.id,
        contractorId,
        waitingList,
        title: item.title,
      });
    },
    [navigation, route.params, selectedContractorId],
  );

  const handleJoinClass = useCallback(
    (item: GroupClassRoom) => navigateToDetail(item, false),
    [navigateToDetail],
  );

  const handleWaitingListPress = useCallback(
    (item: GroupClassRoom) => navigateToDetail(item, true),
    [navigateToDetail],
  );

  const isResultsLoading = isLoading;

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
              const configContractorId = getGroupClassRoomConfig(
                item,
                selectedContractorId,
              )?.contractorId;
              const selectedContractor = selectedContractorId
                ? item.contractors?.find(
                    contractor => contractor.id === selectedContractorId,
                  )
                : undefined;

              return (
                <GroupClassRoomCard
                  key={`${item.id}-${configContractorId ?? 'default'}`}
                  data={item}
                  contractorId={selectedContractorId}
                  selectedContractor={selectedContractor}
                  onJoinPress={handleJoinClass}
                  onWaitingListPress={handleWaitingListPress}
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
