import {useQuery, UseQueryResult} from '@tanstack/react-query';
import {CategoryQuery} from '../../../services/models/requestQueries';
import {CategoryService} from '../../../services/CategoryService';
import {CategoryQueryRes} from '../../../services/models/response/CategoryResService';

export const useGetCategory = (
  query: CategoryQuery,
): UseQueryResult<CategoryQueryRes, Error> => {
  return useQuery({
    queryKey: ['CategoryPage', query],
    queryFn: () => CategoryService.GetCategoryQuery(query),
  });
};
