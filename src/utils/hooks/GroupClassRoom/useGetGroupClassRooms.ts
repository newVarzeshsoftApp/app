import {useQuery, UseQueryResult} from '@tanstack/react-query';
import GroupClassRoomService from '../../../services/GroupClassRoomService';
import {GroupClassRoomQuery} from '../../../services/models/requestQueries';
import {GroupClassRoomResponse} from '../../../services/models/response/GroupClassRoomResService';

export const useGetGroupClassRooms = (
  query?: GroupClassRoomQuery,
  enabled?: boolean,
): UseQueryResult<GroupClassRoomResponse, Error> => {
  return useQuery({
    queryKey: ['GroupClassRooms', query],
    queryFn: ({signal}) => GroupClassRoomService.GetAll(query, signal),
    enabled: enabled !== false,
    retry: false,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

