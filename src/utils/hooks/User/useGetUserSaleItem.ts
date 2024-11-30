import {useQuery, UseQueryResult} from '@tanstack/react-query';
import UserService from '../../../services/UserService';
import {
  GetUserDashboardRes,
  GetUserSaleItemRes,
} from '../../../services/models/response/UseResrService';
import {UserSaleItemQuey} from '../../../services/models/requestQueries';

export const useGetUserSaleItem = (
  query: UserSaleItemQuey,
): UseQueryResult<GetUserSaleItemRes, Error> => {
  return useQuery({
    queryKey: ['UserSaleItem', query],
    queryFn: () => UserService.GetUserSaleItem(query),
  });
};
