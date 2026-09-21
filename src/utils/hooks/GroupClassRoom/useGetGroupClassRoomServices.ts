import {useQuery, UseQueryResult} from '@tanstack/react-query';
import GroupClassRoomService from '../../../services/GroupClassRoomService';
import {GroupClassRoomServicesResponse} from '../../../services/models/response/GroupClassRoomResService';
import {toOptionalOrganizationUnitId} from '../../helpers/organizationUnits';

export const useGetGroupClassRoomServices = (
  organizationUnitId?: number,
  enabled?: boolean,
): UseQueryResult<GroupClassRoomServicesResponse, Error> => {
  const unitId = toOptionalOrganizationUnitId(organizationUnitId);

  return useQuery({
    queryKey: ['GroupClassRoomServices', unitId ?? null],
    queryFn: () => GroupClassRoomService.GetServices(unitId),
    enabled: enabled !== false,
    retry: false,
  });
};
