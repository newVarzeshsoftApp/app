import {useQuery, UseQueryResult} from '@tanstack/react-query';
import UserService from '../../../services/UserService';

export const useGetUserPaymentById = (
  id: number,
): UseQueryResult<any, Error> => {
  return useQuery({
    queryKey: ['UserPayment', id],
    queryFn: () => UserService.GetUserPaymentById(id),
    enabled: !!id,
  });
};

