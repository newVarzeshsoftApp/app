import {Platform} from 'react-native';
import type EncryptedStorageType from 'react-native-encrypted-storage';
import {StorageKeys} from '../../models/enums';

let EncryptedStorage: typeof EncryptedStorageType | undefined;

if (Platform.OS !== 'web') {
  EncryptedStorage = require('react-native-encrypted-storage').default;
}

// const PREFIX = 'app_';
// export const StorageKeys = {
//   token: `${PREFIX}token`,
//   refreshToken: `${PREFIX}refreshToken`,
// };

// Store Access and Refresh Tokens
export const storeTokens = async (
  accessToken: string,
  refreshToken: string,
): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage === 'undefined') {
        throw new Error('localStorage is not available');
      }
      localStorage.setItem(StorageKeys.token, accessToken);
      localStorage.setItem(StorageKeys.refreshToken, refreshToken);
    } else {
      await EncryptedStorage?.setItem(StorageKeys.token, accessToken);
      await EncryptedStorage?.setItem(StorageKeys.refreshToken, refreshToken);
    }
  } catch (error) {
    console.error('Error storing tokens:', error);
    throw new Error('Failed to store tokens');
  }
};

// Get Tokens
export const getTokens = async (): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> => {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage === 'undefined') {
        throw new Error('localStorage is not available');
      }
      return {
        accessToken: localStorage.getItem(StorageKeys.token) || null,
        refreshToken: localStorage.getItem(StorageKeys.refreshToken) || null,
      };
    } else {
      return {
        accessToken:
          (await EncryptedStorage?.getItem(StorageKeys.token)) || null,
        refreshToken:
          (await EncryptedStorage?.getItem(StorageKeys.refreshToken)) || null,
      };
    }
  } catch (error) {
    console.error('Error retrieving tokens:', error);
    return {accessToken: null, refreshToken: null};
  }
};

// Remove Tokens
export const removeTokens = async (): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage === 'undefined') {
        throw new Error('localStorage is not available');
      }
      localStorage.removeItem(StorageKeys.token);
      localStorage.removeItem(StorageKeys.refreshToken);
    } else {
      await EncryptedStorage?.removeItem(StorageKeys.token);
      await EncryptedStorage?.removeItem(StorageKeys.refreshToken);
    }
  } catch (error) {
    console.error('Error removing tokens:', error);
    throw new Error('Failed to remove tokens');
  }
};
