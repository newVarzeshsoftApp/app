import {useQuery, UseQueryResult} from '@tanstack/react-query';
import GatewayLogService from '../../../services/GatewayLogService';
import {GatewayLogQuery} from '../../../services/models/requestQueries';
import {GatewayLogResponse} from '../../../services/models/response/GatewayLogResService';

export const useGetGatewayLog = (
  query: GatewayLogQuery,
): UseQueryResult<GatewayLogResponse, Error> => {
  return useQuery({
    queryKey: ['GatewayLog', query],
    queryFn: () => GatewayLogService.GetGatewayLog(query),
  });
};

