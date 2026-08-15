import {useQuery, UseQueryResult} from '@tanstack/react-query';
import ContractorService from '../../../services/ContractorService';
import {ContractorQuery} from '../../../services/models/requestQueries';
import {User} from '../../../services/models/response/UseResrService';

export const useGetContractors = (
  query?: ContractorQuery,
  enabled?: boolean,
): UseQueryResult<User[], Error> => {
  return useQuery({
    queryKey: ['Contractors', query],
    queryFn: () => ContractorService.GetAll(query),
    enabled: enabled !== false,
    retry: false,
  });
};
