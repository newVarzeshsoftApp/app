import {useQuery, UseQueryResult} from '@tanstack/react-query';
import ReservationService from '../../../services/ReservationService';
import {ReservationPatternsResponse} from '../../../services/models/response/ReservationResService';

export const useGetReservationPatterns = (): UseQueryResult<
  ReservationPatternsResponse,
  Error
> => {
  return useQuery({
    queryKey: ['ReservationPatterns'],
    queryFn: () => ReservationService.GetPatterns(),
    retry: false,
  });
};
