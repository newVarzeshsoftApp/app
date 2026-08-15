import {useQuery, UseQueryResult} from '@tanstack/react-query';
import SaleUnitService from '../../../services/SaleUnitService';
import {SaleUnitResponse} from '../../../services/models/response/SaleUnitResService';

export const useGetSaleUnits = (
  enabled?: boolean,
): UseQueryResult<SaleUnitResponse, Error> => {
  return useQuery({
    queryKey: ['SaleUnits'],
    queryFn: () => SaleUnitService.GetAll(),
    enabled: enabled !== false,
    retry: false,
  });
};

