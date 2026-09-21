import {useQuery, UseQueryResult} from '@tanstack/react-query';
import ReservationService from '../../../services/ReservationService';
import {ReservationOrganizationUnitResponse} from '../../../services/models/response/ReservationResService';

export const useGetReservationOrganizationUnit = (
  enabled?: boolean,
): UseQueryResult<ReservationOrganizationUnitResponse, Error> => {
  return useQuery({
    queryKey: ['ReservationOrganizationUnit'],
    queryFn: () => ReservationService.GetOrganizationUnit(),
    enabled: enabled !== false,
    retry: false,
  });
};
