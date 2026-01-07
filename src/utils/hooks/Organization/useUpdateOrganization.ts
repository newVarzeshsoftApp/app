import {useMutation, UseMutationResult} from '@tanstack/react-query';
import OrganizationServise from '../../../services/OrganizationServise';
import {UpdateOrganizationBody} from '../../../services/models/request/OrganizationReqService';

interface UpdateOrganizationParams {
  id: number;
  body: UpdateOrganizationBody;
}

export const useUpdateOrganization = (): UseMutationResult<
  any,
  Error,
  UpdateOrganizationParams
> => {
  return useMutation({
    mutationFn: ({id, body}: UpdateOrganizationParams) =>
      OrganizationServise.UpdateOrganization(id, body),
  });
};

