export interface Survey {
  id: number;
  [key: string]: any; // Add specific fields based on API response
}

export interface SurveySheet {
  id: number;
  surveyId: number;
  [key: string]: any; // Add specific fields based on API response
}

export interface UnansweredSurveyResponse {
  surveys: Survey[];
  [key: string]: any;
}
