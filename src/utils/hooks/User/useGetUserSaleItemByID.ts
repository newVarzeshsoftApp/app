import {useQuery, UseQueryResult} from '@tanstack/react-query';
import UserService from '../../../services/UserService';
import {Content} from '../../../services/models/response/UseResrService';

export const useGetUserSaleItemByID = (
  id: number,
): UseQueryResult<Content, Error> => {
  return useQuery({
    queryKey: ['UserSaleItem', id],
    queryFn: () => UserService.GetSaleItemByID(id),
    enabled: !!id,
  });
};
