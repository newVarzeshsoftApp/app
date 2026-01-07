import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Controller, FieldValues, useWatch} from 'react-hook-form';
import {TextInputProps, TouchableOpacity, View} from 'react-native';
import {InputProps} from '../../models/props';
import BaseText from '../BaseText';
import {useTranslation} from 'react-i18next';
import {InfoCircle} from 'iconsax-react-native';
import BottomSheet, {BottomSheetMethods} from '../BottomSheet/BottomSheet';
import {genders, PickerOption} from '../../constants/options';
import RadioButton from '../Button/RadioButton/RadioButton';
import JalaliDatePicker, {DateSelectorState} from './DatePicker/DatePicker';
import moment from 'jalali-moment';

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
  PickerType = 'GenderPicker',
  ...props
}: InputProps<T> & TextInputProps) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Input'});
  const sheetRef = useRef<BottomSheetMethods>(null);
  const {t: auth} = useTranslation('translation', {
    keyPrefix: 'Auth',
  });
  const fieldValue = useWatch({
    control,
    name,
  });
  useEffect(() => {
    if (PickerType === 'GenderPicker') {
      setselectedGender(fieldValue);
    } else if (PickerType === 'DatePicker') {
      setselectedDate(fieldValue);
    }
  }, [fieldValue, PickerType]);

  const [selectedGender, setselectedGender] = useState<PickerOption | null>(
    null,
  );
  const [selectedDate, setselectedDate] = useState<DateSelectorState | null>(
    null,
  );

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
          render={({field: {onChange, onBlur, value}}) => {
            return (
              <>
                {PickerType === 'GenderPicker' ? (
                  <BottomSheet
                    ref={sheetRef}
                    snapPoints={[50]}
                    Title={auth('Select Gender')}
                    buttonText={auth(`Continue`)}
                    buttonDisabled={value === null}
                    onButtonPress={() => {
                      onChange(selectedGender);
                      sheetRef.current?.close();
                    }}>
                    <View className="gap-3">
                      {genders.map((item, index) => {
                        return (
                          <RadioButton
                            key={item.key}
                            asButton
                            checked={
                              selectedGender
                                ? selectedGender.key === item.key
                                : false
                            }
                            onCheckedChange={() => setselectedGender(item)}
                            label={item.value}
                          />
                        );
                      })}
                    </View>
                  </BottomSheet>
                ) : (
                  <BottomSheet
                    ref={sheetRef}
                    snapPoints={[60]}
                    Title="انتخاب تاریخ"
                    buttonText="تایید"
                    disablePan={true}
                    onButtonPress={() => {
                      onChange(selectedDate);
                      sheetRef.current?.close();
                    }}>
                    <JalaliDatePicker
                      onChange={setselectedDate}
                      initialValue={value}
                    />
                  </BottomSheet>
                )}
                <TouchableOpacity
                  onPress={sheetRef.current?.expand}
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
                  <BaseText
                    color={
                      PickerType === 'GenderPicker' && !value
                        ? 'muted'
                        : PickerType === 'DatePicker' &&
                          (!value || !value.gregorianDate)
                        ? 'muted'
                        : 'base'
                    }
                    type="caption"
                    className={`absolute ${
                      LeftIcon
                        ? 'left-[20%] rtl:right-[20%]'
                        : 'left-[6%] rtl:right-[6%]'
                    } rtl:text-left w-fit`}
                    style={{pointerEvents: 'none'}}>
                    {PickerType === 'GenderPicker' && !value
                      ? PlaceHolder
                      : PickerType === 'DatePicker' &&
                        (!value || !value.gregorianDate)
                      ? PlaceHolder
                      : PickerType === 'GenderPicker'
                      ? value.value
                      : moment(value.gregorianDate).format('jYYYY/jMM/jDD')}
                  </BaseText>
                </TouchableOpacity>
              </>
            );
          }}
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
