import moment from 'jalali-moment';

const CHARGE_BY_SESSION_KEY = 'chargeBySession';
const FORCE_END_DATE_KEY = 'forceEndDate';
const GREGORIAN_DATE_FORMAT = 'YYYY-MM-DD';
const JALALI_DATE_FORMAT = 'jYYYY/jMM/jDD';

// Exact credit / price multiples can drift by a few ULPs. Snap only that noise.
const SESSION_INTEGER_EPSILON = 1e-6;

export type ChargingServiceProduct = {
  price?: number | string | null;
  metadata?: unknown;
};

type MetadataEntry = {
  value?: unknown;
};

type JalaliMoment = moment.Moment & {
  local?: (locale: string) => moment.Moment;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readMetadataValue(metadata: unknown, key: string): unknown {
  if (!isRecord(metadata)) {
    return undefined;
  }

  const entry = metadata[key];
  if (!isRecord(entry)) {
    return undefined;
  }

  return (entry as MetadataEntry).value;
}

export function isChargeBySession(
  product?: ChargingServiceProduct | null,
): boolean {
  const value = readMetadataValue(product?.metadata, CHARGE_BY_SESSION_KEY);

  return String(value).toLowerCase() === 'true';
}

function getSessionPrice(
  product?: ChargingServiceProduct | null,
): number | null {
  const sessionPrice = Number(product?.price);

  if (!Number.isFinite(sessionPrice) || sessionPrice <= 0) {
    return null;
  }

  return sessionPrice;
}

export function getSessionCount(
  amount: number | null | undefined,
  product?: ChargingServiceProduct | null,
): number | null {
  const sessionPrice = getSessionPrice(product);

  if (sessionPrice === null || amount === null || amount === undefined) {
    return null;
  }

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) {
    return null;
  }

  const sessions = numericAmount / sessionPrice;
  if (!Number.isFinite(sessions)) {
    return null;
  }

  const nearestInteger = Math.round(sessions);
  if (Math.abs(sessions - nearestInteger) < SESSION_INTEGER_EPSILON) {
    return nearestInteger;
  }

  return sessions;
}

export function getForcedEndDate(
  product?: ChargingServiceProduct | null,
): string | null {
  const value = readMetadataValue(product?.metadata, FORCE_END_DATE_KEY);

  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }

  const parsed = moment(trimmedValue, GREGORIAN_DATE_FORMAT, true);
  if (!parsed.isValid()) {
    return null;
  }

  return trimmedValue;
}

export function formatForcedEndDate(
  product?: ChargingServiceProduct | null,
  options?: {usePersianLocale?: boolean},
): string | null {
  const forcedEndDate = getForcedEndDate(product);
  if (!forcedEndDate) {
    return null;
  }

  const parsed = moment(
    forcedEndDate,
    GREGORIAN_DATE_FORMAT,
    true,
  ) as JalaliMoment;

  if (options?.usePersianLocale && typeof parsed.local === 'function') {
    return parsed.local('fa').format(JALALI_DATE_FORMAT);
  }

  return parsed.format(JALALI_DATE_FORMAT);
}
