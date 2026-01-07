import {Platform} from 'react-native';

export const GetSKU = (): string | null => {
  if (Platform.OS === 'web') {
    // Extract SKU from URL query parameters
    const params = new URLSearchParams(window.location.search);
    const skuFromURL = params.get('sku');

    if (skuFromURL) {
      // Save SKU to localStorage if it exists in the URL
      localStorage.setItem('sku', skuFromURL);
      return skuFromURL;
    }
    // If not in URL, get it from localStorage
    const skuFromStorage = localStorage.getItem('sku');
    return skuFromStorage ? skuFromStorage : null;
  } else {
    // Get SKU from environment variables in the app
    return process.env.SKU || null;
  }
};
