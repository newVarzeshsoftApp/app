import {useQuery, UseQueryResult} from '@tanstack/react-query';
import {GetwayService} from '../../../services/GetwayService';

export const useGetGatewayPage = (): UseQueryResult<any, Error> => {
  return useQuery({
    queryKey: ['GatewayPage'],
    queryFn: () => GetwayService.GetGatewayPage(),
  });
};

