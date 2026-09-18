import {useQuery, UseQueryResult} from '@tanstack/react-query';
import ReservationService from '../../../services/ReservationService';
import {ReservationTagsResponse} from '../../../services/models/response/ReservationResService';
import {toOptionalOrganizationUnitId} from '../../helpers/organizationUnits';

export const useGetReservationTags = (
  organizationUnitId?: number,
  enabled?: boolean,
): UseQueryResult<ReservationTagsResponse, Error> => {
  const unitId = toOptionalOrganizationUnitId(organizationUnitId);

  return useQuery({
    queryKey: ['ReservationTags', unitId ?? null],
    queryFn: () => ReservationService.GetTags(unitId),
    enabled: enabled !== false,
    retry: false,
  });
};
