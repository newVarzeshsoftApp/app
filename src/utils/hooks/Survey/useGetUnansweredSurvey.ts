import {useQuery, UseQueryResult} from '@tanstack/react-query';
import SurveyService from '../../../services/SurveyService';
import {UnansweredSurveyResponse} from '../../../services/models/response/SurveyResService';

export const useGetUnansweredSurvey = (): UseQueryResult<
  UnansweredSurveyResponse,
  Error
> => {
  return useQuery({
    queryKey: ['UnansweredSurvey'],
    queryFn: () => SurveyService.GetUnanswered(),
  });
};

