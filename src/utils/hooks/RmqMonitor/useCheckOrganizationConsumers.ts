import {useQuery, UseQueryResult} from '@tanstack/react-query';
import RmqMonitorService from '../../../services/RmqMonitorService';
import {OrganizationConsumersResponse} from '../../../services/models/response/RmqMonitorResService';

export const useCheckOrganizationConsumers = (
  orgKey: string,
  enabled?: boolean,
): UseQueryResult<OrganizationConsumersResponse, Error> => {
  return useQuery({
    queryKey: ['OrganizationConsumers', orgKey],
    queryFn: () => RmqMonitorService.CheckOrganizationConsumers(orgKey),
    enabled: enabled !== false && !!orgKey,
    retry: false,
  });
};

