import {useMutation, UseMutationResult} from '@tanstack/react-query';
import ConfigService from '../../../services/ConfigService';

export const useCreateConfig = (): UseMutationResult<any, Error, any> => {
  return useMutation({
    mutationFn: (body: any) => ConfigService.CreateConfig(body),
  });
};

