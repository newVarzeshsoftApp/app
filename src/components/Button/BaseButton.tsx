import React, {useState} from 'react';
import {IButtonProps} from '../../models/props';
import {Image, Pressable, View} from 'react-native';
import Loading from '../Spinner/Loading';
import BaseText from '../BaseText';
import {useTheme} from '../../utils/ThemeContext';

function BaseButton({
  size = 'Medium',
  color = 'Primary',
  type = 'Fill',
  disabled,
  isLoading,
  text,
  rounded,
  LeftIcon,
  srcLeft,
  LeftIconVariant,
  noText,
  RightIcon,
  srcRight,
  RightIconVariant,
  ...props
}: IButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const {theme} = useTheme();
  const DarkMode = theme === 'dark';

  // Helper function to determine icon color
  const getIconColor = () => {
    switch (type) {
      case 'Fill':
        return DarkMode ? '#16181b' : '#ffffff';
      case 'Outline':
      case 'TextButton':
        switch (color) {
          case 'Primary':
            return DarkMode ? '#8ac14f' : '#bcdc64';
          case 'Black':
            return DarkMode ? '#ffffff' : '#16181b';
          case 'Success':
            return '#37c976';
          default:
            return DarkMode ? '#ffffff' : '#16181b';
        }
      case 'Tonal':
        switch (color) {
          case 'Primary':
            return DarkMode ? '#c9e483' : '#abc95b';
          case 'Black':
            return DarkMode ? '#ffffff' : '#16181b';
          case 'Success':
            return DarkMode ? '#5fd491' : '#32b76b';
          default:
            return DarkMode ? '#ffffff' : '#16181b';
        }
      default:
        return DarkMode ? '#ffffff' : '#16181b';
    }
  };

  // Helper function to determine text color
  const getTextColor = () => {
    switch (type) {
      case 'Fill':
        return 'button';
      case 'Outline':
      case 'TextButton':
        switch (color) {
          case 'Primary':
            return 'active';
          case 'Black':
            return 'base';
          case 'Success':
            return 'Success500';
          default:
            return 'base';
        }
      case 'Tonal':
        switch (color) {
          case 'Primary':
            return 'Primary600';
          case 'Black':
            return 'base';
          case 'Success':
            return 'Success600';
          default:
            return 'base';
        }
      default:
        return 'base';
    }
  };

  // Helper function to determine size-related styles
  const getSizeStyles = () => {
    switch (size) {
      case 'Large':
        return `h-[48px] px-4 ${!rounded && 'rounded-[16px]'}`;
      case 'Medium':
        return `h-[40px] px-3 ${!rounded && 'rounded-[12px]'}`;
      case 'Small':
      default:
        return `h-[32px] px-2 ${!rounded && 'rounded-[12px]'}`;
    }
  };
  const GetPressedDesign = () => {
    if (isPressed) {
      switch (type) {
        case 'Fill':
          switch (color) {
            case 'Primary':
              return DarkMode
                ? '!border-primary-dark-300  !bg-primary-dark-700'
                : '!border-primary-300 !bg-primary-700';
            case 'Black':
              return DarkMode
                ? '!border-neutral-dark-400  !bg-neutral-dark-1000'
                : '!border-neutral-400 !bg-neutral-1000';
            case 'Success':
              return DarkMode
                ? '!border-success-dark-300  !bg-success-dark-700'
                : '!border-success-300 !bg-success-700';
            default:
              return 'border-gray-500';
          }
        case 'Outline':
          switch (color) {
            case 'Primary':
              return DarkMode
                ? '!border-primary-dark-700'
                : '!border-primary-700';
            case 'Black':
              return DarkMode
                ? '!border-neutral-dark-500'
                : '!border-neutral-500 ';
            case 'Success':
              return DarkMode
                ? '!border-success-dark-700'
                : '!border-success-700';
            default:
              return 'border-gray-500';
          }
        case 'Tonal':
          switch (color) {
            case 'Primary':
              return DarkMode
                ? '!border-primary-dark-300  !border-2 !bg-primary-dark-200'
                : '!border-primary-300 !bg-primary-200';
            case 'Black':
              return DarkMode
                ? '!border-neutral-dark-400  !bg-neutral-dark-300'
                : '!border-neutral-400 !bg-neutral-300';
            case 'Success':
              return DarkMode
                ? '!border-success-dark-300  !bg-success-dark-200'
                : '!border-success-300 !bg-success-200';
            default:
              return 'border-gray-500';
          }
        case 'TextButton':
          switch (color) {
            case 'Primary':
              return DarkMode ? '!bg-primary-dark-200' : '!bg-primary-200';
            case 'Black':
              return DarkMode ? '!bg-neutral-dark-300' : '!bg-neutral-300';
            case 'Success':
              return DarkMode ? '!bg-success-dark-200' : '!bg-success-200';
            default:
              return 'border-gray-500';
          }
      }
    }
  };
  return (
    <Pressable
      disabled={disabled || isLoading}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      {...props}
      className={`flex items-center justify-center flex-row gap-2   ${type}-${color} ${GetPressedDesign()} ${getSizeStyles()} ${
        rounded ? '!rounded-full' : ''
      }`}>
      {isLoading ? (
        <Loading size={32} circleClassName={getIconColor()} />
      ) : (
        <>
          {LeftIcon ? (
            <View>
              <LeftIcon
                size={size === 'Medium' || size === 'Small' ? 20 : 24}
                color={getIconColor()}
                variant={LeftIconVariant}
              />
            </View>
          ) : (
            srcLeft && (
              <Image src={srcLeft} width={20} height={20} alt={srcLeft} />
            )
          )}
          {!noText && (
            <BaseText
              color={getTextColor()}
              type={size === 'Large' ? 'button1' : 'button2'}>
              {text}
            </BaseText>
          )}
          {RightIcon ? (
            <View>
              <RightIcon
                size={size === 'Medium' || size === 'Small' ? 20 : 24}
                color={getIconColor()}
                variant={RightIconVariant}
              />
            </View>
          ) : (
            srcRight && (
              <Image src={srcRight} width={20} height={20} alt={srcRight} />
            )
          )}
        </>
      )}
    </Pressable>
  );
}

export default BaseButton;
