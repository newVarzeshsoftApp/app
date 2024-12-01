import axios from 'axios';
import {Status} from '../models/enums';
import {routes} from '../routes/routes';
import axiosInstance from '../utils/AxiosInstans';
import {
  GetUserCreditRes,
  GetUserDashboardRes,
  GetUserSaleItemRes,
} from './models/response/UseResrService';
import {UserSaleItemQuey} from './models/requestQueries';

const {
  baseUrl,
  user: {getUserCredit, getUserDashboard, getUserSaleItem},
} = routes;

const UserService = {
  GetUserCredit: async (): Promise<GetUserCreditRes> => {
    try {
      const response = await axiosInstance.get<GetUserCreditRes>(
        baseUrl + getUserCredit(),
      );

      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetUserCredit function:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },
  GetUserDashboard: async (): Promise<GetUserDashboardRes> => {
    try {
      const response = await axiosInstance.get<GetUserDashboardRes>(
        baseUrl + getUserDashboard(),
      );
      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetUserDashboard function:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },
  GetUserSaleItem: async (
    query: UserSaleItemQuey,
  ): Promise<GetUserSaleItemRes> => {
    try {
      const response = await axiosInstance.get<GetUserSaleItemRes>(
        baseUrl + getUserSaleItem(query),
      );
      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetUserDashboard function:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },
};
export default UserService;
