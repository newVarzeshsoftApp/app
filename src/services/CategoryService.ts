import {Status} from '../models/enums';
import {routes} from '../routes/routes';
import axiosInstance from '../utils/AxiosInstans';
import axios from 'axios';
import {CategoryQuery} from './models/requestQueries';
import {
  CategoryPageRes,
  CategoryQueryRes,
} from './models/response/CategoryResService';
import {handleMutationError} from '../utils/helpers/errorHandler';

const {
  baseUrl,
  category: {categoryPage, categoryQuery},
} = routes;

export const CategoryService = {
  GetCategoryPage: async (query: CategoryQuery): Promise<CategoryPageRes> => {
    try {
      const response = await axiosInstance.get<CategoryPageRes>(
        baseUrl + categoryPage(query),
      );
      if (response.status === Status.Ok || response.status === Status.Created) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response}`);
      }
    } catch (error) {
      console.error('Error in GetCategoryPage function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);

        throw new Error(
          error.response.data.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },
  GetCategoryQuery: async (query: CategoryQuery): Promise<CategoryQueryRes> => {
    try {
      const response = await axiosInstance.get<CategoryQueryRes>(
        baseUrl + categoryQuery(query),
      );
      if (response.status === Status.Ok || response.status === Status.Created) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response}`);
      }
    } catch (error) {
      console.error('Error in GetCategoryQuery function:', error);
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
