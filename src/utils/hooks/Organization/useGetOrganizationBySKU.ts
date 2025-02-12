import {useQuery, UseQueryResult} from '@tanstack/react-query';
import OrganizationServise from '../../../services/OrganizationServise';
import {GetAllOrganizationResponse} from '../../../services/models/response/OrganizationResServise';
import {Platform} from 'react-native';

export const useGetOrganizationBySKU = (): UseQueryResult<
  GetAllOrganizationResponse,
  Error
> => {
  const getSKU = (): string | null => {
    if (Platform.OS === 'web') {
      // Extract SKU from URL query parameters
      const params = new URLSearchParams(window.location.search);
      const skuFromURL = params.get('sku');

      if (skuFromURL) {
        // Save SKU to localStorage if it exists in the URL
        localStorage.setItem('sku', skuFromURL);
        return skuFromURL;
      }

      // If not in URL, get it from localStorage
      return localStorage.getItem('sku');
    } else {
      // Get SKU from environment variables in the app
      return process.env.SKU || null;
    }
  };

  const sku = getSKU();
  // const sku = 'dot';

  return useQuery({
    queryKey: ['OrganizationBySKU', sku],
    queryFn: () => OrganizationServise.GetOrganizationBySKU(sku ?? ''),
    enabled: !!sku,
  });
};
