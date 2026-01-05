import {useQuery, UseQueryResult} from '@tanstack/react-query';
import RmqMonitorService from '../../../services/RmqMonitorService';
import {QueueConsumersResponse} from '../../../services/models/response/RmqMonitorResService';

export const useGetQueueConsumers = (
  queueName: string,
  enabled?: boolean,
): UseQueryResult<QueueConsumersResponse, Error> => {
  return useQuery({
    queryKey: ['QueueConsumers', queueName],
    queryFn: () => RmqMonitorService.GetQueueConsumers(queueName),
    enabled: enabled !== false && !!queueName,
    retry: false,
  });
};

