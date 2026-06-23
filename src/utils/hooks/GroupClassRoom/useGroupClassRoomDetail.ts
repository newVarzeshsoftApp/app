import {useMemo} from 'react';
import {useGetGroupClassRooms} from './useGetGroupClassRooms';
import {
  findGroupClassRoomItem,
  groupClassRoomDetailParamsToQuery,
  normalizeGroupClassRoomResponse,
} from '../../helpers/groupClassRoomHelpers';
import {GroupClassRoomDetailParams} from '../../types/NavigationTypes';

export const useGroupClassRoomDetail = (params: GroupClassRoomDetailParams) => {
  const query = useMemo(
    () => groupClassRoomDetailParamsToQuery(params),
    [params],
  );

  const {data, isLoading, isFetching, isError, refetch} =
    useGetGroupClassRooms(query);

  const classRoom = useMemo(() => {
    const items = normalizeGroupClassRoomResponse(data);
    return findGroupClassRoomItem(
      items,
      params.groupClassRoomId,
      params.contractorId,
    );
  }, [data, params.contractorId, params.groupClassRoomId]);

  return {
    classRoom,
    isLoading: isLoading || isFetching,
    isError,
    refetch,
  };
};
