import {useQuery, UseQueryResult} from '@tanstack/react-query';
import OrganizationServise from '../../../services/OrganizationServise';
import {GetAllOrganizationResponse} from '../../../services/models/response/OrganizationResServise';

export const useGetOrganizationBySKU = (): UseQueryResult<
  GetAllOrganizationResponse,
  Error
> => {
  return useQuery({
    queryKey: ['OrganizationBySKU'],
    queryFn: () => OrganizationServise.GetOrganizationBySKU(),
  });
};
