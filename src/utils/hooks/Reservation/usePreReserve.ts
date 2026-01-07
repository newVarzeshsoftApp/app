import {useMutation, UseMutationResult} from '@tanstack/react-query';
import ReservationService from '../../../services/ReservationService';
import {PreReserveQuery} from '../../../services/models/requestQueries';
import {AuthResponseSignUpDto} from '../../../services/models/response/ReservationResService';

export const usePreReserve = (): UseMutationResult<
  AuthResponseSignUpDto,
  Error,
  PreReserveQuery
> => {
  return useMutation({
    mutationFn: (query: PreReserveQuery) =>
      ReservationService.PreReserve(query),
  });
};
