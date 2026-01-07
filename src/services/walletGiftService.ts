import axiosInstance from '../utils/AxiosInstans';
import {routes} from '../routes/routes';
import {handleMutationError} from '../utils/helpers/errorHandler';
import {Status} from '../models/enums';
import axios from 'axios';
import {AdvertisementQuery} from './models/requestQueries';
import {GetWalletGiftResponse} from './models/response/WalletGiftResServise';

const {
  baseUrl,
  walletGift: {getWalletGift},
} = routes;

const WalletGiftService = {
  GetAllWalletGift: async (
    query: AdvertisementQuery,
  ): Promise<GetWalletGiftResponse> => {
    try {
      const response = await axiosInstance.get<GetWalletGiftResponse>(
        baseUrl + getWalletGift(query),
      );
      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetWalletGift function:', error);
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

export default WalletGiftService;
