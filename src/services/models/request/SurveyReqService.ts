export interface AnswerDto {
  questionId: number;
  questionType: string;
  answer: string;
}

export interface SubmitAnswerSheetBody {
  surveySheetId: number;
  answers: AnswerDto[];
}
