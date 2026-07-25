import {useQuery, UseQueryResult} from '@tanstack/react-query';
import ContractorService from '../../../services/ContractorService';
import {ContractorQuery} from '../../../services/models/requestQueries';
import {ContractorResponse} from '../../../services/models/response/ContractorResService';

export const useGetContractors = (
  query?: ContractorQuery,
  enabled?: boolean,
): UseQueryResult<ContractorResponse, Error> => {
  return useQuery({
    queryKey: ['Contractors', query],
    queryFn: () => ContractorService.GetAll(query),
    enabled: enabled !== false,
    retry: false,
  });
};
