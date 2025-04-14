import axios from 'axios';
import {Status} from '../models/enums';
import {routes} from '../routes/routes';
import axiosInstance from '../utils/AxiosInstans';
import {AdvertisementQuery} from './models/requestQueries';
import {handleMutationError} from '../utils/helpers/errorHandler';
import {BannerListResponse} from './models/response/AdsResService';

const {
  baseUrl,
  advertisement: {getAdvertisement},
} = routes;
const AdvertisementService = {
  GetAllOrganization: async (
    query: AdvertisementQuery,
  ): Promise<BannerListResponse> => {
    try {
      const response = await axiosInstance.get<BannerListResponse>(
        baseUrl + getAdvertisement(query),
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
          error.response.data.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },
};

export default AdvertisementService;
