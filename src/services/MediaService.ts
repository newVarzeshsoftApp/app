import axios, {AxiosResponse} from 'axios';
import {Status} from '../models/enums';
import {routes} from '../routes/routes';
import axiosInstance from '../utils/AxiosInstans';
import {handleMutationError} from '../utils/helpers/errorHandler';
import {IMAGE_TYPE} from '../models/props';
import {UploadMediaBody} from './models/request/MediaReqService';
import {MediaDto} from './models/response/MediaResService';

const {
  baseUrl,
  media: {getAppMedia, getMedia, uploadMedia},
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
  UploadMedia: async (body: FormData): Promise<MediaDto> => {
    try {
      const response = await axiosInstance.post<
        FormData,
        AxiosResponse<MediaDto>
      >(baseUrl + uploadMedia(), body, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.status === Status.Ok || response.status === Status.Created) {
        return response.data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error in UploadMedia function:', error);
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
