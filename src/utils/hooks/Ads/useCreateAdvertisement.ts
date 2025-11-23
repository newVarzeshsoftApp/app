import {useMutation, UseMutationResult} from '@tanstack/react-query';
import AdvertisementService from '../../../services/AdvertisementService';
import {CreateAdvertisementBody} from '../../../services/models/request/AdvertisementReqService';

export const useCreateAdvertisement = (): UseMutationResult<
  any,
  Error,
  CreateAdvertisementBody
> => {
  return useMutation({
    mutationFn: (body: CreateAdvertisementBody) =>
      AdvertisementService.CreateAdvertisement(body),
  });
};

