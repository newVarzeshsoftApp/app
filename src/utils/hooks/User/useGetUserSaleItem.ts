import {
  useInfiniteQuery,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';
import UserService from '../../../services/UserService';
import {GetUserSaleItemRes} from '../../../services/models/response/UseResrService';
import {UserSaleItemQuey} from '../../../services/models/requestQueries';

export const useGetUserSaleItem = (
  query: UserSaleItemQuey,
  enabled = true,
): UseQueryResult<GetUserSaleItemRes, Error> => {
  return useQuery({
    queryKey: ['UserSaleItem', query],
    queryFn: () => UserService.GetUserSaleItem(query),
    enabled,
  });
};

export const useGetUserSaleItemPages = (
  query: UserSaleItemQuey,
  pageSize: number,
) =>
  useInfiniteQuery({
    queryKey: ['UserSaleItem', 'pages', query, pageSize],
    initialPageParam: 0,
    queryFn: ({pageParam}) =>
      UserService.GetUserSaleItem({
        ...query,
        limit: pageSize,
        offset: pageParam,
      }),
    getNextPageParam: (page, _pages, offset) => {
      const nextOffset = offset + page.content.length;
      return page.content.length > 0 && nextOffset < page.total
        ? nextOffset
        : undefined;
    },
  });
