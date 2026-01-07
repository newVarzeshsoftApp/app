import {useQuery, UseQueryResult} from '@tanstack/react-query';
import SurveyService from '../../../services/SurveyService';
import {Survey} from '../../../services/models/response/SurveyResService';

export const useGetSurveyById = (
  id: number,
): UseQueryResult<Survey, Error> => {
  return useQuery({
    queryKey: ['Survey', id],
    queryFn: () => SurveyService.GetById(id),
    enabled: !!id,
  });
};

