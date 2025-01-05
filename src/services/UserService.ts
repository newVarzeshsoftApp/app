import axios from 'axios';
import {Status} from '../models/enums';
import {routes} from '../routes/routes';
import axiosInstance from '../utils/AxiosInstans';
import {
  ChargingServiceByIDRes,
  Content,
  GetUserCreditRes,
  GetUserDashboardRes,
  GetUserSaleItemRes,
  GetUserSaleOrderRes,
  Payments,
  SaleOrderByIDRes,
  SessionDetail,
  SessionDetails,
  Transaction,
  TransactionResponse,
} from './models/response/UseResrService';
import {
  UserPaymentQuey,
  UserSaleItemQuey,
  UserTransactionQuery,
  UserWalletTransactionQuery,
} from './models/requestQueries';
import {handleMutationError} from '../utils/helpers/errorHandler';

const {
  baseUrl,
  user: {
    getUserCredit,
    getUserDashboard,
    getUserSaleItem,
    getSaleItemByID,
    getUserChargingServiceByID,
    getUserSessionByID,
    getUserSaleOrder,
    getUserSaleOrderByID,
    getUserTransaction,
    getUserWalletTransaction,
    getUserTransactionById,
    getUserPayment,
  },
} = routes;

const UserService = {
  GetUserPayment: async (query: UserPaymentQuey): Promise<Payments> => {
    try {
      const response = await axiosInstance.get<Payments>(
        baseUrl + getUserPayment(query),
      );
      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetUserCredit function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);

        throw new Error(
          error.response.data.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },
  GetUserTransactionById: async (id: number): Promise<Transaction> => {
    try {
      const response = await axiosInstance.get<Transaction>(
        baseUrl + getUserTransactionById(id),
      );

      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetUserCredit function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);

        throw new Error(
          error.response.data.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },
  GetUserWalletTransaction: async (
    query: UserWalletTransactionQuery,
  ): Promise<TransactionResponse> => {
    try {
      const response = await axiosInstance.get<TransactionResponse>(
        baseUrl + getUserWalletTransaction(query),
      );

      if (response.status === Status.Ok || response.status === Status.Created) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetUserSaleOrder function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);

        throw new Error(
          error.response.data.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },
  GetUserTransaction: async (
    query: UserTransactionQuery,
  ): Promise<TransactionResponse> => {
    try {
      const response = await axiosInstance.get<TransactionResponse>(
        baseUrl + getUserTransaction(query),
      );

      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetUserSaleOrder function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);

        throw new Error(
          error.response.data.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },
  GetUserSaleOrder: async (
    query: UserSaleItemQuey,
  ): Promise<GetUserSaleOrderRes> => {
    try {
      const response = await axiosInstance.get<GetUserSaleOrderRes>(
        baseUrl + getUserSaleOrder(query),
      );

      if (response.status === Status.Ok || response.status === Status.Created) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetUserSaleOrder function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);

        throw new Error(
          error.response.data.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },
  GetUserSaleOrderByID: async (id: number): Promise<SaleOrderByIDRes> => {
    try {
      const response = await axiosInstance.get<SaleOrderByIDRes>(
        baseUrl + getUserSaleOrderByID(id),
      );

      if (response.status === Status.Ok || response.status === Status.Created) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetUserSaleOrderByID function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);

        throw new Error(
          error.response.data.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },
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
        handleMutationError(error);

        throw new Error(
          error.response.data.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },
  GetUserSessionByID: async (id: number): Promise<SessionDetails> => {
    try {
      const response = await axiosInstance.get<SessionDetails>(
        baseUrl + getUserSessionByID(id),
      );

      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetUserCredit function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);

        throw new Error(
          error.response.data.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },
  GetUserChargingServiceByID: async (
    id: number,
  ): Promise<ChargingServiceByIDRes[]> => {
    try {
      const response = await axiosInstance.get<ChargingServiceByIDRes[]>(
        baseUrl + getUserChargingServiceByID(id),
      );

      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetUserCredit function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);

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
        handleMutationError(error);

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
        handleMutationError(error);

        throw new Error(
          error.response.data.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },
  GetSaleItemByID: async (id: number): Promise<Content> => {
    try {
      const response = await axiosInstance.get<Content>(
        baseUrl + getSaleItemByID(id),
      );
      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetSaleItemByID function:', error);
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
export default UserService;
