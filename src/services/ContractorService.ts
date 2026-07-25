import axios from 'axios';
import {Status} from '../models/enums';
import {routes} from '../routes/routes';
import axiosInstance from '../utils/AxiosInstans';
import {handleMutationError} from '../utils/helpers/errorHandler';
import {ContractorQuery} from './models/requestQueries';
import {ContractorResponse} from './models/response/ContractorResService';

const {baseUrl, contractor} = routes;

const ContractorService = {
  GetAll: async (query?: ContractorQuery): Promise<ContractorResponse> => {
    try {
      const response = await axiosInstance.get<ContractorResponse>(
        baseUrl + contractor.getAll(query),
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
