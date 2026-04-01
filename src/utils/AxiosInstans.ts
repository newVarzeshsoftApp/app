import axios from 'axios';
import { getTokens, removeTokens, storeTokens } from './helpers/tokenStorage';
import { SignInResponse } from '../services/models/response/AuthResService';
import AuthService from '../services/AuthService';
import { navigate } from '../navigation/navigationRef';
import { Platform } from 'react-native';

const axiosInstance = axios.create({
  baseURL: process.env.BASE_URL,
  // timeout: 10000,
});

console.log('BASE_URL:', process.env.BASE_URL);

axiosInstance.interceptors.request.use(async config => {
  const tokens = await getTokens();

  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens?.accessToken}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  response => {
    console.log('Axios Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  async error => {
    const originalRequest = error?.config;

    // Log detailed error information
    if (error?.response) {
      console.error('Axios Error Response:', {
        status: error?.response?.status,
        data: error?.response?.data,
        headers: error?.response?.headers,
      });
    } else if (error?.request) {
      console.error('Axios Error Request:', error?.request);
    } else {
      console.error('Axios Error Message:', error?.message);
    }
    if (originalRequest?.url?.includes('auth/refresh')) {
      await removeTokens();
      navigate('Auth');
      if (Platform.OS === 'web') {
        window?.location?.reload();
      }
      throw error;
    }
    if (error?.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      console.warn('Unauthorized (401), attempting to refresh tokens...');

      try {
        const refreshedTokens: SignInResponse = await AuthService.Refresh();
        await storeTokens(
          refreshedTokens?.accessToken,
          refreshedTokens?.refreshToken,
        );

        originalRequest.headers.Authorization = `Bearer ${refreshedTokens?.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.warn('Token refresh failed, removing tokens...');
        await removeTokens();
        navigate('Auth');
        if (Platform.OS === 'web') {
          window?.location?.reload();
        }
        throw refreshError;
      }
    }
    throw error;
  },
);

export default axiosInstance;
