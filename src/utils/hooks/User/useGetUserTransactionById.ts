import {useQuery, UseQueryResult} from '@tanstack/react-query';
import UserService from '../../../services/UserService';
import {Transaction} from '../../../services/models/response/UseResrService';

export const useGetUserTransactionById = (
  id: number,
): UseQueryResult<Transaction, Error> => {
  return useQuery({
    queryKey: ['UserTransaction', id],
    queryFn: () => UserService.GetUserTransactionById(id),
    enabled: !!id,
  });
};
