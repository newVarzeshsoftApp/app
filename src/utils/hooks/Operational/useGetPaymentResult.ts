import {useQuery, UseQueryResult} from '@tanstack/react-query';
import {OperationalService} from '../../../services/Operational';
import {PaymentResultRes} from '../../../services/models/response/UseResrService';

export const useGetPaymentResult = (
  enabled?: boolean,
): UseQueryResult<PaymentResultRes, Error> => {
  return useQuery({
    queryKey: ['PaymentResult'],
    queryFn: () => OperationalService.GetPaymentResult(),
    enabled: enabled !== false,
    retry: false,
  });
};
