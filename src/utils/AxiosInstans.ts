import axios from 'axios';
import {getTokens, removeTokens} from './helpers/tokenStorage';

const axiosInstance = axios.create({
  baseURL: process.env.BASE_URL,
  // timeout: 10000,
});

axiosInstance.interceptors.request.use(async config => {
  const tokens = await getTokens();
  console.log('====================================');
  console.log(tokens.accessToken);
  console.log('====================================');
  if (tokens.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  response => {
    // Log successful responses
    console.log('Axios Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  async error => {
    const originalRequest = error.config;

    // Log detailed error information
    if (error.response) {
      console.error('Axios Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      console.error('Axios Error Request:', error.request);
    } else {
      console.error('Axios Error Message:', error.message);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.warn('Unauthorized (401), removing tokens...');
      await removeTokens();
      throw error;
    }

    throw error;
  },
);

export default axiosInstance;
