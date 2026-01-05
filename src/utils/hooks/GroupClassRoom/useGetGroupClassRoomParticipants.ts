import {useQuery, UseQueryResult} from '@tanstack/react-query';
import GroupClassRoomService from '../../../services/GroupClassRoomService';
import {GroupClassRoomParticipantsQuery} from '../../../services/models/requestQueries';
import {GroupClassRoomParticipantsResponse} from '../../../services/models/response/GroupClassRoomResService';

export const useGetGroupClassRoomParticipants = (
  id: number,
  query: GroupClassRoomParticipantsQuery,
  enabled?: boolean,
): UseQueryResult<GroupClassRoomParticipantsResponse, Error> => {
  return useQuery({
    queryKey: ['GroupClassRoomParticipants', id, query],
    queryFn: () => GroupClassRoomService.GetParticipants(id, query),
    enabled: enabled !== false && !!id && !!query.contractor,
    retry: false,
  });
};

