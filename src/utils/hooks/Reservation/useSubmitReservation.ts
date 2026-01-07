import {useMutation, UseMutationResult} from '@tanstack/react-query';
import ReservationService from '../../../services/ReservationService';
import {CreateReserveDto} from '../../../services/models/request/ReservationReqService';
import {AuthResponseSignUpDto} from '../../../services/models/response/ReservationResService';

export const useSubmitReservation = (): UseMutationResult<
  AuthResponseSignUpDto,
  Error,
  CreateReserveDto
> => {
  return useMutation({
    mutationFn: (body: CreateReserveDto) =>
      ReservationService.SubmitReservation(body),
  });
};
