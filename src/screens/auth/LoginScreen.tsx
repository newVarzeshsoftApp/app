import React, {useState} from 'react';
import {View, TouchableOpacity, Dimensions, Platform} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../utils/types/NavigationTypes';
import {
  LoginSchema,
  LoginSchemaType,
} from '../../utils/validation/auth/LoginSchema';
import {FormProvider, SubmitHandler, useForm} from 'react-hook-form';
import ControlledInput from '../../components/Input/ControlledInput';
import {zodResolver} from '@hookform/resolvers/zod';
import {useTranslation} from 'react-i18next';
import BaseText from '../../components/BaseText';
import Checkbox from '../../components/Checkbox/Checkbox';
import BaseButton from '../../components/Button/BaseButton';
import Banner from './Banner';
import {SafeAreaView} from 'react-native-safe-area-context';
import {KeyboardAvoidingView} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {showToast} from '../../components/Toast/Toast';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import AuthService from '../../services/AuthService';
import {handleMutationError} from '../../utils/helpers/errorHandler';

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC<LoginScreenProps> = ({navigation}) => {
  const [Rememberme, setRememberme] = useState(false);
  const {t} = useTranslation('translation', {keyPrefix: 'Input'});
  const queryClient = useQueryClient();
  const {t: placeholders} = useTranslation('translation', {
    keyPrefix: 'Input.placeholders',
  });
  const {t: auth} = useTranslation('translation', {
    keyPrefix: 'Auth',
  });
  const loginMutation = useMutation({
    mutationFn: AuthService.SignIN,
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({queryKey: ['Tokens']});
      navigation.getParent()?.navigate('Home');
    },
    onError: handleMutationError,
  });
  const onSubmit: SubmitHandler<LoginSchemaType> = async data => {
    loginMutation.mutate({
      organization: 1,
      password: data.password,
      username: data.username,
    });
  };

  const methods = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const {
    handleSubmit,
    control,
    formState: {errors, isValid},
  } = methods;

  const screenHeight = Dimensions.get('screen').height;

  return (
    <View className="flex-1">
      <Banner />
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 20}}
            showsVerticalScrollIndicator={false}>
            <View className="w-full flex flex-col gap-9  flex-1">
              <BaseText type="title2">{auth('login')}</BaseText>
              <FormProvider {...methods}>
                <View className="flex flex-col gap-0">
                  <ControlledInput
                    control={control}
                    name="username"
                    label={t('username')}
                    PlaceHolder={placeholders('phoneOrEmail')}
                    type="text"
                    accessibilityLabel="Username input field"
                    accessibilityHint="Enter your phone number or email"
                    error={errors.username?.message}
                  />
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
                </View>
              </FormProvider>
              <View className="flex flex-row justify-between w-full items-center">
                <Checkbox
                  onCheckedChange={setRememberme}
                  checked={Rememberme}
                  label={auth('RememberMe')}
                  accessibilityLabel="Remember me checkbox"
                  accessibilityHint="Toggle to remember your login credentials"
                />
                <TouchableOpacity
                  accessibilityLabel="Navigate to Forget Password screen"
                  onPress={() => navigation.navigate('ForgetPassword')}>
                  <BaseText type="button2" color="active">
                    {auth('ForgetPassword')}
                  </BaseText>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <View className={`w-full Container pb-6  gap-6 `}>
          <BaseButton
            onPress={handleSubmit(onSubmit)}
            type="Fill"
            color="Black"
            rounded
            isLoading={loginMutation.isPending}
            size="Large"
            text={auth('login')}
            accessibilityLabel="Login button"
            accessibilityRole="button"
            accessibilityHint="Submits the login form"
          />
          <View className="flex items-center flex-row justify-center gap-2">
            <BaseText
              type="button1"
              color="muted"
              accessibilityLabel="Not registered text">
              {auth('notRegistered')}
            </BaseText>
            <TouchableOpacity
              onPress={() => navigation.navigate('Signup')}
              accessibilityLabel="Navigate to Signup screen"
              accessibilityRole="button">
              <BaseText type="button1" color="active">
                {auth('signup')}
              </BaseText>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default LoginScreen;
