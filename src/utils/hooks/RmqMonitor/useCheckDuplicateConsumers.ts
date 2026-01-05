import {useQuery, UseQueryResult} from '@tanstack/react-query';
import RmqMonitorService from '../../../services/RmqMonitorService';
import {DuplicateCheckResponse} from '../../../services/models/response/RmqMonitorResService';

export const useCheckDuplicateConsumers = (
  queueName: string,
  enabled?: boolean,
): UseQueryResult<DuplicateCheckResponse, Error> => {
  return useQuery({
    queryKey: ['DuplicateConsumers', queueName],
    queryFn: () => RmqMonitorService.CheckDuplicateConsumers(queueName),
    enabled: enabled !== false && !!queueName,
    retry: false,
  });
};

