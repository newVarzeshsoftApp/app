import {useQuery, UseQueryResult} from '@tanstack/react-query';
import GroupClassRoomService from '../../../services/GroupClassRoomService';
import {GroupClassRoomServicesResponse} from '../../../services/models/response/GroupClassRoomResService';

export const useGetGroupClassRoomServices = (
  enabled?: boolean,
): UseQueryResult<GroupClassRoomServicesResponse, Error> => {
  return useQuery({
    queryKey: ['GroupClassRoomServices'],
    queryFn: () => GroupClassRoomService.GetServices(),
    enabled: enabled !== false,
    retry: false,
  });
};

