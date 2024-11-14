import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, TouchableOpacity} from 'react-native';
import {Eye, EyeSlash, InfoCircle} from 'iconsax-react-native';
import {FieldValues, UseFormRegister, UseFormWatch} from 'react-hook-form';
import BaseText from '../BaseText';
import {InputProps} from '../../models/props';

const ControlledInput = <T extends FieldValues>({
  label,
  id,
  error,
  type,
  register,
  watch,
  value,
  setValue,
  required,
  PlaceHolder,
  disabled,
  onChange,
  info,
  LeftIcon,
  LeftIconVariant,
  RightIcon,
  RightIconVariant,
}: InputProps<T>) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [text, setText] = useState(value || '');
  useEffect(() => {
    if (watch && setValue) {
      const currentValue = watch(id);
      setValue(id, currentValue);
    }
  }, [id, setValue, watch]);

  const toggleVisibilityHandler = () => {
    setShowPassword(!showPassword);
  };

  const handleChangeText = (text: string) => {
    setIsTyping(true); // Start typing when input changes
    setText(text);
    if (type === 'number') {
      const numericText = text.replace(/[^0-9]/g, '');
      setValue?.(id, numericText);
    } else {
      setValue?.(id, text);
    }
    onChange?.();
  };

  // Using register's onBlur instead of directly assigning it
  const inputProps = register
    ? register(id, {
        required,
        onBlur: () => setIsTyping(false),
      })
    : {onBlur: () => setIsTyping(false)};

  return (
    <View
      className={`flex flex-col  my-2 gap-1 w-full ${
        disabled ? 'opacity-50' : ''
      }`}>
      <View>
        {label && (
          <BaseText type="title4" className="!capitalize w-fit rtl:text-left  ">
            {label}
          </BaseText>
        )}
      </View>
      <View
        className={`w-full h-12 relative px-4 flex flex-row items-center overflow-hidden  justify-center gap-2 rounded-2xl border ${
          disabled && 'bg-neutral-100 dark:bg-neutral-dark-100'
        } ${
          isTyping
            ? 'border-secondary-500'
            : error && !disabled
            ? 'border-[#F55F56]'
            : 'border-neutral-300 dark:border-neutral-dark-300'
        }`}>
        {LeftIcon && (
          <View>
            <LeftIcon size={24} color={'#AAABAD'} variant={LeftIconVariant} />
          </View>
        )}
        {!text && (
          <BaseText
            type="placeholder"
            className="absolute left-[54px] rtl:right-[54px] rtl:text-left text-text-muted dark:text-text-muted-dark w-fit"
            style={{pointerEvents: 'none'}}>
            {PlaceHolder}
          </BaseText>
        )}
        <TextInput
          editable={!disabled}
          placeholder={''}
          selectionColor={isTyping ? '#7676EE' : ''}
          className={`p-2 w-full flex-1 h-full outline-none rounded-lg duration-200 text-text-base dark:text-text-base-dark`}
          value={value?.toString()}
          secureTextEntry={type === 'password' && !showPassword}
          keyboardType={type === 'number' ? 'numeric' : 'default'}
          onChangeText={handleChangeText}
          onFocus={() => setIsTyping(true)}
          {...inputProps}
        />
        {type === 'password' ? (
          <TouchableOpacity
            disabled={disabled}
            onPress={toggleVisibilityHandler}
            className=" text-gray-400">
            {showPassword ? (
              <Eye size="24" color="#888888" />
            ) : (
              <EyeSlash size="24" color="#888888" />
            )}
          </TouchableOpacity>
        ) : (
          RightIcon && (
            <View>
              <RightIcon
                size={24}
                color={'#AAABAD'}
                variant={RightIconVariant}
              />
            </View>
          )
        )}
      </View>
      {info && (
        <View className="flex flex-row items-center gap-2">
          <InfoCircle size={20} color="#7F8185" />
          <BaseText color="secondary" type="caption">
            {info}
          </BaseText>
        </View>
      )}
      {error && !disabled && (
        <View className="flex flex-row items-center gap-2">
          <InfoCircle size={20} color="#FD504F" />
          <BaseText color="error" type="caption">
            {error}
          </BaseText>
        </View>
      )}
    </View>
  );
};

export default ControlledInput;
