import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';
import {GROUP_CLASS_ROOM_LIST_PAGE_SIZE} from '../../../constants/groupClassRoom';
import GroupClassRoomService from '../../../services/GroupClassRoomService';
import {GroupClassRoomQuery} from '../../../services/models/requestQueries';
import {GroupClassRoomResponse} from '../../../services/models/response/GroupClassRoomResService';
import {normalizeGroupClassRoomResponse} from '../../helpers/groupClassRoomHelpers';

export type GroupClassRoomListFilters = Omit<
  GroupClassRoomQuery,
  'limit' | 'offset' | 'search'
>;

const getPageItemCount = (page: GroupClassRoomResponse | undefined): number =>
  normalizeGroupClassRoomResponse(page).length;

export const useGetGroupClassRoomsInfinite = (
  filters?: GroupClassRoomListFilters,
  options?: {
    enabled?: boolean;
    pageSize?: number;
  },
): UseInfiniteQueryResult<
  InfiniteData<GroupClassRoomResponse, number>,
  Error
> => {
  const enabled = options?.enabled !== false;
  const pageSize = options?.pageSize ?? GROUP_CLASS_ROOM_LIST_PAGE_SIZE;

  return useInfiniteQuery({
    queryKey: ['GroupClassRooms', 'infinite', filters, pageSize],
    queryFn: ({pageParam, signal}) =>
      GroupClassRoomService.GetAll(
        {
          ...filters,
          limit: pageSize,
          offset: pageParam,
        },
        signal,
      ),
    initialPageParam: 0,
    // Keep fetching until the last page has fewer than pageSize items.
    getNextPageParam: (lastPage, allPages) => {
      const lastPageCount = getPageItemCount(lastPage);
      if (lastPageCount < pageSize) {
        return undefined;
      }

      return allPages.reduce(
        (sum, page) => sum + getPageItemCount(page),
        0,
      );
    },
    enabled,
    retry: false,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};
