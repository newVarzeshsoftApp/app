import React, {useState} from 'react';
import {View, TextInput, TouchableOpacity, TextInputProps} from 'react-native';
import {Controller, FieldValues} from 'react-hook-form';
import {Eye, EyeSlash, InfoCircle} from 'iconsax-react-native';
import BaseText from '../BaseText';
import {InputProps} from '../../models/props';
import {useTranslation} from 'react-i18next';
import {formatNumber} from '../../utils/helpers/helpers';

const ControlledInput = <T extends FieldValues>({
  control,
  name,
  label,
  type = 'text',
  error,
  disabled = false,
  info,
  LeftIcon,
  LeftIconVariant,
  RightIcon,
  RightIconVariant,
  PlaceHolder,
  optional,
  SperatedNumber,
  centerText,
  ...props
}: InputProps<T> & TextInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };
  const {t} = useTranslation('translation', {keyPrefix: 'Input'});

  return (
    <View
      className={`flex flex-col  gap-1 w-full ${disabled ? 'opacity-50' : ''}`}>
      {/* Label */}
      {label && (
        <BaseText type="title4" className="!capitalize ">
          {label} {optional && `(${t('optional')})`}
        </BaseText>
      )}
      <Controller
        control={control}
        name={name}
        render={({field: {onChange, onBlur, value}}) => (
          <View
            className={`w-full h-12 relative ${
              LeftIcon
                ? 'pl-4'
                : RightIcon || type === 'password'
                ? 'px-1'
                : 'pl-2'
            } flex flex-row items-center overflow-hidden justify-center gap-2 rounded-2xl border ${
              disabled ? 'bg-neutral-100 dark:bg-neutral-dark-100' : ''
            } ${
              error && !disabled
                ? 'border-[#F55F56]'
                : 'border-neutral-300 dark:border-neutral-dark-300'
            }`}>
            {/* Left Icon */}
            {LeftIcon && (
              <View>
                <LeftIcon size={24} color="#AAABAD" variant={LeftIconVariant} />
              </View>
            )}

            {/* Placeholder */}
            {!value && (
              <BaseText
                type="caption"
                className={`absolute ${
                  centerText
                    ? ` !text-center  w-full`
                    : LeftIcon
                    ? 'left-[20%] rtl:right-[20%]'
                    : 'left-[6%] rtl:right-[6%]'
                }  rtl:text-left text-text-muted dark:text-text-muted-dark w-fit`}
                style={{pointerEvents: 'none'}}>
                {PlaceHolder}
              </BaseText>
            )}

            {/* Text Input */}
            <TextInput
              {...props}
              className={`${
                centerText ? '!text-center' : 'rtl:text-right ltr:text-left'
              } px-4 flex-1 h-full outline-none  rounded-lg duration-200 text-text-base dark:text-text-base-dark`}
              editable={!disabled}
              placeholder=""
              selectionColor="#7676EE"
              secureTextEntry={type === 'password' && !showPassword}
              keyboardType={type === 'number' ? 'numeric' : 'default'}
              value={SperatedNumber ? formatNumber(value) : value}
              onBlur={onBlur}
              onChangeText={text => {
                if (SperatedNumber) {
                  // Store raw number in form state
                  onChange(text.replace(/,/g, ''));
                } else {
                  onChange(text);
                }
              }}
            />

            {/* Right Icon / Password Toggle */}
            {type === 'password' ? (
              <TouchableOpacity
                disabled={disabled}
                onPress={togglePasswordVisibility}
                className="text-gray-400">
                {showPassword ? (
                  <Eye size={24} color="#888888" />
                ) : (
                  <EyeSlash size={24} color="#888888" />
                )}
              </TouchableOpacity>
            ) : (
              RightIcon && (
                <View>
                  <RightIcon
                    size={24}
                    color="#AAABAD"
                    variant={RightIconVariant}
                  />
                </View>
              )
            )}
          </View>
        )}
      />
      <View className="h-[14px]">
        {/* Info Text */}
        {info && !error && (
          <View className="flex flex-row items-center gap-2">
            <InfoCircle size={14} color="#7F8185" />
            <BaseText color="muted" type="badge">
              {info}
            </BaseText>
          </View>
        )}

        {/* Error Text */}
        {error && (
          <View className="flex flex-row items-center gap-2">
            <InfoCircle size={14} color="#FD504F" />
            <BaseText color="error" type="badge">
              {error}
            </BaseText>
          </View>
        )}
      </View>
    </View>
  );
};

export default ControlledInput;
