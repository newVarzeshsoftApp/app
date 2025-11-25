import {useQuery, UseQueryResult} from '@tanstack/react-query';
import ConfigService from '../../../services/ConfigService';
import {ConfigResponse} from '../../../services/models/response/ConfigResService';

export const useGetConfigs = (): UseQueryResult<ConfigResponse, Error> => {
  return useQuery({
    queryKey: ['Configs'],
    queryFn: () => ConfigService.GetConfigs(),
  });
};

