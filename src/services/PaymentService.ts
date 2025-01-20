import axios, {AxiosResponse} from 'axios';
import {routes} from '../routes/routes';
import axiosInstance from '../utils/AxiosInstans';
import {
  PaymentBody,
  PaymentVerifyBody,
} from './models/request/PaymentReqService';
import {Status} from '../models/enums';
import {
  PaymentRes,
  PaymentVerifyRes,
  paymentVerifySubmitOrderRes,
} from './models/response/PaymentResService';
import {handleMutationError} from '../utils/helpers/errorHandler';

const {
  baseUrl,
  Payment: {createPayment, paymentVerify, paymentVerifySubmitOrder},
} = routes;
export const PaymentService = {
  CreatePayment: async (body: PaymentBody): Promise<PaymentRes> => {
    try {
      const response = await axiosInstance.post<
        PaymentBody,
        AxiosResponse<PaymentRes>
      >(baseUrl + createPayment(), body);
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
  paymentVerify: async (body: PaymentVerifyBody): Promise<PaymentVerifyRes> => {
    try {
      const response = await axiosInstance.put<
        PaymentVerifyBody,
        AxiosResponse<PaymentVerifyRes>
      >(baseUrl + paymentVerify(), body);
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
  paymentVerifySubmitOrder: async (
    body: PaymentVerifyBody,
  ): Promise<paymentVerifySubmitOrderRes> => {
    try {
      const response = await axiosInstance.put<
        PaymentVerifyBody,
        AxiosResponse<paymentVerifySubmitOrderRes>
      >(baseUrl + paymentVerifySubmitOrder(), body);
      if (response.status === Status.Ok || response.status === Status.Created) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response}`);
      }
    } catch (error) {
      console.error('Error in paymentVerifySubmitOrder function:', error);
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
