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
import Logo from '../../assets/icons/Logo.svg';
import LogoWithText from '../../assets/icons/LogoWithText.svg';
import BaseText from '../../components/BaseText';
import ControlledInput from '../../components/Input/ControlledInput';
import {useTranslation} from 'react-i18next';
import BaseButton from '../../components/Button/BaseButton';
import {ArrowLeft, ArrowRight2} from 'iconsax-react-native';

type ForgetPasswordScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'ForgetPassword'
>;

const ForgetPasswordScreen: React.FC<ForgetPasswordScreenProps> = ({
  navigation,
}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Input'});
  const {t: placeholders} = useTranslation('translation', {
    keyPrefix: 'Input.placeholders',
  });
  const {t: auth} = useTranslation('translation', {
    keyPrefix: 'Auth',
  });
  const onSubmit: SubmitHandler<ForgetPasswordSchemaType> = async data => {};

  const methods = useForm<ForgetPasswordSchemaType>({
    resolver: zodResolver(ForgetPasswordSchema),
    defaultValues: {
      username: '',
    },
  });
  const {
    handleSubmit,
    control,
    formState: {errors, isValid},
  } = methods;
  const {width: screenWidth, height: screenHeight} = Dimensions.get('screen');
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
            <View>
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
        </ScrollView>
      </KeyboardAvoidingView>
      <View
        className={`flex flex-col gap-7 Container ${
          bigScreen ? 'pb-6' : 'pb-6'
        } `}>
        <BaseButton
          type="Fill"
          onPress={handleSubmit(onSubmit)}
          color="Black"
          rounded
          size="Large"
          text={auth('Continue')}
          disabled={!isValid}
          accessibilityLabel="Login button"
          accessibilityRole="button"
          accessibilityHint="Submits the login form"
        />
      </View>
    </SafeAreaView>
  );
};

export default ForgetPasswordScreen;
