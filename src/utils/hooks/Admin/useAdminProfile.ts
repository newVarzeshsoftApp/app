import {useQuery, UseQueryResult} from '@tanstack/react-query';
import AdminService from '../../../services/AdminService';
import {AdminProfileResponse} from '../../../services/models/response/AdminResService';

export const useAdminProfile = (): UseQueryResult<
  AdminProfileResponse,
  Error
> => {
  return useQuery({
    queryKey: ['AdminProfile'],
    queryFn: () => AdminService.GetProfile(),
  });
};

