import axios, {AxiosResponse} from 'axios';
import {Status} from '../models/enums';
import {routes} from '../routes/routes';
import axiosInstance from '../utils/AxiosInstans';
import {
  GroupClassRoomParticipantsQuery,
  GroupClassRoomPreReserveQuery,
  GroupClassRoomQuery,
} from './models/requestQueries';
import {
  GroupClassRoomParticipantsResponse,
  GroupClassRoomResponse,
  GroupClassRoomServicesResponse,
  OrganizationUnitResponse,
} from './models/response/GroupClassRoomResService';
import {AuthResponseSignUpDto} from './models/response/ReservationResService';
import {handleMutationError} from '../utils/helpers/errorHandler';

const {baseUrl, groupClassRoom} = routes;

const GroupClassRoomService = {
  GetAll: async (
    query?: GroupClassRoomQuery,
  ): Promise<GroupClassRoomResponse> => {
    try {
      const response = await axiosInstance.get<GroupClassRoomResponse>(
        baseUrl + groupClassRoom.getAll(query),
      );
      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetAllGroupClassRooms function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);
        throw new Error(
          error.response?.data?.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },

  GetServices: async (): Promise<GroupClassRoomServicesResponse> => {
    try {
      const response =
        await axiosInstance.get<GroupClassRoomServicesResponse>(
          baseUrl + groupClassRoom.getServices(),
        );
      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetGroupClassRoomServices function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);
        throw new Error(
          error.response?.data?.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },

  GetParticipants: async (
    id: number,
    query: GroupClassRoomParticipantsQuery,
  ): Promise<GroupClassRoomParticipantsResponse> => {
    try {
      const response =
        await axiosInstance.get<GroupClassRoomParticipantsResponse>(
          baseUrl + groupClassRoom.getParticipants(id, query),
        );
      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetGroupClassRoomParticipants function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);
        throw new Error(
          error.response?.data?.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },

  GetOrganizationUnit: async (): Promise<OrganizationUnitResponse> => {
    try {
      const response = await axiosInstance.get<OrganizationUnitResponse>(
        baseUrl + groupClassRoom.getOrganizationUnit(),
      );
      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetOrganizationUnit function:', error);
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
    body: GroupClassRoomPreReserveQuery,
  ): Promise<AuthResponseSignUpDto> => {
    try {
      const response = await axiosInstance.post<
        GroupClassRoomPreReserveQuery,
        AxiosResponse<AuthResponseSignUpDto>
      >(baseUrl + groupClassRoom.preReserve(), body);
      if (response.status === Status.Ok || response.status === Status.Created) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in PreReserveGroupClassRoom function:', error);
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

export default GroupClassRoomService;

