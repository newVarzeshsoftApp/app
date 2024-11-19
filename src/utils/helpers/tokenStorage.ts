import {Platform} from 'react-native';
let EncryptedStorage: any;

if (Platform.OS !== 'web') {
  EncryptedStorage = require('react-native-encrypted-storage');
}

import {StorageKeys} from '../../models/enums';

// Store Access and Refresh Tokens
export const storeTokens = async (
  accessToken: string,
  refreshToken: string,
): Promise<void> => {
  if (Platform.OS === 'web') {
    localStorage.setItem(StorageKeys.token, accessToken);
    localStorage.setItem(StorageKeys.refreshToken, refreshToken);
  } else {
    await EncryptedStorage.setItem(StorageKeys.token, accessToken);
    await EncryptedStorage.setItem(StorageKeys.refreshToken, refreshToken);
  }
};

// Get Tokens
export const getTokens = async (): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> => {
  if (Platform.OS === 'web') {
    return {
      accessToken: localStorage.getItem(StorageKeys.token),
      refreshToken: localStorage.getItem(StorageKeys.refreshToken),
    };
  } else {
    return {
      accessToken: await EncryptedStorage.getItem(StorageKeys.token),
      refreshToken: await EncryptedStorage.getItem(StorageKeys.refreshToken),
    };
  }
};

// Remove Tokens
export const removeTokens = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(StorageKeys.token);
    localStorage.removeItem(StorageKeys.refreshToken);
  } else {
    await EncryptedStorage.removeItem(StorageKeys.token);
    await EncryptedStorage.removeItem(StorageKeys.refreshToken);
  }
};
