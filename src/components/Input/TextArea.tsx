import React from 'react';
import {View, TextInput, TextInputProps} from 'react-native';
import BaseText from '../BaseText';
import {useTranslation} from 'react-i18next';

interface TextAreaProps extends TextInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  error?: string;
  label?: string;
  disabled?: boolean;
}

const TextArea: React.FC<TextAreaProps> = ({
  placeholder,
  value,
  onChangeText,
  error,
  label,
  disabled = false,
  ...props
}) => {
  const {i18n} = useTranslation();
  const inputFontFamily =
    i18n.language === 'fa' ? 'YekanBakhFaNum-Regular' : 'Poppins-Regular';
  return (
    <View
      className={`flex flex-col gap-1 w-full ${disabled ? 'opacity-50' : ''}`}>
      {/* Label */}
      {label && (
        <BaseText type="title4" className="!capitalize">
          {label}
        </BaseText>
      )}

      <View
        className={`w-full relative overflow-hidden rounded-2xl border ${
          disabled ? 'bg-neutral-100 dark:bg-neutral-dark-100' : ''
        } ${
          error
            ? 'border-[#F55F56]'
            : 'border-neutral-300 dark:border-neutral-dark-300'
        }`}>
        {/* Placeholder */}
        {!value && placeholder && (
          <BaseText
            type="caption"
            className="absolute left-4 top-3 rtl:text-left text-text-muted dark:text-text-muted-dark"
            style={{pointerEvents: 'none'}}>
            {placeholder}
          </BaseText>
        )}

        {/* Text Input */}
        <TextInput
          {...props}
          className="px-4 py-3 flex-1 min-h-[100px] outline-none rounded-2xl text-base text-text-base dark:text-text-base-dark rtl:text-right ltr:text-left"
          style={[props.style, {fontFamily: inputFontFamily}]}
          editable={!disabled}
          placeholder=""
          selectionColor="#7676EE"
          multiline
          textAlignVertical="top"
          value={value}
          onChangeText={onChangeText}
        />
      </View>

      {/* Error Message */}
      <View className="h-[14px]">
        {error && (
          <BaseText color="error" type="badge">
            {error}
          </BaseText>
        )}
      </View>
    </View>
  );
};

export default TextArea;
