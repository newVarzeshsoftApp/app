import {useQuery, UseQueryResult} from '@tanstack/react-query';
import IntroductionMethodService from '../../../services/IntroductionMethodService';
import {IntroductionMethodQuery} from '../../../services/models/requestQueries';
import {IntroductionMethodResponse} from '../../../services/models/response/IntroductionMethodResService';

export const useGetIntroductionMethodQuery = (
  query: IntroductionMethodQuery,
): UseQueryResult<IntroductionMethodResponse, Error> => {
  return useQuery({
    queryKey: ['IntroductionMethodQuery', query],
    queryFn: () => IntroductionMethodService.GetQuery(query),
  });
};

