import React, {useCallback, useRef} from 'react';
import {Controller, FieldValues} from 'react-hook-form';
import {
  Dimensions,
  Text,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import {InputProps} from '../../models/props';
import BaseText from '../BaseText';
import {useTranslation} from 'react-i18next';
import {InfoCircle} from 'iconsax-react-native';
import BottomSheet from '../BottomSheet/BottomSheet';

const Picker = <T extends FieldValues>({
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
  onpress,
  ...props
}: InputProps<T> & TextInputProps) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Input'});

  return (
    <>
      <View
        className={`flex flex-col  gap-1 w-full ${
          disabled ? 'opacity-50' : ''
        }`}>
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
            <TouchableOpacity
              onPress={onpress}
              className={`w-full h-12 relative ${
                LeftIcon
                  ? 'pl-4'
                  : RightIcon || type === 'password'
                  ? 'pr-4 pl-2'
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
                  <LeftIcon
                    size={24}
                    color="#AAABAD"
                    variant={LeftIconVariant}
                  />
                </View>
              )}

              {/* Placeholder */}

              <BaseText
                color={!value ? 'muted' : 'base'}
                type="caption"
                className={`absolute ${
                  LeftIcon
                    ? 'left-[20%] rtl:right-[20%]'
                    : 'left-[6%] rtl:right-[6%]'
                }  rtl:text-left  w-fit`}
                style={{pointerEvents: 'none'}}>
                {!value ? PlaceHolder : value.value}
              </BaseText>
            </TouchableOpacity>
          )}
        />
        <View className="h-[14px]">
          {/* Info Text */}
          {info && (
            <View className="flex flex-row items-center gap-2">
              <InfoCircle size={14} color="#7F8185" />
              <BaseText color="secondary" type="caption">
                {info}
              </BaseText>
            </View>
          )}

          {/* Error Text */}
          {error && (
            <View className="flex flex-row items-center gap-2">
              <InfoCircle size={14} color="#FD504F" />
              <BaseText color="error" type="caption">
                {error}
              </BaseText>
            </View>
          )}
        </View>
      </View>
    </>
  );
};

export default Picker;
