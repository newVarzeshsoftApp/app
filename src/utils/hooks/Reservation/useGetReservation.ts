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
    queryFn: () => ReservationService.GetReservation(query),
    enabled: enabled !== false && !!query.tagId && !!query.start,
    retry: false,
  });
};
