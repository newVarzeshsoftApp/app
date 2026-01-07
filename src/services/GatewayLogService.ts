import axios from 'axios';
import {Status} from '../models/enums';
import {routes} from '../routes/routes';
import axiosInstance from '../utils/AxiosInstans';
import {handleMutationError} from '../utils/helpers/errorHandler';
import {GatewayLogQuery} from './models/requestQueries';
import {GatewayLogResponse} from './models/response/GatewayLogResService';

const {
  baseUrl,
  gatewayLog: {getGatewayLog},
} = routes;

const GatewayLogService = {
  GetGatewayLog: async (query: GatewayLogQuery): Promise<GatewayLogResponse> => {
    try {
      const response = await axiosInstance.get<GatewayLogResponse>(
        baseUrl + getGatewayLog(query),
      );
      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetGatewayLog function:', error);
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

export default GatewayLogService;

