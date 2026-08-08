import axios from 'axios';
import {showToast} from '../../components/Toast/Toast';
import {handleCartInvalidationIfNeeded} from './cartInvalidationErrors';

export const handleMutationError = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response) {
    void handleCartInvalidationIfNeeded(error).then(handled => {
      if (handled) {
        return;
      }

      const message =
        error.response?.data?.message || error.message || 'Unknown error occurred';
      showToast({
        type: 'error',
        text1: 'Error',
        text2: message,
      });
    });
    return;
  }

  if (error instanceof Error) {
    showToast({
      type: 'error',
      text1: 'Error',
      text2: error.message,
    });
  } else {
    showToast({
      type: 'error',
      text1: 'Error',
      text2: 'An unknown error occurred',
    });
  }
};
