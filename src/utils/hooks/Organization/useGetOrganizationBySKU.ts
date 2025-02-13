import {useQuery, UseQueryResult} from '@tanstack/react-query';
import OrganizationServise from '../../../services/OrganizationServise';
import {GetAllOrganizationResponse} from '../../../services/models/response/OrganizationResServise';
import {Platform} from 'react-native';
import {GetSKU} from '../../helpers/GetSKU';

export const useGetOrganizationBySKU = (): UseQueryResult<
  GetAllOrganizationResponse,
  Error
> => {
  // const sku = GetSKU();
  const sku = 'dot';

  return useQuery({
    queryKey: ['OrganizationBySKU', sku],
    queryFn: () => OrganizationServise.GetOrganizationBySKU(sku ?? ''),
    enabled: !!sku,
  });
};
