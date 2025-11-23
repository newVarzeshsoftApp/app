import axios from 'axios';
import {Status} from '../models/enums';
import {routes} from '../routes/routes';
import axiosInstance from '../utils/AxiosInstans';
import {handleMutationError} from '../utils/helpers/errorHandler';
import {IntroductionMethodQuery} from './models/requestQueries';
import {IntroductionMethodResponse} from './models/response/IntroductionMethodResService';

const {
  baseUrl,
  introductionMethod: {getAll, getPage, getQuery},
} = routes;
const IntroductionMethodService = {
  GetAll: async (
    query: IntroductionMethodQuery,
  ): Promise<IntroductionMethodResponse> => {
    try {
      const response = await axiosInstance.get<IntroductionMethodResponse>(
        baseUrl + getAll(query),
      );
      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetAll function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);
        throw new Error(
          error.response?.data?.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },

  GetPage: async (
    query: IntroductionMethodQuery,
  ): Promise<IntroductionMethodResponse> => {
    try {
      const response = await axiosInstance.get<IntroductionMethodResponse>(
        baseUrl + getPage(query),
      );
      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetPage function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);
        throw new Error(
          error.response?.data?.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },

  GetQuery: async (
    query: IntroductionMethodQuery,
  ): Promise<IntroductionMethodResponse> => {
    try {
      const response = await axiosInstance.get<IntroductionMethodResponse>(
        baseUrl + getQuery(query),
      );
      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetQuery function:', error);
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

export default IntroductionMethodService;
