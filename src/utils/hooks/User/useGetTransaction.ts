import {useQuery, UseQueryResult} from '@tanstack/react-query';
import UserService from '../../../services/UserService';
import {TransactionResponse} from '../../../services/models/response/UseResrService';
import {UserTransactionQuery} from '../../../services/models/requestQueries';

export const useGetTransaction = (
  query: UserTransactionQuery,
): UseQueryResult<TransactionResponse, Error> => {
  return useQuery({
    queryKey: ['UserTransaction', query],
    queryFn: () => UserService.GetUserTransaction(query),
  });
};
