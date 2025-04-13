import axios from 'axios';
import {Status} from '../models/enums';
import {routes} from '../routes/routes';
import axiosInstance from '../utils/AxiosInstans';
import {handleMutationError} from '../utils/helpers/errorHandler';
import {IMAGE_TYPE} from '../models/props';

const {
  baseUrl,
  media: {getAppMedia, getMedia},
} = routes;

export const MediaService = {
  GetImageBase64: async (name: string, type: IMAGE_TYPE): Promise<string> => {
    const url = baseUrl + (type === 'App' ? getAppMedia(name) : getMedia(name));
    const response = await axiosInstance.get(url, {
      responseType: 'arraybuffer',
    });

    const contentType = response.headers['content-type'] || 'image/png';
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    console.log(
      '⚠️ base64:',
      `data:${contentType};base64,${base64.substring(0, 100)}`,
    );
    return `data:${contentType};base64,${base64}`;
  },
  GetImageUrl: (name: string, type: IMAGE_TYPE): string => {
    return baseUrl + (type === 'App' ? getAppMedia(name) : getMedia(name));
  },
};
