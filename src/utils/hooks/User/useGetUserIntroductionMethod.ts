import {useQuery, UseQueryResult} from '@tanstack/react-query';
import UserService from '../../../services/UserService';
import {IntroductionMethodQuery} from '../../../services/models/requestQueries';

export const useGetUserIntroductionMethod = (
  query: IntroductionMethodQuery,
): UseQueryResult<any, Error> => {
  return useQuery({
    queryKey: ['UserIntroductionMethod', query],
    queryFn: () => UserService.GetIntroductionMethod(query),
  });
};

