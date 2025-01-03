import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
  TextBase,
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
import ResponsiveImage from '../../components/ResponsiveImage';
import Picker from '../../components/Picker/Picker';
import RadioButton from '../../components/Button/RadioButton/RadioButton';
import {PickerOption, genders} from '../../constants/options';
import {useBottomSheet} from '../../components/BottomSheet/BottomSheetProvider';
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
      navigation.push('OTP', {username: variables.username!});
    },
    onError: handleMutationError,
  });
  const {data: OrganizationBySKU} = useGetOrganizationBySKU();
  const onSubmit: SubmitHandler<SignupSchemaType> = async data => {
    SignUpMutation.mutate({
      email: data.email,
      firstName: data.Name,
      gender: 0,
      lastName: data.lastName,
      username: data.phone,
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
      phone: '',
    },
  });
  const {
    handleSubmit,
    control,
    formState: {errors, isValid},
  } = methods;
  const {width: screenWidth, height: screenHeight} = Dimensions.get('screen');
  const bigScreen = screenHeight > 800;
  const [selectedGender, setselectedGender] = useState<PickerOption | null>(
    null,
  );
  // const {showBottomSheet, BottomSheetConfig, hideBottomSheet} =
  //   useBottomSheet();
  // const handleGenderSelect = () => {
  //   methods.setValue('gender', selectedGender!);
  //   hideBottomSheet();
  // };

  // useEffect(() => {
  //   BottomSheetConfig({
  //     buttonDisabled: selectedGender === null,
  //     activeHeight: screenHeight * 0.4,
  //     Title: auth('Select Gender'),
  //     buttonText: auth('Continue'),
  //     onButtonPress: handleGenderSelect,
  //     children: (
  //       <View
  //         key={selectedGender ? selectedGender.key : 'default'}
  //         className="gap-3">
  //         {genders.map(item => (
  //           <RadioButton
  //             key={item.key}
  //             asButton
  //             checked={selectedGender ? selectedGender.key === item.key : false}
  //             onCheckedChange={() => setselectedGender(item)}
  //             label={item.value}
  //           />
  //         ))}
  //       </View>
  //     ),
  //   });
  // }, [selectedGender]);
  // const openGenderSelect = () => {
  //   showBottomSheet();
  // };

  return (
    <>
      {/* <BottomSheet
        ref={sheetRef}
        activeHeight={height * 0.4}
        Title={auth('Select Gender')}
        buttonText={auth(`Continue`)}
        buttonDisabled={selectedGender === null}
        onButtonPress={() => handleGenderSelect()}>
        <View className="gap-3">
          {genders.map((item, index) => (
            <RadioButton
              key={item.key}
              asButton
              checked={selectedGender ? selectedGender.key === item.key : false}
              onCheckedChange={() => setselectedGender(item)}
              label={item.value}
            />
          ))}
        </View>
      </BottomSheet> */}
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
                style={{height: screenHeight * 0.1}}
                className=" w-full flex items-center justify-center ">
                <View className="flex flex-row gap-4 w-[185px] h-[55px] ">
                  <ResponsiveImage
                    customSource={OrganizationBySKU?.brandedLogo.srcset}
                    fallback={require('../../assets/images/testImage.png')}
                    resizeMode="contain"
                  />
                </View>
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
                      <Picker
                        name="gender"
                        control={control}
                        label={t('gender')}
                        PlaceHolder={placeholders('gender')}
                        // onpress={openGenderSelect}
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
                  onPress={() => navigation.push('Login')}
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
    </>
  );
};

export default SignupScreen;
