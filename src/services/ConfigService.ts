import axios, {AxiosResponse} from 'axios';
import {Status} from '../models/enums';
import {routes} from '../routes/routes';
import axiosInstance from '../utils/AxiosInstans';
import {handleMutationError} from '../utils/helpers/errorHandler';
import {ConfigResponse} from './models/response/ConfigResService';

const {
  baseUrl,
  config: {getConfigs, createConfig},
} = routes;

const ConfigService = {
  GetConfigs: async (): Promise<ConfigResponse> => {
    try {
      const response = await axiosInstance.get<ConfigResponse>(
        baseUrl + getConfigs(),
      );
      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetConfigs function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);
        throw new Error(
          error.response?.data?.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },

  CreateConfig: async (body: any): Promise<any> => {
    try {
      const response = await axiosInstance.post<any, AxiosResponse<any>>(
        baseUrl + createConfig(),
        body,
      );
      if (response.status === Status.Ok || response.status === Status.Created) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in CreateConfig function:', error);
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

export default ConfigService;

