import {useQuery, UseQueryResult} from '@tanstack/react-query';
import UserService from '../../../services/UserService';

export const useGetUserVipLocker = (): UseQueryResult<any, Error> => {
  return useQuery({
    queryKey: ['UserVipLocker'],
    queryFn: () => UserService.GetUserVipLocker(),
  });
};

