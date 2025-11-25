import axios, {AxiosResponse} from 'axios';
import {Status} from '../models/enums';
import {routes} from '../routes/routes';
import axiosInstance from '../utils/AxiosInstans';
import {handleMutationError} from '../utils/helpers/errorHandler';
import {storeTokens} from '../utils/helpers/tokenStorage';
import {AdminLoginBody} from './models/request/AdminReqService';
import {
  AdminLoginResponse,
  AdminProfileResponse,
} from './models/response/AdminResService';
import {SignInResponse} from './models/response/AuthResService';

const {
  baseUrl,
  admin: {login, logout, profile, refresh},
} = routes;

const AdminService = {
  Login: async (body: AdminLoginBody): Promise<AdminLoginResponse> => {
    try {
      const response = await axiosInstance.post<
        AdminLoginBody,
        AxiosResponse<AdminLoginResponse>
      >(baseUrl + login(), body);
      if (response.status === Status.Ok || response.status === Status.Created) {
        if (response.data.accessToken && response.data.refreshToken) {
          await storeTokens(
            response.data.accessToken,
            response.data.refreshToken,
          );
        }
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in Admin Login function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);
        throw new Error(
          error.response?.data?.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },

  Logout: async (): Promise<any> => {
    try {
      const response = await axiosInstance.post<any, AxiosResponse<any>>(
        baseUrl + logout(),
      );
      if (response.status === Status.Ok || response.status === Status.Created) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in Admin Logout function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);
        throw new Error(
          error.response?.data?.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },

  GetProfile: async (): Promise<AdminProfileResponse> => {
    try {
      const response = await axiosInstance.get<AdminProfileResponse>(
        baseUrl + profile(),
      );
      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in Admin GetProfile function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);
        throw new Error(
          error.response?.data?.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },

  Refresh: async (): Promise<SignInResponse> => {
    try {
      const response = await axiosInstance.get<
        any,
        AxiosResponse<SignInResponse>
      >(baseUrl + refresh());
      if (response.status === Status.Ok || response.status === Status.Created) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in Admin Refresh function:', error);
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

export default AdminService;
