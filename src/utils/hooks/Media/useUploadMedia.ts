import {useMutation, UseMutationResult} from '@tanstack/react-query';
import {MediaService} from '../../../services/MediaService';
import {MediaDto} from '../../../services/models/response/MediaResService';

export const useUploadMedia = (): UseMutationResult<
  MediaDto,
  Error,
  FormData
> => {
  return useMutation({
    mutationFn: (body: FormData) => MediaService.UploadMedia(body),
  });
};

