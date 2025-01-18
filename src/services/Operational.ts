import axios from 'axios';
import {Status} from '../models/enums';
import {routes} from '../routes/routes';
import axiosInstance from '../utils/AxiosInstans';
import {handleMutationError} from '../utils/helpers/errorHandler';
import {SaleOrderBody} from './models/request/OperationalReqService';

const {
  operational: {saleOrder},
  baseUrl,
} = routes;

export const OperationalService = {
  SaleOrder: async (body: SaleOrderBody): Promise<any> => {
    try {
      const response = await axiosInstance.post(baseUrl + saleOrder(), body);
      if (response.status === Status.Ok || response.status === Status.Created) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response}`);
      }
    } catch (error) {
      console.error('Error in SignIN function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);
        throw new Error(
          error.response.data.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },
};
