import {useQuery, UseQueryResult} from '@tanstack/react-query';
import {ProductService} from '../../../services/ProductService';
import {Product} from '../../../services/models/response/ProductResService';

export const UseGetProductByID = (
  id: number,
  options?: {enabled?: boolean},
): UseQueryResult<Product, Error> => {
  return useQuery({
    queryKey: ['Product', id],
    queryFn: () => ProductService.GetProductByID(id),
    retry: false,
    enabled: (options?.enabled ?? true) && id > 0,
  });
};
