import axios, {AxiosResponse} from 'axios';
import {Status} from '../models/enums';
import {routes} from '../routes/routes';
import axiosInstance from '../utils/AxiosInstans';
import {ProductQuery} from './models/requestQueries';
import {Product, ProductPageRes} from './models/response/ProductResService';

import {handleMutationError} from '../utils/helpers/errorHandler';

const {
  baseUrl,
  product: {getProductPage, getProductQuery, getProductByID},
} = routes;

export const ProductService = {
  GetProductPage: async (query: ProductQuery): Promise<ProductPageRes[]> => {
    try {
      const response = await axiosInstance.get<ProductPageRes[]>(
        baseUrl + getProductPage(query),
      );
      if (response.status === Status.Ok || response.status === Status.Created) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response}`);
      }
    } catch (error) {
      console.error('Error in GetProductPage function:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response?.data?.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },
  GetProductByID: async (id: number): Promise<Product> => {
    try {
      const response = await axiosInstance.get<Product>(
        baseUrl + getProductByID(id),
      );
      if (response.status === Status.Ok || response.status === Status.Created) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response}`);
      }
    } catch (error) {
      console.error('Error in GetProductPage function:', error);
      if (axios.isAxiosError(error) && error.response) {
        handleMutationError(error);
        throw new Error(
          error.response?.data?.message || 'Unknown error occurred',
        );
      }
      throw error;
    }
  },
  GetProductQuery: async (): Promise<any> => {
    try {
      const response = await axiosInstance.get<AxiosResponse<any>>(
        baseUrl + getProductQuery(),
      );
      if (response.status === Status.Ok || response.status === Status.Created) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response}`);
      }
    } catch (error) {
      console.error('Error in GetProductQuery function:', error);
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
