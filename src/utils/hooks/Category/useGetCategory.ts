import {useQuery, UseQueryResult} from '@tanstack/react-query';
import {CategoryQuery} from '../../../services/models/requestQueries';
import {CategoryService} from '../../../services/CategoryService';
import {CategoryPageRes} from '../../../services/models/response/CategoryResService';

export const useGetCategory = (
  query: CategoryQuery,
): UseQueryResult<CategoryPageRes, Error> => {
  return useQuery({
    queryKey: ['CategoryPage', query],
    queryFn: () => CategoryService.GetCategoryPage(query),
    retry: false,
  });
};
