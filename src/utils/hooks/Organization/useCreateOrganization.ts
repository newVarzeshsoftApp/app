import {useMutation, UseMutationResult} from '@tanstack/react-query';
import OrganizationServise from '../../../services/OrganizationServise';
import {CreateOrganizationBody} from '../../../services/models/request/OrganizationReqService';
import {GetAllOrganizationResponse} from '../../../services/models/response/OrganizationResServise';

export const useCreateOrganization = (): UseMutationResult<
  GetAllOrganizationResponse,
  Error,
  CreateOrganizationBody
> => {
  return useMutation({
    mutationFn: (body: CreateOrganizationBody) =>
      OrganizationServise.CreateOrganization(body),
  });
};

