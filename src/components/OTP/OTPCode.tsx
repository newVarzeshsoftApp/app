import React, {useState} from 'react';
import {
  View,
  TextInput,
  TextInputKeyPressEventData,
  NativeSyntheticEvent,
  Platform,
} from 'react-native';

interface OtpProps {
  length: number;
  onChange: (value: string) => void;
  error?: boolean;
  value: string;
}

const OTPCode: React.FC<OtpProps> = ({value, length, onChange, error}) => {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = React.useRef<TextInput[]>([]);

  const handleChangeText = (text: string, index: number) => {
    // If a full OTP code is pasted, set the entire value
    if (text.length === length) {
      onChange(text);
      return;
    }

    const newOtpValue = value.split('');
    newOtpValue[index] = text;
    onChange(newOtpValue.join(''));
    // Move to the next input if available and input is not empty
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0 && !value[index]) {
      inputRefs.current[index - 1]?.focus();
      const newOtpValue = value.split('');
      newOtpValue[index - 1] = '';
      onChange(newOtpValue.join(''));
    }
  };

  const handleFocus = (index: number) => setFocusedIndex(index);

  const handlePaste = (e: any) => {
    const pastedText = e.clipboardData?.getData('Text') || '';
    if (pastedText.length === length) {
      onChange(pastedText);
    }
  };

  return (
    <View className="flex flex-row rtl:flex-row-reverse gap-4 w-full">
      {Array.from({length}).map((_, index) => (
        <TextInput
          // onPaste={Platform.OS === 'web' ? handlePaste : undefined}
          key={index}
          ref={ref => (inputRefs.current[index] = ref!)}
          className={`text-text-base dark:text-text-base-dark outline-none ${
            error
              ? 'border-error-500'
              : focusedIndex === index
              ? 'border-secondary-500'
              : 'border-neutral-300 dark:border-neutral-300'
          }`}
          style={{
            width: 52,
            height: 52,
            textAlign: 'center',
            fontSize: 20,
            borderRadius: 16,
            borderWidth: 1,
          }}
          keyboardType="number-pad"
          maxLength={1}
          onChangeText={text => handleChangeText(text, index)}
          onFocus={() => handleFocus(index)}
          onBlur={() => setFocusedIndex(null)}
          onKeyPress={e => handleKeyPress(e, index)}
          value={value[index] || ''}
          autoFocus={index === 0}
          autoComplete={Platform.OS === 'web' ? 'one-time-code' : undefined}
          textContentType={Platform.OS === 'ios' ? 'oneTimeCode' : undefined}
        />
      ))}
    </View>
  );
};

export default OTPCode;
