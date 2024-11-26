import {useQuery, UseQueryResult} from '@tanstack/react-query';
import UserService from '../../../services/UserService';
import {GetUserCreditRes} from '../../../services/models/response/UseResrService';

export const useGetUserCredit = (): UseQueryResult<GetUserCreditRes, Error> => {
  return useQuery({
    queryKey: ['UserCredit'],
    queryFn: () => UserService.GetUserCredit(),
  });
};
