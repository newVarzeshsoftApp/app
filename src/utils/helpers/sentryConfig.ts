import {Platform} from 'react-native';
import * as SentryNative from '@sentry/react-native';
import * as SentryWeb from '@sentry/react';

export const SENTRY =
  Platform.OS === 'web'
    ? (SentryWeb as typeof SentryWeb)
    : (SentryNative as typeof SentryNative);
export const SENTRY_DSN =
  Platform.OS === 'web'
    ? process.env.SENTRY_DSN_WEB
    : process.env.SENTRY_DSN_NATIVE;
