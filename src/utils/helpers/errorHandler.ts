import {showToast} from '../../components/Toast/Toast';

export const handleMutationError = (error: unknown) => {
  if (error instanceof Error) {
    showToast({
      type: 'error',
      text1: `Error`,
      text2: error.message,
    });
  } else {
    showToast({
      type: 'error',
      text1: `Error`,
      text2: 'An unknown error occurred',
    });
  }
};
