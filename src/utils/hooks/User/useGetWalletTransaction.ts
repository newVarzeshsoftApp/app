import {useQuery, UseQueryResult} from '@tanstack/react-query';
import UserService from '../../../services/UserService';
import {TransactionResponse} from '../../../services/models/response/UseResrService';
import {UserWalletTransactionQuery} from '../../../services/models/requestQueries';

export const useGetWalletTransaction = (
  query: UserWalletTransactionQuery,
): UseQueryResult<TransactionResponse, Error> => {
  return useQuery({
    queryKey: ['UserWalletTransaction', query],
    queryFn: () => UserService.GetUserWalletTransaction(query),
  });
};
