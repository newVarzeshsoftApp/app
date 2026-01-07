import {useQuery, UseQueryResult} from '@tanstack/react-query';
import UserService from '../../../services/UserService';
import {SaleOrderByIDRes} from '../../../services/models/response/UseResrService';

export const useGetUserSaleOrderByID = (
  id: number,
): UseQueryResult<SaleOrderByIDRes, Error> => {
  return useQuery({
    queryKey: ['UserSaleOrder', id],
    queryFn: () => UserService.GetUserSaleOrderByID(id),
  });
};
