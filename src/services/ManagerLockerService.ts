import axios, {AxiosResponse} from 'axios';
import {Status} from '../models/enums';
import {routes} from '../routes/routes';
import axiosInstance from '../utils/AxiosInstans';
import {openLockerBody} from './models/request/ManagerLockerReqService';
import {handleMutationError} from '../utils/helpers/errorHandler';

const {
  baseUrl,
  manageLocker: {openLocker},
} = routes;

export const ManagerLockerService = {
  OpenLocker: async (body: openLockerBody): Promise<any> => {
    try {
      const response = await axiosInstance.patch<
        openLockerBody,
        AxiosResponse<any>
      >(baseUrl + openLocker(), body);
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
          error.response?.data?.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },
};
