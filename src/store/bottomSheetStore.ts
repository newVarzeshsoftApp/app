import {create} from 'zustand';
import {ReactNode} from 'react';

export interface BottomSheetParams {
  content: ReactNode;
  title?: string;
  buttonText?: string;
  buttonAction?: () => void;
  buttonDisabled?: boolean;
  height?: number;
  dynamicHeight?: boolean;
}

interface BottomSheetState {
  isOpen: boolean; // Tracks whether sheet is expanded
  content: ReactNode | null;
  title?: string;
  buttonText?: string;
  buttonAction?: () => void;
  buttonDisabled?: boolean;
  height: number; // default or fallback
  dynamicHeight?: boolean;

  openSheet: (params: BottomSheetParams) => void;
  closeSheet: () => void;
}

const DEFAULT_HEIGHT = 400;

export const useBottomSheetStore = create<BottomSheetState>(set => ({
  // Initial state
  isOpen: false,
  content: null,
  title: undefined,
  buttonText: undefined,
  buttonAction: undefined,
  buttonDisabled: false,
  height: DEFAULT_HEIGHT,
  dynamicHeight: false,

  // Actions
  openSheet: ({
    content,
    title,
    buttonText,
    buttonAction,
    buttonDisabled,
    height,
    dynamicHeight,
  }) =>
    set({
      isOpen: true,
      content,
      title,
      buttonText,
      buttonAction,
      buttonDisabled: buttonDisabled ?? false,
      height: height ?? DEFAULT_HEIGHT,
      dynamicHeight: dynamicHeight ?? false,
    }),

  closeSheet: () =>
    set({
      isOpen: false,
      content: null,
      title: undefined,
      buttonText: undefined,
      buttonAction: undefined,
      buttonDisabled: false,
      dynamicHeight: false,
    }),
}));
