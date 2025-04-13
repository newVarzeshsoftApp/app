import {Buffer} from 'buffer';
import axiosInstance from '../AxiosInstans';

/**
 * Fetch binary image and convert to base64 string
 */
export const convertImageUrlToBase64 = async (url: string): Promise<string> => {
  const response = await axiosInstance.get(url, {
    responseType: 'arraybuffer',
  });

  const contentType = response.headers['content-type'] || 'image/png';
  const base64 = Buffer.from(response.data, 'binary').toString('base64');
  return `data:${contentType};base64,${base64}`;
};
