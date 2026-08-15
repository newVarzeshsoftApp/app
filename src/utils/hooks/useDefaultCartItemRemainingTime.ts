import {useEffect, useState} from 'react';
import {CART_DEFAULT_TTL_SECONDS} from '../../constants/cart';
import {CartItem} from '../helpers/CartStorage';
import {getCartItemExpiryStartIso} from '../helpers/cartExpiry';

/**
 * Countdown (minutes) for non-timed cart items using the default 24h TTL.
 */
export function useDefaultCartItemRemainingTime(
  item: CartItem,
  enabled = true,
): number | null {
  const [remainingMinutes, setRemainingMinutes] = useState<number | null>(null);

  const startIso = getCartItemExpiryStartIso(item);

  useEffect(() => {
    if (!enabled) {
      setRemainingMinutes(null);
      return;
    }

    // Legacy items without timestamps: show a full fresh window (not expired)
    if (!startIso) {
      setRemainingMinutes(CART_DEFAULT_TTL_SECONDS / 60);
      return;
    }

    const updateRemainingTime = () => {
      const now = Date.now();
      const startedAt = new Date(startIso).getTime();
      const elapsedSeconds = (now - startedAt) / 1000;
      const remainingSeconds = Math.max(
        0,
        CART_DEFAULT_TTL_SECONDS - elapsedSeconds,
      );
      setRemainingMinutes(remainingSeconds / 60);
    };

    updateRemainingTime();
    const interval = setInterval(updateRemainingTime, 1000);

    return () => clearInterval(interval);
  }, [enabled, startIso]);

  return remainingMinutes;
}
