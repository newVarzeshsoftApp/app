import {useMutation, UseMutationResult} from '@tanstack/react-query';
import GroupClassRoomService from '../../../services/GroupClassRoomService';
import {GroupClassRoomPreReserveQuery} from '../../../services/models/requestQueries';
import {AuthResponseSignUpDto} from '../../../services/models/response/ReservationResService';

export const usePreReserveGroupClassRoom = (): UseMutationResult<
  AuthResponseSignUpDto,
  Error,
  GroupClassRoomPreReserveQuery
> => {
  return useMutation({
    mutationFn: (body: GroupClassRoomPreReserveQuery) =>
      GroupClassRoomService.PreReserve(body),
  });
};

