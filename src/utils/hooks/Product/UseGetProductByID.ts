import {useQuery, UseQueryResult} from '@tanstack/react-query';
import {ProductService} from '../../../services/ProductService';
import {Product} from '../../../services/models/response/ProductResService';

export const UseGetProductByID = (
  id: number,
): UseQueryResult<Product, Error> => {
  return useQuery({
    queryKey: ['Product', id],
    queryFn: () => ProductService.GetProductByID(id),
    retry: false,
  });
};
