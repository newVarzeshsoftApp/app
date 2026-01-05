import {useQuery, UseQueryResult} from '@tanstack/react-query';
import ContractorService from '../../../services/ContractorService';
import {ContractorResponse} from '../../../services/models/response/ContractorResService';

export const useGetContractors = (
  enabled?: boolean,
): UseQueryResult<ContractorResponse, Error> => {
  return useQuery({
    queryKey: ['Contractors'],
    queryFn: () => ContractorService.GetAll(),
    enabled: enabled !== false,
    retry: false,
  });
};

