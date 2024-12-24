import {useQuery, UseQueryResult} from '@tanstack/react-query';
import UserService from '../../../services/UserService';
import {Payments} from '../../../services/models/response/UseResrService';
import {UserSaleItemQuey} from '../../../services/models/requestQueries';

export const useGetUserPayment = (
  query: UserSaleItemQuey,
): UseQueryResult<Payments, Error> => {
  return useQuery({
    queryKey: ['UserPayment', query],
    queryFn: () => UserService.GetUserPayment(query),
  });
};
