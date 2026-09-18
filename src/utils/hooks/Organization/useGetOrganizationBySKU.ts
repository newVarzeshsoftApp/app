import {useQuery, UseQueryResult} from '@tanstack/react-query';
import OrganizationServise from '../../../services/OrganizationServise';
import {GetAllOrganizationResponse} from '../../../services/models/response/OrganizationResServise';
import {isMultiOrganization} from '../../helpers/organizationUnits';

export const useGetOrganizationBySKU = (): UseQueryResult<
  GetAllOrganizationResponse,
  Error
> => {
  return useQuery({
    queryKey: ['OrganizationBySKU'],
    queryFn: () => OrganizationServise.GetOrganizationBySKU(),
  });
};

export const useIsMultiOrg = (): boolean => {
  const {data} = useGetOrganizationBySKU();
  return isMultiOrganization(data?.organizationUnits);
};
