import React from 'react';
import {
  View,
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
import {
  SignupSchema,
  SignupSchemaType,
} from '../../utils/validation/auth/SignupSchema';
import {SafeAreaView} from 'react-native-safe-area-context';
import {KeyboardAvoidingView} from 'react-native';
import {useMutation} from '@tanstack/react-query';
import AuthService from '../../services/AuthService';
import {handleMutationError} from '../../utils/helpers/errorHandler';
import {useGetOrganizationBySKU} from '../../utils/hooks/Organization/useGetOrganizationBySKU';
import Picker from '../../components/Picker/Picker';
import Logo from '../../components/Logo';
import {navigate} from '../../navigation/navigationRef';
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
      // navigation.push('OTP', {username: variables.username!});

      navigate('Auth', {
        screen: 'OTP',
        params: {username: variables.username!},
      });
    },
    onError: handleMutationError,
  });
  const {data: OrganizationBySKU} = useGetOrganizationBySKU();
  const onSubmit: SubmitHandler<SignupSchemaType> = async data => {
    SignUpMutation.mutate({
      email: data.email?.trim() || undefined,
      firstName: data.Name,
      gender: Number(data.gender.key),
      lastName: data.lastName,
      username: data.mobile,
      organization: OrganizationBySKU!.id,
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
      mobile: '',
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
    <View style={{flex: 1}} className="flex-1">
      <ScrollView
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: 20, flexGrow: 1}}
        showsVerticalScrollIndicator={false}
        style={{
          flex: 1,
        }}>
        <SafeAreaView className="flex-1 justify-between">
          <View>
            <View
              style={{height: screenHeight * 0.14}}
              className=" w-full flex items-center justify-center">
              <Logo />
            </View>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={{flex: 1}}>
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
                      noEnValidator
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
                      noEnValidator
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
                      name="mobile"
                      label={t('mobile')}
                      PlaceHolder={placeholders('MobileNumber')}
                      error={errors.mobile?.message}
                      accessibilityLabel="mobile input field"
                      accessibilityHint="Enter your mobile number"
                    />
                    <Picker
                      name="gender"
                      control={control}
                      label={t('gender')}
                      PlaceHolder={placeholders('gender')}
                      error={errors.gender?.message}
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
            </KeyboardAvoidingView>
          </View>
          <View
            className={`flex flex-col gap-7 ${
              bigScreen ? 'pb-6' : 'pb-6'
            } mt-auto `}>
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
            <View className="flex items-center flex-row justify-center gap-2 ">
              <BaseText
                type="button1"
                color="muted"
                accessibilityLabel="Not registered text">
                {auth('alredyRegistered')}
              </BaseText>
              <TouchableOpacity
                onPress={() => navigate('Auth', {screen: 'Login'})}
                accessibilityLabel="Navigate to login screen"
                accessibilityRole="button">
                <BaseText type="button1" color="active">
                  {auth('login')}
                </BaseText>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
};

export default SignupScreen;
