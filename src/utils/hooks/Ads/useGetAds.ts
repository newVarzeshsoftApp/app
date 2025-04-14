import {useQuery, UseQueryResult} from '@tanstack/react-query';
import {AdvertisementQuery} from '../../../services/models/requestQueries';
import {BannerListResponse} from '../../../services/models/response/AdsResService';
import AdvertisementService from '../../../services/AdvertisementService';

export const useGetAds = (
  query: AdvertisementQuery,
): UseQueryResult<BannerListResponse, Error> => {
  return useQuery({
    queryKey: ['GetAds', query],
    queryFn: () => AdvertisementService.GetAllOrganization(query),
  });
};
