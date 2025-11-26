import {useMutation, UseMutationResult} from '@tanstack/react-query';
import SurveyService from '../../../services/SurveyService';
import {SubmitAnswerSheetBody} from '../../../services/models/request/SurveyReqService';

export const useSubmitSurveyAnswers = (): UseMutationResult<
  any,
  Error,
  SubmitAnswerSheetBody
> => {
  return useMutation({
    mutationFn: (body: SubmitAnswerSheetBody) =>
      SurveyService.SubmitAnswers(body),
  });
};
