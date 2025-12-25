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
    // Cache for 24 hours - this is a setting that rarely changes
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 24 * 60 * 60 * 1000, // 24 hours (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};
