import axios, {AxiosResponse} from 'axios';
import {Status} from '../models/enums';
import {routes} from '../routes/routes';
import axiosInstance from '../utils/AxiosInstans';
import {ContractorResponse} from './models/response/ContractorResService';
import {handleMutationError} from '../utils/helpers/errorHandler';

const {baseUrl, contractor} = routes;

const ContractorService = {
  GetAll: async (): Promise<ContractorResponse> => {
    try {
      const response = await axiosInstance.get<ContractorResponse>(
        baseUrl + contractor.getAll(),
      );
      if (response.status === Status.Ok) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in GetAllContractors function:', error);
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

export default ContractorService;

