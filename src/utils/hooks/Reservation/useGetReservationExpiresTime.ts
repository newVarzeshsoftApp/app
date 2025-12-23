import {useQuery, UseQueryResult} from '@tanstack/react-query';
import ReservationService from '../../../services/ReservationService';
import {ReservationExpiresTimeRes} from '../../../services/models/response/ReservationResService';

export const useGetReservationExpiresTime = (
  enabled: boolean = true,
): UseQueryResult<ReservationExpiresTimeRes, Error> => {
  return useQuery({
    queryKey: ['ReservationExpiresTime'],
    queryFn: () => ReservationService.GetExpiresTime(),
    enabled,
    refetchInterval: 60000, // Refetch every minute to check expiration
  });
};

