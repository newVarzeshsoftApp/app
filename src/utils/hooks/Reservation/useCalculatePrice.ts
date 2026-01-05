import {useMutation, UseMutationResult} from '@tanstack/react-query';
import ReservationService from '../../../services/ReservationService';
import {PreReserveDTO} from '../../../services/models/request/ReservationReqService';
import {ResPreReserveDTO} from '../../../services/models/response/ReservationResService';

export const useCalculatePrice = (): UseMutationResult<
  ResPreReserveDTO,
  Error,
  PreReserveDTO
> => {
  return useMutation({
    mutationFn: (body: PreReserveDTO) =>
      ReservationService.CalculatePrice(body),
  });
};

