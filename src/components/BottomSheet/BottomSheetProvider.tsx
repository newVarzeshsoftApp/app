import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
} from 'react';
import BottomSheet, {BottomSheetMethods, BottomSheetProps} from './BottomSheet';

interface BottomSheetContextProps {
  showBottomSheet: () => void;
  BottomSheetConfig: (config: Partial<BottomSheetProps>) => void;
  hideBottomSheet: () => void;
}

const BottomSheetContext = createContext<BottomSheetContextProps | undefined>(
  undefined,
);

export const BottomSheetProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const bottomSheetRef = useRef<BottomSheetMethods>(null);

  const [config, setConfig] = useState<BottomSheetProps>({
    activeHeight: 300,
    Title: '',
    buttonText: '',
    buttonDisabled: false,
    onButtonPress: undefined,
  });

  const showBottomSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const BottomSheetConfig = useCallback(
    (updatedConfig: Partial<BottomSheetProps>) => {
      setConfig(prevConfig => ({
        ...prevConfig,
        ...updatedConfig,
      }));
    },
    [],
  );

  const hideBottomSheet = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  return (
    <BottomSheetContext.Provider
      value={{showBottomSheet, BottomSheetConfig, hideBottomSheet}}>
      {children}
      <BottomSheet
        ref={bottomSheetRef}
        activeHeight={config.activeHeight}
        Title={config.Title}
        buttonText={config.buttonText}
        buttonDisabled={config.buttonDisabled}
        scrollView={config.scrollView}
        onButtonPress={config.onButtonPress}>
        {config.children}
      </BottomSheet>
    </BottomSheetContext.Provider>
  );
};

export const useBottomSheet = (): BottomSheetContextProps => {
  const context = useContext(BottomSheetContext);
  if (!context) {
    throw new Error('useBottomSheet must be used within BottomSheetProvider');
  }
  return context;
};
