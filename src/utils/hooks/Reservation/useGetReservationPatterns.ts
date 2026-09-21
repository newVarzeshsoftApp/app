import {useQuery, UseQueryResult} from '@tanstack/react-query';
import ReservationService from '../../../services/ReservationService';
import {ReservationPatternsResponse} from '../../../services/models/response/ReservationResService';
import {toOptionalOrganizationUnitId} from '../../helpers/organizationUnits';

export const useGetReservationPatterns = (
  organizationUnitId?: number,
  enabled?: boolean,
): UseQueryResult<ReservationPatternsResponse, Error> => {
  const unitId = toOptionalOrganizationUnitId(organizationUnitId);

  return useQuery({
    queryKey: ['ReservationPatterns', unitId ?? null],
    queryFn: () => ReservationService.GetPatterns(unitId),
    enabled: enabled !== false,
    retry: false,
  });
};
