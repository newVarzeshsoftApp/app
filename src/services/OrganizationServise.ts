import axios, {AxiosResponse} from 'axios';
import {Status} from '../models/enums';
import {routes} from '../routes/routes';
import axiosInstance from '../utils/AxiosInstans';
import {AllOrganizationQuery} from './models/requestQueries';
import {GetAllOrganizationResponse} from './models/response/OrganizationResServise';
import {handleMutationError} from '../utils/helpers/errorHandler';
import {
  CreateOrganizationBody,
  UpdateOrganizationBody,
} from './models/request/OrganizationReqService';

const {
  baseUrl,
  organization: {
    getAllOrganization,
    getOrganizationByID,
    getOrganizationBySKU,
    createOrganization,
    updateOrganization,
  },
} = routes;
const OrganizationServise = {
  GetAllOrganization: async (
    query: AllOrganizationQuery,
  ): Promise<GetAllOrganizationResponse> => {
    try {
      const response = await axiosInstance.get<GetAllOrganizationResponse>(
        baseUrl + getAllOrganization(query),
      );
      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetProfile function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);

        throw new Error(
          error.response?.data?.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },
  GetOrganizationByID: async (
    id: number,
  ): Promise<GetAllOrganizationResponse> => {
    try {
      const response = await axiosInstance.get<GetAllOrganizationResponse>(
        baseUrl + getOrganizationByID(id),
      );
      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetProfile function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);

        throw new Error(
          error.response?.data?.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },
  GetOrganizationBySKU: async (): Promise<GetAllOrganizationResponse> => {
    try {
      const headers: Record<string, string> = {};
      // 'Referer-key' only in development mode
      // if (process.env.NODE_ENV === 'development') {
      //   headers['Referer-key'] = 'https://test1.varzeshsoft.com/';
      // }
      const response = await axiosInstance.get<GetAllOrganizationResponse>(
        baseUrl + getOrganizationBySKU(),
        {headers},
      );
      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetProfile function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);

        throw new Error(
          error.response?.data?.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },

  CreateOrganization: async (
    body: CreateOrganizationBody,
  ): Promise<GetAllOrganizationResponse> => {
    try {
      const response = await axiosInstance.post<
        CreateOrganizationBody,
        AxiosResponse<GetAllOrganizationResponse>
      >(baseUrl + createOrganization(), body);
      if (response.status === Status.Ok || response.status === Status.Created) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in CreateOrganization function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);
        throw new Error(
          error.response?.data?.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },
  UpdateOrganization: async (
    id: number,
    body: UpdateOrganizationBody,
  ): Promise<any> => {
    try {
      const response = await axiosInstance.put<
        UpdateOrganizationBody,
        AxiosResponse<any>
      >(baseUrl + updateOrganization(id), body);
      if (response.status === Status.Ok || response.status === Status.Created) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in UpdateOrganization function:', error);
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

export default OrganizationServise;
