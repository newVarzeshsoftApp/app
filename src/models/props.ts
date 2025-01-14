import { PressableProps, TextStyle } from 'react-native';
import {IColorButton, IIconVariant, ISizeButton, IStyle‌TypeButton, ITextType, TypeBadgeColor, TypeTextColor} from './stylingTypes';
import { Control, FieldValues, Path, UseFormRegister, UseFormWatch } from 'react-hook-form';
import { TextProps } from 'react-native/Libraries/Text/Text';
import { ImageSourcePropType } from 'react-native';
import { PickerOption } from '../constants/options';

export type ISpinnerProps = {
  svgClassName?: string;
  primaryPathClassName?: string;
  secondaryPathClassName?: string;
  circleClassName?:string
 };

 export interface IText extends TextProps  {
  children: React.ReactNode;
  type?: ITextType;
  className?: string;
  color?: TypeTextColor;
  style?: TextStyle;
};
export type IBadge = {
  value:string | number
  className?: string;
  rounded?:boolean
  color?: TypeBadgeColor;
  defaultMode?:boolean
  style?: TextStyle;
  textColor?:TypeTextColor
  CreditMode?:boolean
  GiftMode?:boolean
};
export interface IWheelProps {
  items: {value:string,label:string}[]; 
  onSelect: (value: string) => void;
  initialIndex: number;
}

export type MenuItem = {
  title: string;
  Icon: React.ElementType;
  slug:string
  children: { title: string,slug:string }[];
};
export interface IButtonProps extends PressableProps {
  type: IStyle‌TypeButton;             // Custom style type for the button
  size?:ISizeButton
  color:IColorButton;
  LinkButton?:boolean;
  rounded?:boolean
  text?: string;                           // Text to display inside the button
  noText?: boolean;                        // If true, hides the text
  isLoading?: boolean;                     // If true, shows a loading indicator
  srcLeft?: ImageSourcePropType;                        // Source for the left icon image
  srcRight?: ImageSourcePropType;                       // Source for the right icon image
  LeftIcon?: React.ElementType;            // Optional left icon component
  RightIcon?: React.ElementType;           // Optional right icon component
  RightIconVariant?: IIconVariant;         // Variant type for the right icon
  LeftIconVariant?: IIconVariant;          // Variant type for the left icon
  Extraclass?:string
}

export interface ICheckboxProps extends PressableProps {
  id?: string;
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  asButton?:boolean
  haveArrow?:boolean
  readonly?:boolean
}
export interface UserRadioButtonProps extends PressableProps {
  id?: string;
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  Name?: string | null;
  asButton?:boolean
  ImageUrl?:string
  placeHolder?:string
  readonly?:boolean
  genders:number
}

export type InputProps<T extends FieldValues> = {
  label?: string;                         // Label for the input field
  name: Path<T>;                            // Unique identifier (field name) for the input
  type?: string;                          // Type of the input field (e.g., text, password, number)
  control?: Control<T>;                   // Control object from React Hook Form
  required?: boolean;                     // Indicates if the field is required
  error?: string;                         // Error message for the field
  PlaceHolder?: string;                   // Placeholder text for the input field
  length?: number;                        // Maximum length of the input value
  disabled?: boolean;                     // Disables the input field
  value?: number | string;                // Current value of the input field
  onChange?: (value: any) => void;        // Callback triggered on input value change
  info?: string;                          // Additional information or hint for the field
  LeftIcon?: React.ElementType;           // Optional left icon component
  RightIcon?: React.ElementType;          // Optional right icon component
  RightIconVariant?: IIconVariant;        // Variant type for the right icon
  LeftIconVariant?: IIconVariant;         // Variant type for the left icon
  optional?:boolean
  onpress?:()=>void
  SperatedNumber?:boolean;
  centerText?:boolean
};
export interface OpenSheetParams<T extends FieldValues> extends InputProps<T> {
  title: string;
  buttonText?: string;
  buttonAction?: () => void;
  buttonDisabled?: boolean;
  Height?: number;
  DynamicHeight?: boolean;
  options: PickerOption[];
  multiple?: boolean;
  selectedItems?: any[];
  onSelect?: (items: any) => void;
  fieldKey?: string;
  fieldValue?: string;
}