import {useQuery, UseQueryResult} from '@tanstack/react-query';
import ReservationService from '../../../services/ReservationService';
import {ReservationTagsResponse} from '../../../services/models/response/ReservationResService';

export const useGetReservationTags = (): UseQueryResult<
  ReservationTagsResponse,
  Error
> => {
  return useQuery({
    queryKey: ['ReservationTags'],
    queryFn: () => ReservationService.GetTags(),
    retry: false,
  });
};
