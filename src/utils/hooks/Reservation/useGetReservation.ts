import {useQuery, UseQueryResult} from '@tanstack/react-query';
import ReservationService from '../../../services/ReservationService';
import {ReservationQuery} from '../../../services/models/requestQueries';
import {ResponseReserveViewResponseDto} from '../../../services/models/response/ReservationResService';

export const useGetReservation = (
  query: ReservationQuery,
  enabled?: boolean,
): UseQueryResult<ResponseReserveViewResponseDto, Error> => {
  return useQuery({
    queryKey: ['Reservation', query],
    queryFn: ({signal}) => ReservationService.GetReservation(query, signal),
    enabled: enabled !== false && !!query.tagId && !!query.start,
    retry: false,
    staleTime: 0, // Data is always considered stale, will refetch every time
    gcTime: 0, // Don't cache data (gcTime replaces cacheTime in v5)
    refetchOnMount: true, // Always refetch on mount
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
};
