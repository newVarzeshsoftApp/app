import {useMutation, UseMutationResult} from '@tanstack/react-query';
import AdminService from '../../../services/AdminService';
import {AdminLoginBody} from '../../../services/models/request/AdminReqService';
import {AdminLoginResponse} from '../../../services/models/response/AdminResService';

export const useAdminLogin = (): UseMutationResult<
  AdminLoginResponse,
  Error,
  AdminLoginBody
> => {
  return useMutation({
    mutationFn: (body: AdminLoginBody) => AdminService.Login(body),
  });
};
