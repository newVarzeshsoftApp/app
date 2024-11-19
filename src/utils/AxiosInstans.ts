import axios from 'axios';
import {getTokens, removeTokens} from './helpers/tokenStorage';

const axiosInstance = axios.create({
  baseURL: process.env.BASE_URL,
  timeout: 10000,
});

axiosInstance.interceptors.request.use(async config => {
  const tokens = await getTokens();
  if (tokens.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      await removeTokens();
      throw error;
      //   const tokens = await getTokens();

      //   if (tokens.refreshToken) {
      //     try {
      //       // Attempt to refresh the access token
      //       const response = await axios.post('https://your-api-url.com/auth/refresh-token', {
      //         refreshToken: tokens.refreshToken,
      //       });

      //       const { accessToken, refreshToken } = response.data;

      //       // Store the new tokens
      //       await storeTokens(accessToken, refreshToken);

      //       // Retry the original request with the new access token
      //       originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      //       return api(originalRequest);
      //     } catch (refreshError) {
      //       console.error('Failed to refresh token:', refreshError);
      //       // Optionally, log out the user if refresh fails
      //       await removeTokens();
      //       throw refreshError;
      //     }
      //   } else {
      //     // No refresh token available, log out the user
      //     await removeTokens();
      //     throw error;
      //   }
    }

    throw error;
  },
);

export default axiosInstance;
