import {useQuery, UseQueryResult} from '@tanstack/react-query';
import GroupClassRoomService from '../../../services/GroupClassRoomService';
import {OrganizationUnitResponse} from '../../../services/models/response/GroupClassRoomResService';

export const useGetGroupClassRoomOrganizationUnit = (
  enabled?: boolean,
): UseQueryResult<OrganizationUnitResponse, Error> => {
  return useQuery({
    queryKey: ['GroupClassRoomOrganizationUnit'],
    queryFn: () => GroupClassRoomService.GetOrganizationUnit(),
    enabled: enabled !== false,
    retry: false,
  });
};

