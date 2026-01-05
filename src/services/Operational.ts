import axios, {AxiosResponse} from 'axios';
import {Status} from '../models/enums';
import {routes} from '../routes/routes';
import axiosInstance from '../utils/AxiosInstans';
import {handleMutationError} from '../utils/helpers/errorHandler';
import {CreateSaleOrderDto, SaleOrderBody} from './models/request/OperationalReqService';
import {
  SaleOrderByIDRes,
  PaymentResultRes,
} from './models/response/UseResrService';

const {
  operational: {saleOrder, getPaymentResult},
  baseUrl,
} = routes;

export const OperationalService = {
  SaleOrder: async (body: CreateSaleOrderDto | SaleOrderBody): Promise<any> => {
    try {
      const response = await axiosInstance.post<
        CreateSaleOrderDto | SaleOrderBody,
        AxiosResponse<any>
      >(baseUrl + saleOrder(), body);
      if (response.status === Status.Ok || response.status === Status.Created) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in SaleOrder function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);
        throw new Error(
          error.response?.data?.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },
  GetPaymentResult: async (): Promise<PaymentResultRes> => {
    try {
      const response = await axiosInstance.get<PaymentResultRes>(
        baseUrl + getPaymentResult(),
      );
      if (response.status === Status.Ok || response.status === Status.Created) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetPaymentResult function:', error);
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
