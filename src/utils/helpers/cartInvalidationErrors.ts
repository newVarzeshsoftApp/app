import axios from 'axios';
import {DeviceEventEmitter} from 'react-native';
import {Status} from '../../models/enums';
import {showToast} from '../../components/Toast/Toast';
import {clearCart} from './CartStorage';

export const CART_CLEARED_EVENT = 'cart_cleared';

const CART_INVALIDATION_MESSAGES: Record<string, string> = {
  'group class room not found': 'کلاس گروهی یافت نشد',
  'group class room is not available online':
    'فروش آنلاین کلاس گروهی در دسترس نیست',
  'product not found': 'خدمت مورد نظر در دسترس نیست',
  'product is not available for online reservation':
    'خدمت مورد نظر برای رزرو آنلاین در دسترس نیست',
  'product is not available for online sale':
    'خدمت مورد نظر برای فروش آنلاین در دسترس نیست',
};

const normalizeMessage = (message: string): string =>
  message.trim().replace(/\s+/g, ' ').toLowerCase();

const extractApiErrorMessage = (data: unknown): string | undefined => {
  if (!data) {
    return undefined;
  }

  if (typeof data === 'string') {
    return data;
  }

  if (typeof data !== 'object') {
    return undefined;
  }

  const message = (data as {message?: unknown}).message;

  if (typeof message === 'string') {
    return message;
  }

  if (Array.isArray(message) && message.length > 0) {
    const first = message.find(entry => typeof entry === 'string');
    return typeof first === 'string' ? first : undefined;
  }

  return undefined;
};

export const resolveCartInvalidationError = (
  message?: string,
): {isCartInvalidation: boolean; persianMessage?: string} => {
  if (!message) {
    return {isCartInvalidation: false};
  }

  const normalized = normalizeMessage(message);
  const persianMessage = CART_INVALIDATION_MESSAGES[normalized];

  if (!persianMessage) {
    return {isCartInvalidation: false};
  }

  return {isCartInvalidation: true, persianMessage};
};

export const handleCartInvalidationIfNeeded = async (
  error: unknown,
): Promise<boolean> => {
  if (!axios.isAxiosError(error) || !error.response) {
    return false;
  }

  if (error.response.status !== Status.BadRequest) {
    return false;
  }

  const apiMessage = extractApiErrorMessage(error.response.data);

  const {isCartInvalidation, persianMessage} =
    resolveCartInvalidationError(apiMessage);

  if (!isCartInvalidation || !persianMessage) {
    return false;
  }

  try {
    await clearCart();
    DeviceEventEmitter.emit(CART_CLEARED_EVENT);
  } catch (clearError) {
    console.error('Failed to clear cart after invalidation error:', clearError);
  }

  showToast({
    type: 'error',
    text2: persianMessage,
  });

  return true;
};
