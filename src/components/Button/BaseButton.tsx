import React, {useState} from 'react';
import {IButtonProps} from '../../models/props';
import {Image, Pressable, View} from 'react-native';
import Loading from '../Spinner/Loading';
import BaseText from '../BaseText';

function BaseButton({
  size,
  color,
  type,
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

  return (
    <Pressable
      disabled={disabled || isLoading}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      {...props}
      className={`
        flex items-center justify-center gap-1 px-4
        bg-primary-400
        ${type}
     ${
       size === 'Medium'
         ? `h-[40px] ${!rounded && 'rounded-[12px]'}`
         : size === 'Large'
         ? `h-[48px] ${!rounded && 'rounded-[12px]'}`
         : `h-[32px] ${!rounded && 'rounded-[12px]'}`
     }
     ${rounded ? '!rounded-full' : ''}
      
      
      `}>
      {isLoading ? (
        <Loading size={32} />
      ) : (
        <>
          {LeftIcon && (
            <View>
              <LeftIcon variant={LeftIconVariant} />
            </View>
          )}
          {!LeftIcon && srcLeft && (
            <Image src={srcLeft} width={20} height={20} alt={srcLeft} />
          )}
          {!noText && (
            <BaseText
              color={type === 'Fill' ? 'button' : 'base'}
              type={size === 'Large' ? 'button1' : 'button2'}>
              {text}
            </BaseText>
          )}
          {RightIcon && (
            <View>
              <RightIcon variant={RightIconVariant} />
            </View>
          )}
          {!RightIcon && srcRight && (
            <Image src={srcRight} width={20} height={20} alt={srcRight} />
          )}
        </>
      )}
    </Pressable>
  );
}

export default BaseButton;
