import {useMutation, UseMutationResult} from '@tanstack/react-query';
import ReservationService from '../../../services/ReservationService';
import {CancelReservationDto} from '../../../services/models/request/ReservationReqService';
import {AuthResponseSignUpDto} from '../../../services/models/response/ReservationResService';

export const useCancelReservation = (): UseMutationResult<
  AuthResponseSignUpDto,
  Error,
  CancelReservationDto
> => {
  return useMutation({
    mutationFn: (body: CancelReservationDto) =>
      ReservationService.CancelReservation(body),
  });
};
