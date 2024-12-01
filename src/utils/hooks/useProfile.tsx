import {useQuery, UseQueryResult} from '@tanstack/react-query';
import AuthService from '../../services/AuthService';
import {ProfileResponse} from '../../services/models/response/AuthResService';

export const useProfile = (): UseQueryResult<ProfileResponse, Error> => {
  return useQuery<ProfileResponse, Error>({
    queryKey: ['Profile'],
    queryFn: AuthService.GetProfile,
    // enabled: !!Cookies.get(StorageKeys.token),
  });
};
