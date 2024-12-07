import {useQuery, UseQueryResult} from '@tanstack/react-query';
import UserService from '../../../services/UserService';
import {ChargingServiceByIDRes} from '../../../services/models/response/UseResrService';

export const useGetUserChargingServiceByID = (
  id: number,
): UseQueryResult<ChargingServiceByIDRes[], Error> => {
  return useQuery({
    queryKey: ['UserChargingService', id],
    queryFn: () => UserService.GetUserChargingServiceByID(id),
    enabled: !!id,
  });
};
