import axios, {AxiosResponse} from 'axios';
import {Status} from '../models/enums';
import {routes} from '../routes/routes';
import axiosInstance from '../utils/AxiosInstans';
import {handleMutationError} from '../utils/helpers/errorHandler';
import {SubmitAnswerSheetBody} from './models/request/SurveyReqService';
import {
  Survey,
  UnansweredSurveyResponse,
} from './models/response/SurveyResService';

const {
  baseUrl,
  survey: {getUnanswered, getById, submitAnswers},
} = routes;

const SurveyService = {
  GetUnanswered: async (): Promise<UnansweredSurveyResponse> => {
    try {
      const response = await axiosInstance.get<UnansweredSurveyResponse>(
        baseUrl + getUnanswered(),
      );
      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetUnanswered function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);
        throw new Error(
          error.response?.data?.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },

  GetById: async (id: number): Promise<Survey> => {
    try {
      const response = await axiosInstance.get<Survey>(baseUrl + getById(id));
      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetById function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);
        throw new Error(
          error.response?.data?.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },

  SubmitAnswers: async (body: SubmitAnswerSheetBody): Promise<any> => {
    try {
      const response = await axiosInstance.post<
        SubmitAnswerSheetBody,
        AxiosResponse<any>
      >(baseUrl + submitAnswers(), body);
      if (response.status === Status.Ok || response.status === Status.Created) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in SubmitAnswers function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);
        throw new Error(
          error.response?.data?.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },
};

export default SurveyService;
