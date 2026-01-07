import {useMutation, UseMutationResult} from '@tanstack/react-query';
import AdminService from '../../../services/AdminService';
import {SignInResponse} from '../../../services/models/response/AuthResService';

export const useAdminRefresh = (): UseMutationResult<
  SignInResponse,
  Error,
  void
> => {
  return useMutation({
    mutationFn: () => AdminService.Refresh(),
  });
};

