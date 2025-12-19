import {useMemo} from 'react';
import {CartItem} from '../helpers/CartStorage';

export const useCartTotals = (items: CartItem[]) => {
  return useMemo(() => {
    return items.reduce(
      (acc, item) => {
        let itemPrice = 0;
        let itemDiscount = 0;
        let itemTax = 0;
        let itemShopGift = 0;

        // Handle reservation items
        if (item.isReserve && item.reservationData) {
          const basePrice = item?.product?.price || 0;
          const discount = item?.product?.discount || 0;
          const tax = item?.product?.tax || 0;

          // Calculate sub-products total
          const subProductsTotal =
            item.reservationData.secondaryServices?.reduce(
              (sum, service) =>
                sum + (service.price || 0) * (service.quantity || 1),
              0,
            ) || 0;

          itemPrice = (basePrice - discount + subProductsTotal) * item.quantity;
          itemDiscount = discount * item.quantity;
          itemTax = tax * item.quantity || 0;
          itemShopGift = 0;
        } else if (item?.product?.type === 1 && item?.SelectedPriceList) {
          itemPrice = (item?.SelectedPriceList?.price ?? 0) * item?.quantity;
          const discountPercentage =
            item?.SelectedPriceList?.discountOnlineShopPercentage ?? 0;
          itemDiscount = (itemPrice * discountPercentage) / 100;
          itemTax =
            (((item?.SelectedPriceList?.price ?? 0) * item?.quantity -
              itemDiscount) *
              (item?.product?.tax ?? 0)) /
            100;
          const cashBackPercentage =
            item?.SelectedPriceList?.cashBackPercentage ?? 0;
          itemShopGift = (itemPrice * cashBackPercentage) / 100;
        } else {
          itemPrice = (item?.product?.price || 0) * item?.quantity;
          itemTax =
            (((item?.product?.tax ?? 0) * item?.quantity - itemDiscount) *
              (item?.product?.tax ?? 0)) /
            100;
          itemDiscount = (item?.product?.discount ?? 0) * item?.quantity;
          itemShopGift = item?.product?.isCashBack ? itemPrice * 0.05 : 0;
        }

        return {
          totalAmount: acc.totalAmount + itemPrice,
          totalTax: acc.totalTax + itemTax,
          totalDiscount: acc.totalDiscount + itemDiscount,
          totalShopGift: acc.totalShopGift + itemShopGift,
        };
      },
      {
        totalAmount: 0,
        totalTax: 0,
        totalDiscount: 0,
        totalShopGift: 0,
      },
    );
  }, [items]);
};
