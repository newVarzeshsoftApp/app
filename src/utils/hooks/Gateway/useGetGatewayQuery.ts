import {useQuery, UseQueryResult} from '@tanstack/react-query';
import {GetwayService} from '../../../services/GetwayService';

export const useGetGatewayQuery = (): UseQueryResult<any, Error> => {
  return useQuery({
    queryKey: ['GatewayQuery'],
    queryFn: () => GetwayService.GetGatewayQuery(),
  });
};

