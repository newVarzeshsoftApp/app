import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../utils/types/NavigationTypes';
import {FormProvider, SubmitHandler, useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {zodResolver} from '@hookform/resolvers/zod';
import BaseText from '../../components/BaseText';
import ControlledInput from '../../components/Input/ControlledInput';
import BaseButton from '../../components/Button/BaseButton';
import Logo from '../../assets/icons/Logo.svg';
import LogoWithText from '../../assets/icons/LogoWithText.svg';

import {
  SignupSchema,
  SignupSchemaType,
} from '../../utils/validation/auth/SignupSchema';
import {SafeAreaView} from 'react-native-safe-area-context';
import {KeyboardAvoidingView} from 'react-native';
import {useMutation} from '@tanstack/react-query';
import AuthService from '../../services/AuthService';
import {handleMutationError} from '../../utils/helpers/errorHandler';
import {Picker, PickerIOS} from '@react-native-picker/picker';
type SignupScreenProps = NativeStackScreenProps<AuthStackParamList, 'Signup'>;
const SignupScreen: React.FC<SignupScreenProps> = ({navigation}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Input'});
  const {t: placeholders} = useTranslation('translation', {
    keyPrefix: 'Input.placeholders',
  });
  const {t: auth} = useTranslation('translation', {
    keyPrefix: 'Auth',
  });
  const SignUpMutation = useMutation({
    mutationFn: AuthService.SignUp,
    onSuccess(data, variables, context) {
      navigation.navigate('OTP', {username: variables.username!});
    },
    onError: handleMutationError,
  });
  const onSubmit: SubmitHandler<SignupSchemaType> = async data => {
    SignUpMutation.mutate({
      email: data.email,
      firstName: data.Name,
      gender: 0,
      lastName: data.lastName,
      username: data.phone,
      organization: 1,
      password: data.password,
    });
  };

  const methods = useForm<SignupSchemaType>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      email: '',
      lastName: '',
      Name: '',
      password: '',
      phone: '',
    },
  });
  const {
    handleSubmit,
    control,
    formState: {errors, isValid},
  } = methods;
  const {width: screenWidth, height: screenHeight} = Dimensions.get('screen');
  const [selectedLanguage, setSelectedLanguage] = useState();
  const bigScreen = screenHeight > 800;
  return (
    <SafeAreaView className="flex-1">
      <View
        style={{height: screenHeight * (bigScreen ? 0.21 : 0.11)}}
        className=" w-full flex items-center justify-center">
        <View className="flex flex-row gap-4">
          <LogoWithText width={155} height={55} />
          <Logo width={55} height={55} />
        </View>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 20}}
          showsVerticalScrollIndicator={false}>
          <View className="w-full flex flex-col gap-9 ">
            <BaseText type="title2">{auth('signup')}</BaseText>
            <FormProvider {...methods}>
              <View className="flex flex-col gap-0">
                <ControlledInput
                  control={control}
                  name="Name"
                  label={t('firstName')}
                  PlaceHolder={placeholders('Name')}
                  type="text"
                  accessibilityLabel="full Name input field"
                  accessibilityHint="Enter your full Name"
                  error={errors.Name?.message}
                />
                <ControlledInput
                  control={control}
                  name="lastName"
                  label={t('lastName')}
                  PlaceHolder={placeholders('lastName')}
                  type="text"
                  accessibilityLabel="full Name input field"
                  accessibilityHint="Enter your full Name"
                  error={errors.lastName?.message}
                />
                {/* Password Input */}
                <ControlledInput
                  control={control}
                  name="password"
                  label={t('password')}
                  PlaceHolder={placeholders('password')}
                  type="password"
                  error={errors.password?.message}
                  accessibilityLabel="Password input field"
                  accessibilityHint="Enter your password"
                />
                <ControlledInput
                  control={control}
                  name="phone"
                  label={t('phone')}
                  PlaceHolder={placeholders('phoneNumber')}
                  error={errors.phone?.message}
                  accessibilityLabel="phone input field"
                  accessibilityHint="Enter your phone number"
                />
                <ControlledInput
                  control={control}
                  name="email"
                  label={t('email')}
                  PlaceHolder={placeholders('email')}
                  type="email"
                  optional
                  error={errors.email?.message}
                  accessibilityLabel="email input field"
                  accessibilityHint="Enter your email"
                />
              </View>
            </FormProvider>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <View
        className={`flex flex-col gap-7 Container ${
          bigScreen ? 'pb-6' : 'pb-6'
        } `}>
        <BaseButton
          onPress={handleSubmit(onSubmit)}
          type="Fill"
          color="Black"
          rounded
          size="Large"
          isLoading={SignUpMutation.isPending}
          text={auth('signup')}
          accessibilityLabel="signup button"
          accessibilityRole="button"
          accessibilityHint="Submits the signup form"
        />
        <View className="flex items-center flex-row justify-center gap-2">
          <BaseText
            type="button1"
            color="muted"
            accessibilityLabel="Not registered text">
            {auth('alredyRegistered')}
          </BaseText>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            accessibilityLabel="Navigate to login screen"
            accessibilityRole="button">
            <BaseText type="button1" color="active">
              {auth('login')}
            </BaseText>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignupScreen;
