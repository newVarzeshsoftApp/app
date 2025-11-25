import {useMutation, UseMutationResult} from '@tanstack/react-query';
import AdminService from '../../../services/AdminService';

export const useAdminLogout = (): UseMutationResult<any, Error, void> => {
  return useMutation({
    mutationFn: () => AdminService.Logout(),
  });
};

