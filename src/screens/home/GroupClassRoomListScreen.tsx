import React, {useCallback, useMemo, useRef} from 'react';
import {
  View,
  Image,
  FlatList,
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import NavigationHeader from '../../components/header/NavigationHeader';
import BaseText from '../../components/BaseText';
import BaseButton from '../../components/Button/BaseButton';
import GroupClassRoomCard from '../../components/cards/GroupClassRoom/GroupClassRoomCard';
import {GROUP_CLASS_ROOM_LIST_PAGE_SIZE} from '../../constants/groupClassRoom';
import {useGetGroupClassRoomsInfinite} from '../../utils/hooks/GroupClassRoom/useGetGroupClassRoomsInfinite';
import {GroupClassRoomStackParamList} from '../../utils/types/NavigationTypes';
import {GroupClassRoom} from '../../services/models/response/GroupClassRoomResService';
import {
  expandGroupClassRoomListItems,
  groupClassRoomListParamsToQuery,
  normalizeGroupClassRoomResponse,
  resolveGroupClassRoomDetailContractorId,
} from '../../utils/helpers/groupClassRoomHelpers';

type GroupClassRoomListRouteProp = RouteProp<
  GroupClassRoomStackParamList,
  'groupClassRoomList'
>;

type GroupClassRoomListItem = {
  key: string;
  item: GroupClassRoom;
  contractorId?: number;
};

const GroupClassRoomListScreen: React.FC = () => {
  const route = useRoute<GroupClassRoomListRouteProp>();
  const navigation =
    useNavigation<NativeStackNavigationProp<GroupClassRoomStackParamList>>();
  const filters = useMemo(
    () => groupClassRoomListParamsToQuery(route.params ?? {}),
    [route.params],
  );

  const selectedContractorId = route.params?.contractor
    ? Number(route.params.contractor)
    : undefined;

  const {
    data,
    isLoading,
    isError,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useGetGroupClassRoomsInfinite(filters);

  const isLoadingMoreRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const listItems = useMemo((): GroupClassRoomListItem[] => {
    const pages = data?.pages ?? [];
    const rooms = expandGroupClassRoomListItems(
      pages.flatMap(page => normalizeGroupClassRoomResponse(page)),
    );

    return rooms.map(item => {
      const contractorId = resolveGroupClassRoomDetailContractorId(
        item,
        selectedContractorId,
      );

      return {
        key: `${item.id}-${contractorId ?? item.config?.contractorId ?? 'default'}`,
        item,
        contractorId,
      };
    });
  }, [data?.pages, selectedContractorId]);

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

  const canLoadMore = useMemo(() => {
    const pages = data?.pages ?? [];
    if (pages.length === 0) {
      return false;
    }

    const lastPageCount = normalizeGroupClassRoomResponse(
      pages[pages.length - 1],
    ).length;

    // Keep requesting while the latest page still filled a full page.
    return lastPageCount >= GROUP_CLASS_ROOM_LIST_PAGE_SIZE;
  }, [data?.pages]);

  const handleLoadMore = useCallback(() => {
    if (
      !canLoadMore ||
      isFetchingNextPage ||
      isError ||
      isLoadingMoreRef.current
    ) {
      return;
    }

    isLoadingMoreRef.current = true;
    void fetchNextPage().finally(() => {
      isLoadingMoreRef.current = false;
    });
  }, [canLoadMore, fetchNextPage, isError, isFetchingNextPage]);

  // FlatList onEndReached is unreliable on web; also trigger near bottom via scroll.
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
      const distanceFromEnd =
        contentSize.height - (layoutMeasurement.height + contentOffset.y);

      if (distanceFromEnd < 240) {
        handleLoadMore();
      }
    },
    [handleLoadMore],
  );

  const renderItem = useCallback(
    ({item: row}: {item: GroupClassRoomListItem}) => {
      const selectedContractor = row.contractorId
        ? row.item.contractors?.find(
            contractor => contractor.id === row.contractorId,
          )
        : undefined;

      return (
        <GroupClassRoomCard
          data={row.item}
          contractorId={row.contractorId}
          selectedContractor={selectedContractor}
          onJoinPress={handleJoinClass}
          onWaitingListPress={handleWaitingListPress}
        />
      );
    },
    [handleJoinClass, handleWaitingListPress],
  );

  const listFooter = useMemo(() => {
    if (isFetchingNextPage) {
      return (
        <View className="py-4 items-center">
          <ActivityIndicator size="small" color="#bcdc64" />
        </View>
      );
    }

    if (canLoadMore && listItems.length > 0) {
      return (
        <View className="py-3 items-center">
          <BaseButton
            text="مشاهده بیشتر"
            type="Outline"
            color="Black"
            size="Medium"
            rounded
            onPress={handleLoadMore}
          />
        </View>
      );
    }

    return <View style={{height: 16}} />;
  }, [canLoadMore, handleLoadMore, isFetchingNextPage, listItems.length]);

  const listEmpty = useMemo(() => {
    if (isLoading || (isFetching && listItems.length === 0)) {
      return (
        <View className="py-10 items-center">
          <ActivityIndicator size="large" color="#bcdc64" />
        </View>
      );
    }

    if (isError) {
      return (
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
      );
    }

    return (
      <View className="py-10 items-center">
        <BaseText type="body2" color="muted">
          کلاسی یافت نشد
        </BaseText>
      </View>
    );
  }, [isError, isFetching, isLoading, listItems.length, refetch]);

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

      <FlatList
        className="flex-1"
        data={listItems}
        keyExtractor={row => row.key}
        renderItem={renderItem}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 32,
          flexGrow: 1,
          width: '100%',
          maxWidth: 450,
          alignSelf: 'center',
        }}
        ItemSeparatorComponent={() => <View style={{height: 16}} />}
        ListFooterComponent={listFooter}
        ListEmptyComponent={listEmpty}
      />
    </View>
  );
};

export default GroupClassRoomListScreen;
