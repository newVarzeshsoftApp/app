import React, {useRef, useMemo} from 'react';
import {View, TouchableOpacity} from 'react-native';
import {
  CartItem,
  ReservationSecondaryService,
} from '../../../utils/helpers/CartStorage';
import {useTranslation} from 'react-i18next';
import {Trash, CloseCircle} from 'iconsax-react-native';
import BaseButton from '../../Button/BaseButton';
import BaseText from '../../BaseText';
import {ConvertDuration, formatNumber} from '../../../utils/helpers/helpers';
import BottomSheet, {BottomSheetMethods} from '../../BottomSheet/BottomSheet';
import ContractorInfo from '../../ContractorInfo/ContractorInfo';
import {useCartContext} from '../../../utils/CartContext';
import usePriceCalculations from '../../../utils/hooks/usePriceCalculations';
import ResponsiveImage from '../../ResponsiveImage';
import {UseGetProductByID} from '../../../utils/hooks/Product/UseGetProductByID';
import moment from 'jalali-moment';
type CartServiceCardProps = {
  data: CartItem;
};
const CartServiceCard: React.FC<CartServiceCardProps> = ({data}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Cart'});
  const {
    product,
    quantity,
    CartId,
    SelectedContractor,
    SelectedPriceList,
    isReserve,
    reservationData,
  } = data;
  const {updateItemQuantity, removeFromCart, updateReservationItemData} =
    useCartContext();
  const RemoveItemRef = useRef<BottomSheetMethods>(null);

  // For reservation items, calculate price differently
  const isReservationItem = isReserve && reservationData;

  // Calculate totals for reservation vs regular items
  const reservationTotals = useMemo(() => {
    if (!isReservationItem || !reservationData) {
      return {total: 0, tax: 0, subProductsTotal: 0};
    }

    const basePrice = product?.price || 0;
    const discount = product?.discount || 0;
    const tax = product?.tax || 0;
    const subProductsTotal =
      reservationData.secondaryServices?.reduce(
        (sum, service) => sum + (service.price || 0) * (service.quantity || 1),
        0,
      ) || 0;

    const total = basePrice - discount + tax + subProductsTotal;

    return {
      total,
      tax,
      subProductsTotal,
      basePrice,
      discount,
    };
  }, [isReservationItem, reservationData, product]);

  const regularTotals = usePriceCalculations({
    data: product,
    SelectedPriceList,
  });

  // Use reservation totals if it's a reservation item, otherwise use regular totals
  const {Discount, PricePreSession, Tax, Total, purchaseProfit, shopGift} =
    isReservationItem
      ? {
          Discount: reservationTotals.discount,
          PricePreSession: reservationTotals.basePrice,
          Tax: reservationTotals.tax,
          Total: reservationTotals.total - reservationTotals.tax,
          purchaseProfit: 0,
          shopGift: 0,
        }
      : regularTotals;

  // Get duration from reservationPattern for reservation items
  const getReservationDuration = (): string => {
    if (!isReservationItem) return '';

    const pattern = product?.reservationPattern;
    if (pattern?.reservationTag?.duration && pattern?.reservationTag?.unit) {
      const duration = pattern.reservationTag.duration;
      const unit = pattern.reservationTag.unit;

      // نمایش دقیقاً همان unit که در reservationTag هست
      if (unit === 'MINUTE') {
        return `${duration} دقیقه`;
      } else if (unit === 'HOUR') {
        return `${duration} ساعت`;
      }
      // اگر unit دیگری بود، همان را نمایش بده
      return `${duration} ${unit}`;
    }
    return '۱ ساعت';
  };

  // Get sub-product details for reservation items
  const subProductDetails = useMemo(() => {
    if (!isReservationItem || !reservationData?.secondaryServices) {
      return [];
    }

    return reservationData.secondaryServices.map(service => ({
      ...service,
      // We'll fetch product details if needed, but for now use the data we have
    }));
  }, [isReservationItem, reservationData]);

  // Update sub-product quantity in reservation
  const updateSubProductQuantity = (productId: number, delta: number) => {
    if (!isReservationItem || !reservationData || !CartId) return;

    const currentServices = reservationData.secondaryServices || [];
    const serviceIndex = currentServices.findIndex(
      s => s.product === productId,
    );

    let updatedServices: ReservationSecondaryService[];

    if (serviceIndex === -1) {
      // Service not found, can't add new ones from cart
      return;
    }

    const currentService = currentServices[serviceIndex];
    const currentQuantity = currentService.quantity || 1;
    const newQuantity = Math.max(0, currentQuantity + delta);

    if (newQuantity === 0) {
      // Remove service if quantity becomes 0
      updatedServices = currentServices.filter(
        (_, index) => index !== serviceIndex,
      );
    } else {
      // Update quantity
      updatedServices = [...currentServices];
      updatedServices[serviceIndex] = {
        ...currentService,
        quantity: newQuantity,
      };
    }

    updateReservationItemData({
      cartId: CartId,
      reservationData: {
        ...reservationData,
        secondaryServices: updatedServices,
      },
    });
  };
  return (
    <>
      <BottomSheet
        Title={t('Confirm removal')}
        ref={RemoveItemRef}
        snapPoints={[50, 80]}
        buttonText="لغو"
        onButtonPress={() => RemoveItemRef.current?.close()}
        deleteButtonText="حذف"
        onDeleteButtonPress={() => {
          CartId && removeFromCart(CartId);
          RemoveItemRef.current?.close();
        }}
      />
      <View className="CardBase gap-3">
        <View className="w-full h-[185px] bg-neutral-0 dark:bg-neutral-dark-0 rounded-3xl  relative overflow-hidden">
          {product?.image?.name && (
            <ResponsiveImage
              customSource={{default: product?.image?.name}}
              ImageType="Media"
              resizeMode="cover"
              style={{width: '100%', height: 200}}
            />
          )}
        </View>
        <View className="flex-row items-center justify-between">
          <BaseText type="subtitle2" color="base">
            {product?.title}
          </BaseText>
          <BaseButton
            noText
            onPress={() => RemoveItemRef.current?.expand()}
            type="Tonal"
            color="Black"
            LeftIcon={Trash}
            redbutton
          />
        </View>
        {SelectedContractor && (
          <View>
            <ContractorInfo
              firstName={SelectedContractor?.contractor?.firstName}
              lastName={SelectedContractor?.contractor?.lastName}
              imageName={SelectedContractor?.contractor?.profile?.name}
              gender={SelectedContractor?.contractor?.gender}
            />
          </View>
        )}
        <View className="flex-row items-center justify-between gap-2 border-b border-neutral-0 dark:border-neutral-dark-400/50 pb-4">
          <View className="flex-row items-center gap-4 ">
            <BaseButton
              onPress={() =>
                CartId &&
                updateItemQuantity({cartId: CartId, quantity: quantity + 1})
              }
              type="Tonal"
              color="Black"
              text="+"
            />
            <BaseText type="subtitle2" color="base">
              {quantity}
            </BaseText>
            <BaseButton
              type="Tonal"
              color="Black"
              text="-"
              onPress={() =>
                CartId &&
                updateItemQuantity({
                  cartId: CartId,
                  quantity: quantity === 1 ? quantity : quantity - 1,
                })
              }
            />
          </View>
          <BaseText type="subtitle2" color="base">
            {formatNumber(
              isReservationItem ? reservationTotals.total : Total + (Tax || 0),
            )}{' '}
            ﷼
          </BaseText>
        </View>
        <View className="gap-4">
          <BaseText type="subtitle2" color="secondaryPurple">
            {t('order Detail')}
          </BaseText>
          <View className="flex-row items-center justify-between">
            <BaseText type="subtitle3" color="secondary">
              {t('Number of sessions')} :
            </BaseText>
            <BaseText type="subtitle3" color="base">
              {isReservationItem
                ? '۱ جلسه'
                : data?.product?.unlimited
                ? t('unlimited')
                : `${SelectedPriceList?.min || 1} جلسه`}
            </BaseText>
          </View>
          <View className="flex-row items-center justify-between">
            <BaseText type="subtitle3" color="secondary">
              {t('Duration')} :
            </BaseText>
            <BaseText type="subtitle3" color="base">
              {isReservationItem
                ? getReservationDuration()
                : ConvertDuration(SelectedPriceList?.duration ?? 1)}
            </BaseText>
          </View>
          <View className="flex-row items-center justify-between">
            <BaseText type="subtitle3" color="secondary">
              {t('SingleservicePrice')} :
            </BaseText>
            <BaseText type="subtitle3" color="base">
              {formatNumber(PricePreSession)} ﷼
            </BaseText>
          </View>
          {Tax > 0 && (
            <View className="flex-row items-center justify-between">
              <BaseText type="subtitle3" color="secondary">
                {t('tax')} :
              </BaseText>
              <BaseText type="subtitle3" color="base">
                {formatNumber(Tax)} ﷼
              </BaseText>
            </View>
          )}
          {product?.isCashBack && (
            <View className="flex-row items-center justify-between">
              <BaseText type="subtitle3" color="supportive2">
                {t('shopGift')} :
              </BaseText>
              <BaseText type="subtitle3" color="supportive2">
                {formatNumber(shopGift)} ﷼
              </BaseText>
            </View>
          )}
          {purchaseProfit > 0 && (
            <View className="flex-row items-center justify-between">
              <BaseText type="subtitle3" color="secondary">
                {t('Purchase profit')} :
              </BaseText>
              <BaseText type="subtitle3" color="success">
                {formatNumber(purchaseProfit ?? 0)} ﷼
              </BaseText>
            </View>
          )}

          {/* Reservation-specific details */}
          {isReservationItem && reservationData && (
            <>
              <View className="flex-row items-center justify-between">
                <BaseText type="subtitle3" color="secondary">
                  تاریخ رزرو:
                </BaseText>
                <BaseText type="subtitle3" color="base">
                  {moment(reservationData.reservedDate, 'YYYY-MM-DD HH:mm')
                    .locale('fa')
                    .format('jYYYY/jMM/jDD')}
                </BaseText>
              </View>
              <View className="flex-row items-center justify-between">
                <BaseText type="subtitle3" color="secondary">
                  زمان:
                </BaseText>
                <BaseText type="subtitle3" color="base">
                  {reservationData.reservedStartTime} -{' '}
                  {reservationData.reservedEndTime}
                </BaseText>
              </View>
            </>
          )}

          {/* Sub-products for reservation items */}
          {isReservationItem &&
            subProductDetails &&
            subProductDetails.length > 0 && (
              <View className="mt-2">
                <BaseText type="subtitle3" color="secondary" className="mb-2">
                  خدمات اضافی:
                </BaseText>
                <View className="gap-2">
                  {subProductDetails.map((service, index) => {
                    // Fetch product details for each sub-product
                    const SubProductCard = ({
                      service,
                    }: {
                      service: ReservationSecondaryService;
                    }) => {
                      const {data: subProductData} = UseGetProductByID(
                        service.product,
                      );

                      return (
                        <View
                          key={`${service.product}-${index}`}
                          className="BaseServiceCard p-3 gap-2">
                          <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                              <BaseText type="subtitle3" color="base">
                                {subProductData?.title ||
                                  `خدمت ${service.product}`}
                              </BaseText>
                              <BaseText type="caption" color="secondary">
                                {formatNumber(
                                  (service.price || 0) *
                                    (service.quantity || 1),
                                )}{' '}
                                ﷼
                              </BaseText>
                            </View>
                            <View className="flex-row items-center gap-2">
                              <TouchableOpacity
                                onPress={() =>
                                  updateSubProductQuantity(service.product, -1)
                                }
                                className="w-8 h-8 rounded-xl bg-[#E4E4E8] items-center justify-center">
                                <BaseText type="body2" color="base">
                                  -
                                </BaseText>
                              </TouchableOpacity>
                              <BaseText
                                type="body2"
                                color="base"
                                className="w-6 text-center">
                                {service.quantity || 1}
                              </BaseText>
                              <TouchableOpacity
                                onPress={() =>
                                  updateSubProductQuantity(service.product, 1)
                                }
                                className="w-8 h-8 rounded-xl bg-[#E4E4E8] items-center justify-center">
                                <BaseText type="body2" color="base">
                                  +
                                </BaseText>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      );
                    };

                    return <SubProductCard key={index} service={service} />;
                  })}
                </View>
              </View>
            )}
        </View>
      </View>
    </>
  );
};

export default CartServiceCard;
