import React, {useEffect} from 'react';
import {KeyboardAvoidingView, Platform, Text, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import UpdateProfilePicture from './Components/UpdateProfilePicture';
import {FormProvider, SubmitHandler, useForm} from 'react-hook-form';
import {
  UpdateProfileSchema,
  UpdateProfileSchemaType,
} from '../../utils/validation/updateProfile/UpdateProfileSchema';
import {zodResolver} from '@hookform/resolvers/zod';
import BaseText from '../../components/BaseText';
import ControlledInput from '../../components/Input/ControlledInput';
import {useTranslation} from 'react-i18next';
import BaseButton from '../../components/Button/BaseButton';
import Picker from '../../components/Picker/Picker';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import UserService from '../../services/UserService';
import {getGender} from '../../utils/helpers/helpers';
import {useAuth} from '../../utils/hooks/useAuth';

const PersonalInfoScreen: React.FC = () => {
  const {profile} = useAuth();

  const {t} = useTranslation('translation', {
    keyPrefix: 'Input',
  });
  const {t: Profile} = useTranslation('translation', {
    keyPrefix: 'Profile',
  });
  const {t: placeholders} = useTranslation('translation', {
    keyPrefix: 'Input.placeholders',
  });
  const {t: auth} = useTranslation('translation', {
    keyPrefix: 'Auth',
  });

  const methods = useForm<UpdateProfileSchemaType>({
    resolver: zodResolver(UpdateProfileSchema),
  });

  useEffect(() => {
    if (profile) {
      methods.reset({
        firstName: profile?.firstName,
        birthday: {gregorianDate: profile?.birthDate ?? undefined},
        lastName: profile?.lastName,
        nationalCode: profile?.nationCode ?? undefined,
        address: profile?.address ?? undefined,
        email: profile?.email ?? undefined,
        phone: profile?.phone ?? undefined,
        gender: getGender(profile.gender),
        mobile: profile?.mobile,
      });
    }
  }, [profile]);

  const {
    handleSubmit,
    control,
    formState: {errors, isValid},
  } = methods;
  const queryClient = useQueryClient();
  const UpdateProfile = useMutation({
    mutationFn: UserService.UpdateProfile,
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({queryKey: ['Profile']});
    },
  });
  const onSubmit: SubmitHandler<UpdateProfileSchemaType> = async data => {
    const {
      birthday,
      firstName,
      lastName,
      address,
      email,
      gender,
      nationalCode,
      phone,
    } = data;
    UpdateProfile.mutate({
      birthDate: birthday.gregorianDate,
      firstName,
      lastName,
      gender: Number(gender?.key),
      nationCode: nationalCode,
      phone,
      address,
      email,
    });
  };
  return (
    <ScrollView
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{flexGrow: 1}}>
      <View
        style={{direction: 'rtl'}}
        className="Container flex-1 justify-between py-4 gap-6">
        {/* ProfilePicture */}
        <UpdateProfilePicture />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{flex: 1}}>
          <View className="w-full flex flex-col gap-4 ">
            <View className="gap-1">
              <BaseText>{Profile('Personal Info')}</BaseText>
              <BaseText type="caption" color="muted">
                {Profile(
                  'This section is for updating your personal information',
                )}
              </BaseText>
            </View>
            <FormProvider {...methods}>
              <View className="flex flex-col gap-2">
                <ControlledInput
                  control={control}
                  name="firstName"
                  label={t('firstName')}
                  PlaceHolder={placeholders('Name')}
                  type="text"
                  noEnValidator
                  accessibilityLabel="full Name input field"
                  accessibilityHint="Enter your full Name"
                  error={errors.firstName?.message}
                />
                <ControlledInput
                  control={control}
                  name="lastName"
                  label={t('lastName')}
                  PlaceHolder={placeholders('lastName')}
                  type="text"
                  noEnValidator
                  accessibilityLabel="full Name input field"
                  accessibilityHint="Enter your full Name"
                  error={errors.lastName?.message}
                />
                <ControlledInput
                  control={control}
                  name="email"
                  label={t('email')}
                  PlaceHolder={placeholders('email')}
                  type="email"
                  autoComplete="off"
                  autoCorrect={false}
                  spellCheck={false}
                  keyboardType="default"
                  optional
                  error={errors.email?.message}
                  accessibilityLabel="email input field"
                  accessibilityHint="Enter your email"
                />
                <ControlledInput
                  control={control}
                  name="mobile"
                  label={t('mobile')}
                  disabled
                  PlaceHolder={placeholders('MobileNumber')}
                  error={errors.mobile?.message}
                  accessibilityLabel="phone input field"
                  accessibilityHint="Enter your phone number"
                />
                <ControlledInput
                  control={control}
                  name="phone"
                  info={placeholders('write with city code')}
                  label={t('phone')}
                  PlaceHolder={placeholders('phoneNumber')}
                  error={errors.phone?.message}
                  accessibilityLabel="phone input field"
                  accessibilityHint="Enter your phone number"
                />
                <ControlledInput
                  control={control}
                  name="address"
                  label={t('Address')}
                  PlaceHolder={placeholders('address')}
                  noEnValidator
                  error={errors.address?.message}
                  accessibilityLabel="address input field"
                  accessibilityHint="Enter your address"
                />
                <Picker
                  name="birthday"
                  control={control}
                  label={t('birthDate')}
                  PickerType="DatePicker"
                  PlaceHolder={placeholders('dateOfBirth')}
                />
                <Picker
                  name="gender"
                  PickerType="GenderPicker"
                  control={control}
                  label={t('gender')}
                  PlaceHolder={placeholders('gender')}
                />
              </View>
            </FormProvider>
          </View>
        </KeyboardAvoidingView>
        <BaseButton
          color="Black"
          isLoading={UpdateProfile.isPending}
          onPress={handleSubmit(onSubmit)}
          type="Fill"
          text={t('Save')}
          size="Large"
          rounded
        />
      </View>
    </ScrollView>
  );
};

export default PersonalInfoScreen;
