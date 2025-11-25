export interface SurveyGift {
  id: number;
  title: string | null;
  sku?: string | null;
  price?: number;
  discount?: number;
  status?: boolean;
  isLocker?: boolean;
  unlimited?: boolean;
  allowChildInheritance?: boolean;
  checkInsurance?: boolean;
  related?: boolean;
  tax?: number;
  capacity?: number;
  reserveCapacity?: number;
  reservable?: boolean;
  duration?: number;
  archivedPenaltyAmount?: number;
  description?: string | null;
  categoryId?: number | null;
  [key: string]: any;
}

export interface SurveyGiftPrice {
  id: number;
  title?: string | null;
  min?: number;
  max?: number;
  duration?: number;
  price?: number;
  credit?: number;
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface SurveyQuestionOption {
  id?: number;
  key?: string;
  title?: string;
  value?: string | number;
}

export interface SurveyQuestion {
  id: number;
  question?: string;
  title?: string;
  description?: string;
  questionType?: 'single_choice' | 'multiple_choice' | 'text';
  isRequired?: boolean;
  options?: SurveyQuestionOption[];
  surveySheetId?: number;
  [key: string]: any;
}

export interface Survey {
  id: number;
  title?: string;
  description?: string;
  isActive?: boolean;
  isFilled?: boolean;
  start?: string;
  end?: string;
  giftId?: number | null;
  giftPriceId?: number | null;
  gift?: SurveyGift | null;
  giftPrice?: SurveyGiftPrice | null;
  surveySheetId?: number;
  questions?: SurveyQuestion[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  [key: string]: any;
}

export type UnansweredSurveyResponse = Survey[];
