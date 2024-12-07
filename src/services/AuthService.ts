import axios, {AxiosResponse} from 'axios';
import {routes} from '../routes/routes';
import {
  RequestOTPBody,
  SignInBody,
  SignUpBody,
  UpdatePasswordBody,
  VerifyTokenBody,
} from './models/request/AuthReqService';
import {
  ProfileResponse,
  SignInResponse,
  SignUpResponse,
} from './models/response/AuthResService';
import axiosInstance from '../utils/AxiosInstans';
import {Status} from '../models/enums';
import {storeTokens} from '../utils/helpers/tokenStorage';
const {
  auth: {
    signIn,
    signUp,
    requestOTP,
    verifyToken,
    updatePassword,
    logout,
    profile,
    refresh,
  },
  baseUrl,
} = routes;

const AuthService = {
  SignIN: async (body: SignInBody): Promise<SignInResponse> => {
    try {
      const response = await axiosInstance.post<
        SignInBody,
        AxiosResponse<SignInResponse>
      >(baseUrl + signIn(), body);
      if (response.status === Status.Ok || response.status === Status.Created) {
        await storeTokens(
          response.data.accessToken,
          response.data.refreshToken,
        );
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response}`);
      }
    } catch (error) {
      console.error('Error in SignIN function:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || 'Unknown error occurred',
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
        // await storeTokens(
        //   response.data.accessToken,
        //   response.data.refreshToken,
        // );
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response}`);
      }
    } catch (error) {
      console.error('Error in Refresh function:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },

  GetProfile: async (): Promise<ProfileResponse> => {
    try {
      const response = await axiosInstance.get<ProfileResponse>(
        baseUrl + profile(),
      );
      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetProfile function:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },
  UpdatePassword: async (body: UpdatePasswordBody) => {
    try {
      const response = await axiosInstance.put<
        UpdatePasswordBody,
        AxiosResponse<SignInResponse>
      >(baseUrl + updatePassword(), body);
      if (response.status === Status.Ok || response.status === Status.Created) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response}`);
      }
    } catch (error) {
      console.error('Error in SignIN function:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },

  SignUp: async (body: SignUpBody): Promise<SignUpResponse> => {
    try {
      const response = await axiosInstance.post<
        SignUpBody,
        AxiosResponse<SignUpResponse>
      >(baseUrl + signUp(), body);
      if (response.status === Status.Ok || response.status === Status.Created) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response}`);
      }
    } catch (error) {
      console.error('Error in SignUp function:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },
  Logout: async (): Promise<SignUpResponse> => {
    try {
      const response = await axiosInstance.post<
        any,
        AxiosResponse<SignUpResponse>
      >(baseUrl + logout());
      if (response.status === Status.Ok || response.status === Status.Created) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response}`);
      }
    } catch (error) {
      console.error('Error in Logout function:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },
  RequestOTP: async (body: RequestOTPBody): Promise<SignUpResponse> => {
    try {
      const response = await axiosInstance.post<
        SignUpBody,
        AxiosResponse<SignUpResponse>
      >(baseUrl + requestOTP(), body);
      if (response.status === Status.Ok || response.status === Status.Created) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response}`);
      }
    } catch (error) {
      console.error('Error in Request OTP function:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },
  VerifyToken: async (body: VerifyTokenBody): Promise<SignInResponse> => {
    try {
      const response = await axiosInstance.put<
        VerifyTokenBody,
        AxiosResponse<SignInResponse>
      >(baseUrl + verifyToken(), body);
      if (response.status === Status.Ok || response.status === Status.Created) {
        await storeTokens(
          response.data.accessToken,
          response.data.refreshToken,
        );
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in VerifyToken function:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },
};
export default AuthService;
