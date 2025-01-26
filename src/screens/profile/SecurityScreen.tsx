import {zodResolver} from '@hookform/resolvers/zod';
import React from 'react';
import {FormProvider, SubmitHandler, useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {KeyboardAvoidingView, Platform, Text, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {
  UpdatePasswordSchema,
  UpdatePasswordSchemaType,
} from '../../utils/validation/updateProfile/updatePassword';
import BaseText from '../../components/BaseText';
import ControlledInput from '../../components/Input/ControlledInput';
import BaseButton from '../../components/Button/BaseButton';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import UserService from '../../services/UserService';
import {showToast} from '../../components/Toast/Toast';

const SecurityScreen: React.FC = () => {
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

  const methods = useForm<UpdatePasswordSchemaType>({
    resolver: zodResolver(UpdatePasswordSchema),
    defaultValues: {
      confirmNewPassword: '',
      currentPassword: '',
      newPassword: '',
    },
  });
  const {
    handleSubmit,
    control,
    formState: {errors, isValid},
  } = methods;
  const queryClient = useQueryClient();
  const UpdatePassword = useMutation({
    mutationFn: UserService.UpdatePassword,
    onSuccess(data, variables, context) {
      showToast({text1: Profile('PasswordChanged'), type: 'success'});
      queryClient.invalidateQueries({queryKey: ['Profile']});
      methods.reset({
        confirmNewPassword: '',
        currentPassword: '',
        newPassword: '',
      });
    },
  });
  const onSubmit: SubmitHandler<UpdatePasswordSchemaType> = async data => {
    const {confirmNewPassword, currentPassword, newPassword} = data;
    UpdatePassword.mutate({
      newPassword: newPassword,
      oldPassword: currentPassword,
    });
  };
  return (
    <ScrollView
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{flexGrow: 1}}>
      <View
        style={{direction: 'rtl'}}
        className="Container flex-1 justify-between py-4 gap-6 ">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{flex: 1}}>
          <View className="w-full flex flex-col gap-4 ">
            <View className="gap-1">
              <BaseText>{Profile('Change Password')}</BaseText>
              <BaseText type="caption" color="muted">
                {Profile('You can change your password here')}
              </BaseText>
            </View>
            <FormProvider {...methods}>
              <View className="flex flex-col gap-2">
                <ControlledInput
                  control={control}
                  name="currentPassword"
                  label={t('oldPassword')}
                  PlaceHolder={placeholders('oldPassword')}
                  type="password"
                  autoComplete="off"
                  accessibilityLabel="oldPassword"
                  accessibilityHint="oldPassword"
                  error={errors.currentPassword?.message}
                />
                <ControlledInput
                  control={control}
                  name="newPassword"
                  label={t('New Password')}
                  autoComplete="off"
                  PlaceHolder={placeholders('newPassword')}
                  type="password"
                  accessibilityLabel="newPassword"
                  accessibilityHint="newPassword"
                  error={errors.newPassword?.message}
                />
                <ControlledInput
                  control={control}
                  name="confirmNewPassword"
                  autoComplete="off"
                  label={t('confirmpassword')}
                  PlaceHolder={placeholders('confirmPassword')}
                  type="password"
                  accessibilityLabel="confirmpassword"
                  accessibilityHint="confirmpassword"
                  error={errors.confirmNewPassword?.message}
                />
              </View>
            </FormProvider>
          </View>
        </KeyboardAvoidingView>
        <BaseButton
          color="Black"
          onPress={handleSubmit(onSubmit)}
          isLoading={UpdatePassword.isPending}
          type="Fill"
          text={t('Save')}
          size="Large"
          rounded
        />
      </View>
    </ScrollView>
  );
};

export default SecurityScreen;
