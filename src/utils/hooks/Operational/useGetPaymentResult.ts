import {useQuery, UseQueryResult} from '@tanstack/react-query';
import {OperationalService} from '../../../services/Operational';
import {PaymentResultRes} from '../../../services/models/response/UseResrService';

export const useGetPaymentResult = (
  ids: string,
): UseQueryResult<PaymentResultRes, Error> => {
  return useQuery({
    queryKey: ['PaymentResult', ids],
    queryFn: () => OperationalService.GetPaymentResult(ids),
    enabled: Boolean(ids && ids.trim().length > 0),
  });
};
