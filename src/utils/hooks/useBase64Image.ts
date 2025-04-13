import {useQuery} from '@tanstack/react-query';
import {MediaService} from '../../services/MediaService';
import {IMAGE_TYPE} from '../../models/props';
import {convertImageUrlToBase64} from '../helpers/convertToBase64';

/**
 * Smart hook that handles converting image name + type to full base64 image
 */
export const useBase64ImageFromMedia = (
  imageName?: string,
  type?: IMAGE_TYPE,
) => {
  return useQuery({
    queryKey: ['base64-image', imageName, type],
    queryFn: async () => {
      if (!imageName || !type) throw new Error('Image name or type is missing');

      const url = MediaService.GetImageUrl(imageName, type);
      return await convertImageUrlToBase64(url);
    },
    enabled: !!imageName && !!type,
    staleTime: 1000 * 60 * 60,
  });
};
