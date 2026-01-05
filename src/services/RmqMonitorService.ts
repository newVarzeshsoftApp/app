import axios, {AxiosResponse} from 'axios';
import {Status} from '../models/enums';
import {routes} from '../routes/routes';
import axiosInstance from '../utils/AxiosInstans';
import {
  DuplicateCheckResponse,
  OrganizationConsumersResponse,
  QueueConsumersResponse,
} from './models/response/RmqMonitorResService';
import {handleMutationError} from '../utils/helpers/errorHandler';

const {baseUrl, rmqMonitor} = routes;

const RmqMonitorService = {
  GetQueueConsumers: async (
    queueName: string,
  ): Promise<QueueConsumersResponse> => {
    try {
      const response = await axiosInstance.get<QueueConsumersResponse>(
        baseUrl + rmqMonitor.getQueueConsumers(queueName),
      );
      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetQueueConsumers function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);
        throw new Error(
          error.response?.data?.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },

  CheckDuplicateConsumers: async (
    queueName: string,
  ): Promise<DuplicateCheckResponse> => {
    try {
      const response = await axiosInstance.get<DuplicateCheckResponse>(
        baseUrl + rmqMonitor.checkDuplicateConsumers(queueName),
      );
      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in CheckDuplicateConsumers function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);
        throw new Error(
          error.response?.data?.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },

  CheckOrganizationConsumers: async (
    orgKey: string,
  ): Promise<OrganizationConsumersResponse> => {
    try {
      const response = await axiosInstance.get<OrganizationConsumersResponse>(
        baseUrl + rmqMonitor.checkOrganizationConsumers(orgKey),
      );
      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in CheckOrganizationConsumers function:', error);
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

export default RmqMonitorService;

