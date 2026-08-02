import {CART_DEFAULT_TTL_SECONDS} from '../../constants/cart';
import {CartItem} from './CartStorage';

export function isTimedCartItem(item: CartItem): boolean {
  const isReservation = !!item.isReserve && !!item.reservationData;
  // Align with cart card detection so UI countdown and CartScreen removal never diverge
  const isGroupClass =
    !!item.isGroupClassRoom || !!item.groupClassRoomData?.groupClassRoomId;

  return isReservation || isGroupClass;
}

/** Start of the expiry clock for a cart item (ISO fallbacks applied by caller if null). */
export function getCartItemExpiryStartIso(item: CartItem): string | null {
  if (item.addedToCartAt) {
    return item.addedToCartAt;
  }
  if (item.submitAt) {
    return item.submitAt;
  }
  return null;
}

export function getCartItemTtlSeconds(
  item: CartItem,
  apiTtlSeconds?: number,
): number | null {
  if (isTimedCartItem(item)) {
    return apiTtlSeconds ?? null;
  }
  return CART_DEFAULT_TTL_SECONDS;
}

export function formatCartRemainingTime(minutes: number): string {
  if (minutes <= 0) {
    return 'منقضی شده';
  }

  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);

  if (hours > 0) {
    return `${hours} ساعت و ${mins} دقیقه`;
  }

  return `${mins} دقیقه`;
}
