import React from 'react';
import {
  View,
  Text,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../utils/types/NavigationTypes';
import {FormProvider, SubmitHandler, useForm} from 'react-hook-form';
import {
  ForgetPasswordSchema,
  ForgetPasswordSchemaType,
} from '../../utils/validation/auth/ForgetPasswordSchema';
import {zodResolver} from '@hookform/resolvers/zod';
import {SafeAreaView} from 'react-native-safe-area-context';

import BaseText from '../../components/BaseText';
import ControlledInput from '../../components/Input/ControlledInput';
import {useTranslation} from 'react-i18next';
import BaseButton from '../../components/Button/BaseButton';
import {ArrowLeft, ArrowRight2} from 'iconsax-react-native';
import {useMutation} from '@tanstack/react-query';
import AuthService from '../../services/AuthService';
import {handleMutationError} from '../../utils/helpers/errorHandler';
import {useGetOrganizationBySKU} from '../../utils/hooks/Organization/useGetOrganizationBySKU';
import ResponsiveImage from '../../components/ResponsiveImage';
import Logo from '../../components/Logo';

type ForgetPasswordScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'ForgetPassword'
>;

const ForgetPasswordScreen: React.FC<ForgetPasswordScreenProps> = ({
  navigation,
}) => {
  const {data: OrganizationBySKU} = useGetOrganizationBySKU();

  const {t} = useTranslation('translation', {keyPrefix: 'Input'});
  const {t: placeholders} = useTranslation('translation', {
    keyPrefix: 'Input.placeholders',
  });
  const {t: auth} = useTranslation('translation', {
    keyPrefix: 'Auth',
  });
  const RequestOTP = useMutation({
    mutationFn: AuthService.RequestOTP,
    onSuccess(data, variables) {
      navigation.push('OTP', {
        username: variables.username,
        resetPassword: true,
      });
    },
    onError: handleMutationError,
  });
  const onSubmit: SubmitHandler<ForgetPasswordSchemaType> = async data => {
    RequestOTP.mutate({
      organization: OrganizationBySKU!.id,
      username: data.username,
    });
  };

  const methods = useForm<ForgetPasswordSchemaType>({
    resolver: zodResolver(ForgetPasswordSchema),
    defaultValues: {
      username: '',
    },
  });
  const {
    handleSubmit,
    control,
    formState: {errors},
  } = methods;
  const {height: screenHeight} = Dimensions.get('screen');
  const bigScreen = screenHeight > 800;

  return (
    <View className="flex-1  justify-between pt-20 Container">
      <View className="flex-1">
        <View
          style={{height: screenHeight * 0.14}}
          className=" w-full flex items-center justify-center">
          <Logo />
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{flex: 1}}>
          <View className="w-full flex flex-col gap-9 ">
            <View className="gap-3">
              <BaseText type="title2">{auth('ForgetPassword')}</BaseText>
              <BaseText type="subtitle2" color="muted">
                {auth('ForgetPasswordInfo')}
              </BaseText>
            </View>
            <FormProvider {...methods}>
              <View className="flex flex-col gap-4">
                <ControlledInput
                  control={control}
                  name="username"
                  label={t('username')}
                  PlaceHolder={placeholders('username')}
                  type="text"
                  accessibilityLabel="username input field"
                  accessibilityHint="Enter your username"
                  error={errors.username?.message}
                />
                {/* Password Input */}
              </View>
            </FormProvider>
          </View>
        </KeyboardAvoidingView>
      </View>
      <View className={`flex flex-col gap-7  ${bigScreen ? 'pb-6' : 'pb-6'} `}>
        <BaseButton
          type="Fill"
          onPress={handleSubmit(onSubmit)}
          color="Black"
          rounded
          size="Large"
          text={auth('Continue')}
          isLoading={RequestOTP.isPending}
          disabled={RequestOTP.isPending}
          accessibilityLabel="Login button"
          accessibilityRole="button"
          accessibilityHint="Submits the login form"
        />
      </View>
    </View>
  );
};

export default ForgetPasswordScreen;
