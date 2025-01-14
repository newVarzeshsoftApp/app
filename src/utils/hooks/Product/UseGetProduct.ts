import {useQuery, UseQueryResult} from '@tanstack/react-query';
import {ProductQuery} from '../../../services/models/requestQueries';
import {ProductService} from '../../../services/ProductService';
import {ProductPageRes} from '../../../services/models/response/ProductResService';

export const UseGetProduct = (
  query: ProductQuery,
): UseQueryResult<ProductPageRes, Error> => {
  return useQuery({
    queryKey: ['ProductPage', query],
    queryFn: () => ProductService.GetProductPage(query),
    retry: false,
  });
};
