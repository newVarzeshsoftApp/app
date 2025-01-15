import {useMemo} from 'react';
import {
  PriceList,
  Product,
} from '../../services/models/response/ProductResService';

export default function usePriceCalculations({
  SelectedPriceList,
  data,
}: {
  SelectedPriceList?: PriceList | null;
  data?: Product | undefined;
}) {
  const taxPercentage = data?.tax ?? 0; // درصد مالیات
  const price = SelectedPriceList?.price ?? 0; // قیمت اصلی
  const discount = SelectedPriceList?.discountOnlineShopPercentage ?? 0; // درصد تخفیف
  const quantity = SelectedPriceList?.min ?? 0; // تعداد
  const cashBackPercentage = SelectedPriceList?.cashBackPercentage ?? 0; //درصد هدیه فروشگاه
  //  محاسبه مالیات
  const Tax = useMemo(() => {
    const discountedPrice = price - (price * discount) / 100; // قیمت بعد از تخفیف
    return (discountedPrice * taxPercentage) / 100; //  مالیات
  }, [price, discount, taxPercentage]);

  //  محاسبه میزان تخفیف
  const Discount = useMemo(() => {
    return (price * discount) / 100;
  }, [discount]);

  //  قیمت هر جلسه
  const PricePreSession = useMemo(() => {
    return quantity > 0 ? Math.floor(price / quantity) : price;
  }, [price, quantity]);

  // قیمت کل پس از تخفیف
  const Total = useMemo(() => {
    return price - (price * discount) / 100;
  }, [price, discount]);

  //  سود خرید
  const purchaseProfit = useMemo(() => {
    return ((data?.price ?? 0) - (data?.discount ?? 0)) * quantity - Total;
  }, [price, data?.price, data?.discount, quantity, Total]);

  // هدیه خرید
  const shopGift = useMemo(() => {
    return (price * cashBackPercentage) / 100;
  }, [price]);

  return {Tax, Discount, PricePreSession, Total, purchaseProfit, shopGift};
}
