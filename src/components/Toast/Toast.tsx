import React from 'react';
import Toast, {ToastShowParams} from 'react-native-toast-message';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ShowToastProps {
  type?: ToastType;
  text1: string;
  text2?: string;
  options?: Partial<ToastShowParams>;
}

export const showToast = ({
  type = 'success',
  text1,
  text2,
  options = {},
}: ShowToastProps) => {
  Toast.show({
    type,
    text1,
    text2,
    topOffset: 70,
    ...options,
  });
};

const ToastProvider: React.FC = () => <Toast />;

export default ToastProvider;
