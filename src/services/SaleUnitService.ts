import axios, {AxiosResponse} from 'axios';
import {Status} from '../models/enums';
import {routes} from '../routes/routes';
import axiosInstance from '../utils/AxiosInstans';
import {SaleUnitResponse} from './models/response/SaleUnitResService';
import {handleMutationError} from '../utils/helpers/errorHandler';

const {baseUrl, saleUnit} = routes;

const SaleUnitService = {
  GetAll: async (): Promise<SaleUnitResponse> => {
    try {
      const response = await axiosInstance.get<SaleUnitResponse>(
        baseUrl + saleUnit.getAll(),
      );
      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetAllSaleUnits function:', error);
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

export default SaleUnitService;

