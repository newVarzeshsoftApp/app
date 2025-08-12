import {useQuery} from '@tanstack/react-query';
import WalletGiftService from '../../../services/walletGiftService';
import {AdvertisementQuery} from '../../../services/models/requestQueries';

export const useGetAllWalletGift = (query: AdvertisementQuery) => {
  return useQuery({
    queryKey: ['walletGift', query],
    queryFn: () => WalletGiftService.GetAllWalletGift(query),
  });
};
