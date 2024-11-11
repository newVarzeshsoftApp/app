import { PressableProps } from 'react-native';
import {IColorButton, IIconVariant, ISizeButton, IStyle‌TypeButton, ITextType, TypeTextColor} from './stylingTypes';
export type ISpinnerProps = {
  svgClassName?: string;
  primaryPathClassName?: string;
  secondaryPathClassName?: string;
  circleClassName?:string
 };
 
export type IText = {
  children: React.ReactNode;
  type?: ITextType;
  className?: string;
  color?: TypeTextColor;
};
export interface IButtonProps extends PressableProps {
  type: IStyle‌TypeButton;             // Custom style type for the button
  size?:ISizeButton
  color:IColorButton;
  rounded?:boolean
  text?: string;                           // Text to display inside the button
  noText?: boolean;                        // If true, hides the text
  isLoading?: boolean;                     // If true, shows a loading indicator
  srcLeft?: string;                        // Source for the left icon image
  srcRight?: string;                       // Source for the right icon image
  LeftIcon?: React.ElementType;            // Optional left icon component
  RightIcon?: React.ElementType;           // Optional right icon component
  RightIconVariant?: IIconVariant;         // Variant type for the right icon
  LeftIconVariant?: IIconVariant;          // Variant type for the left icon
}