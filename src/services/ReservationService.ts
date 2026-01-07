import axios, {AxiosResponse} from 'axios';
import {Status} from '../models/enums';
import {routes} from '../routes/routes';
import axiosInstance from '../utils/AxiosInstans';
import {PreReserveQuery, ReservationQuery} from './models/requestQueries';
import {
  AuthResponseSignUpDto,
  ReservationExpiresTimeRes,
  ReservationPattern,
  ReservationPatternsResponse,
  ReservationTag,
  ReservationTagsResponse,
  ResponseReserveViewResponseDto,
} from './models/response/ReservationResService';
import {
  CancelReservationDto,
  CreateReserveDto,
} from './models/request/ReservationReqService';
import {handleMutationError} from '../utils/helpers/errorHandler';

const {
  baseUrl,
  reservation: {
    getTags,
    getPatterns,
    getReservation,
    preReserve,
    submit,
    cancel,
    getExpiresTime,
  },
} = routes;

const ReservationService = {
  GetTags: async (): Promise<ReservationTagsResponse> => {
    try {
      const response = await axiosInstance.get<ReservationTagsResponse>(
        baseUrl + getTags(),
      );
      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetTags function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);
        throw new Error(
          error.response?.data?.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },

  GetPatterns: async (): Promise<ReservationPatternsResponse> => {
    try {
      const response = await axiosInstance.get<ReservationPatternsResponse>(
        baseUrl + getPatterns(),
      );
      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetPatterns function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);
        throw new Error(
          error.response?.data?.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },

  GetReservation: async (
    query: ReservationQuery,
    signal?: AbortSignal,
  ): Promise<ResponseReserveViewResponseDto> => {
    try {
      const response = await axiosInstance.get<ResponseReserveViewResponseDto>(
        baseUrl + getReservation(query),
        {signal},
      );
      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetReservation function:', error);
      // Don't handle AbortError - let React Query handle it
      if (axios.isCancel(error)) {
        throw error;
      }
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);
        throw new Error(
          error.response?.data?.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },

  PreReserve: async (
    query: PreReserveQuery,
  ): Promise<AuthResponseSignUpDto> => {
    try {
      const response = await axiosInstance.post<
        PreReserveQuery,
        AxiosResponse<AuthResponseSignUpDto>
      >(baseUrl + preReserve(query), {});
      if (response.status === Status.Ok || response.status === Status.Created) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in PreReserve function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);
        throw new Error(
          error.response?.data?.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },

  SubmitReservation: async (
    body: CreateReserveDto,
  ): Promise<AuthResponseSignUpDto> => {
    try {
      const response = await axiosInstance.post<
        CreateReserveDto,
        AxiosResponse<AuthResponseSignUpDto>
      >(baseUrl + submit(), body);
      if (response.status === Status.Ok || response.status === Status.Created) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in SubmitReservation function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);
        throw new Error(
          error.response?.data?.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },

  CancelReservation: async (
    body: CancelReservationDto,
  ): Promise<AuthResponseSignUpDto> => {
    try {
      const response = await axiosInstance.post<
        CancelReservationDto,
        AxiosResponse<AuthResponseSignUpDto>
      >(baseUrl + cancel(), body);
      if (response.status === Status.Ok || response.status === Status.Created) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in CancelReservation function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);
        throw new Error(
          error.response?.data?.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },

  GetExpiresTime: async (): Promise<ReservationExpiresTimeRes> => {
    try {
      const response = await axiosInstance.get<ReservationExpiresTimeRes>(
        baseUrl + getExpiresTime(),
      );
      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetExpiresTime function:', error);
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

export default ReservationService;
