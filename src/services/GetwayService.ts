import axios from 'axios';
import {Status} from '../models/enums';
import {routes} from '../routes/routes';
import axiosInstance from '../utils/AxiosInstans';
import {GetGatewayRes} from './models/response/GetwayResService';
import {handleMutationError} from '../utils/helpers/errorHandler';

const {
  baseUrl,
  gateway: {getGateway},
} = routes;
export const GetwayService = {
  GetGateway: async (): Promise<GetGatewayRes[]> => {
    try {
      const response = await axiosInstance.get<GetGatewayRes[]>(
        baseUrl + getGateway(),
      );
      if (response.status === Status.Ok || response.status === Status.Created) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetGateway function:', error);
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
