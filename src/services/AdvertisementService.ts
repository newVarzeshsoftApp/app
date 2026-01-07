import axios, {AxiosResponse} from 'axios';
import {Status} from '../models/enums';
import {routes} from '../routes/routes';
import axiosInstance from '../utils/AxiosInstans';
import {AdvertisementQuery} from './models/requestQueries';
import {handleMutationError} from '../utils/helpers/errorHandler';
import {BannerListResponse} from './models/response/AdsResService';
import {CreateAdvertisementBody} from './models/request/AdvertisementReqService';

const {
  baseUrl,
  advertisement: {getAdvertisement, createAdvertisement},
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
          error.response?.data?.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },
  CreateAdvertisement: async (body: CreateAdvertisementBody): Promise<any> => {
    try {
      const response = await axiosInstance.post<
        CreateAdvertisementBody,
        AxiosResponse<any>
      >(baseUrl + createAdvertisement(), body);
      if (response.status === Status.Ok || response.status === Status.Created) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in CreateAdvertisement function:', error);
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

export default AdvertisementService;
