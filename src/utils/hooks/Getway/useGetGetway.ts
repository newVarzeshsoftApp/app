import {useQuery, UseQueryResult} from '@tanstack/react-query';
import {GetwayService} from '../../../services/GetwayService';
import {GetGatewayRes} from '../../../services/models/response/GetwayResService';

export const useGetGetway = (): UseQueryResult<GetGatewayRes[], Error> => {
  return useQuery({
    queryKey: ['GetGateway'],
    queryFn: () => GetwayService.GetGateway(),
  });
};
