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
    queryFn: () => GroupClassRoomService.GetAll(query),
    enabled: enabled !== false,
    retry: false,
  });
};

