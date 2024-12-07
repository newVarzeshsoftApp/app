import {useQuery, UseQueryResult} from '@tanstack/react-query';
import UserService from '../../../services/UserService';
import {
  SessionDetail,
  SessionDetails,
} from '../../../services/models/response/UseResrService';

export const useGetUserSessionByID = (
  id: number,
): UseQueryResult<SessionDetails, Error> => {
  return useQuery({
    queryKey: ['UserSession', id],
    queryFn: () => UserService.GetUserSessionByID(id),
    enabled: !!id,
  });
};
