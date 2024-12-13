import {useQuery, UseQueryResult} from '@tanstack/react-query';
import UserService from '../../../services/UserService';
import {GetUserSaleOrderRes} from '../../../services/models/response/UseResrService';
import {UserSaleOrderQuery} from '../../../services/models/requestQueries';

export const useGetUserSaleOrder = (
  query: UserSaleOrderQuery,
): UseQueryResult<GetUserSaleOrderRes, Error> => {
  return useQuery({
    queryKey: ['UserSaleOrder', query],
    queryFn: () => UserService.GetUserSaleOrder(query),
  });
};
