import {useQuery, UseQueryResult} from '@tanstack/react-query';
import UserService from '../../../services/UserService';
import {GetUserDashboardRes} from '../../../services/models/response/UseResrService';

export const useGetUserDashboard = (): UseQueryResult<
  GetUserDashboardRes,
  Error
> => {
  return useQuery({
    queryKey: ['UserDashboard'],
    queryFn: () => UserService.GetUserDashboard(),
  });
};
