import React, {useState} from 'react';
import {IButtonProps} from '../../models/props';
import {Image, Pressable, View} from 'react-native';
import Loading from '../Spinner/Loading';
import BaseText from '../BaseText';
import {useTheme} from '../../utils/ThemeContext';
import ArrowUp from '../../assets/icons/ArrowUp.svg';
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
  Extraclass,
  RightIconVariant,
  LinkButton,
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
          case 'Supportive1-Yellow':
          case 'Supportive5-Blue':
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
          case 'Supportive1-Yellow':
          case 'Supportive5-Blue':
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
            case 'Supportive1-Yellow':
              return DarkMode
                ? '!border-supportive1-dark-300 !bg-supportive1-dark-700  '
                : '!border-supportive1-300 !bg-supportive1-700 ';
            case 'Supportive5-Blue':
              return DarkMode
                ? '!border-supportive5-dark-300 !bg-supportive5-dark-700  '
                : '!border-supportive5-300 !bg-supportive5-700 ';
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
  const small = size === 'Medium' || size === 'Small';
  return (
    <Pressable
      disabled={disabled || isLoading}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      {...props}
      className={`flex items-center justify-center flex-row ${
        LinkButton ? 'gap-0' : 'gap-2'
      } duration-150  ${
        disabled && !isLoading ? '!opacity-30' : '!opacity-100'
      }  ${type}-${color} ${GetPressedDesign()} ${getSizeStyles()} ${
        rounded ? '!rounded-full' : ''
      } ${Extraclass}`}>
      {isLoading ? (
        <Loading size={32} circleClassName={getIconColor()} />
      ) : (
        <>
          {LeftIcon ? (
            <View>
              <LeftIcon
                size={small ? 16 : 24}
                color={getIconColor()}
                variant={LeftIconVariant}
              />
            </View>
          ) : (
            srcLeft && (
              <Image
                source={srcLeft}
                style={{
                  resizeMode: 'contain',
                  width: small ? 20 : 32,
                  height: small ? 20 : 32,
                }}
              />
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
                size={small ? 16 : 24}
                color={getIconColor()}
                variant={RightIconVariant}
              />
            </View>
          ) : (
            srcRight && (
              <Image
                source={srcRight}
                width={small ? 20 : 32}
                height={small ? 20 : 32}
              />
            )
          )}
          {LinkButton && (!LeftIcon || !RightIcon) && (
            <View>
              <ArrowUp
                stroke={getIconColor()}
                width={small ? 20 : 32}
                height={small ? 20 : 32}
              />
            </View>
          )}
        </>
      )}
    </Pressable>
  );
}

export default BaseButton;
