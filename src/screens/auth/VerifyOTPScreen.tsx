import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import {AuthStackParamList} from '../../utils/types/NavigationTypes';
import {SafeAreaView} from 'react-native-safe-area-context';
import Logo from '../../assets/icons/Logo.svg';
import LogoWithText from '../../assets/icons/LogoWithText.svg';
import BaseText from '../../components/BaseText';
import BaseButton from '../../components/Button/BaseButton';
import {useTranslation} from 'react-i18next';
import {Edit2} from 'iconsax-react-native';
import OTPCode from '../../components/OTP/OTPCode';
import CountdownTimer from '../../components/CountDown/CountDownTimer';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {Config} from '../../constants/options';
import AuthService from '../../services/AuthService';
import {handleMutationError} from '../../utils/helpers/errorHandler';
import {showToast} from '../../components/Toast/Toast';
import {useGetOrganizationBySKU} from '../../utils/hooks/Organization/useGetOrganizationBySKU';
import ResponsiveImage from '../../components/ResponsiveImage';
type VerifyOTPScreenProps = NativeStackScreenProps<AuthStackParamList, 'OTP'>;

const VerifyOTPScreen: React.FC<VerifyOTPScreenProps> = ({
  navigation,
  route,
}) => {
  const [reset, setReset] = useState(false);
  const [CanResend, setCanResend] = useState(false);
  const [OTP, setOTP] = useState<string>('');
  const [error, setError] = useState(false);
  const queryClient = useQueryClient();
  const {data: OrganizationBySKU} = useGetOrganizationBySKU();

  const {width: screenWidth, height: screenHeight} = Dimensions.get('screen');
  const bigScreen = screenHeight > 800;
  const {t: auth} = useTranslation('translation', {
    keyPrefix: 'Auth',
  });
  const VerifyToken = useMutation({
    mutationFn: AuthService.VerifyToken,
    onSuccess(data, variables, context) {
      if (route.params.resetPassword === true) {
        navigation.push('ResetPassword');
      } else {
        queryClient.invalidateQueries({queryKey: ['Tokens']});
        navigation.getParent()?.navigate('Root');
      }
    },
    onError: handleMutationError,
  });
  const ResendCode = useMutation({
    mutationFn: AuthService.RequestOTP,
    onSuccess(data) {
      if (data.result) {
        showToast({type: 'success', text1: 'Code send'});
        resetOTPInput();
      }
    },
    onError: handleMutationError,
  });
  const resetOTPInput = () => {
    setReset(true);
    setOTP('');
    setError(false);
    setTimeout(() => {
      setReset(false);
      setCanResend(false);
    }, 500);
  };
  useEffect(() => {
    if (OTP.length === Config.OTPLength) {
      VerifyToken.mutate({
        code: OTP,
        organization: OrganizationBySKU!.id,
        username: route.params.username,
      });
    }
  }, [OTP]);

  return (
    <SafeAreaView className="flex-1 justify-between ">
      <View>
        <View
          style={{height: screenHeight * (bigScreen ? 0.21 : 0.11)}}
          className=" w-full flex items-center justify-center">
          <View className="flex flex-row gap-4 w-[185px] h-[55px]">
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
          <ScrollView
            contentContainerStyle={{paddingHorizontal: 16}}
            showsVerticalScrollIndicator={false}>
            <View className="w-full flex flex-col gap-16 ">
              <View className="gap-4">
                <BaseText type="title2">
                  {auth('Enter the verification code')}
                </BaseText>
                <View className="flex-row items-center gap-2">
                  <BaseText type="subtitle2" color="muted">
                    {auth('Code on')}
                  </BaseText>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.push(
                        route.params.LoginWithOTP
                          ? 'LoginWithOTP'
                          : 'ForgetPassword',
                      )
                    }
                    className="flex-row gap-1">
                    <Edit2 size="14" color="#BCDD64" variant="Bold" />
                    <BaseText type="subtitle2" color="active">
                      {route.params.username}
                    </BaseText>
                  </TouchableOpacity>
                  <BaseText type="subtitle2" color="muted">
                    {auth('was send')}
                  </BaseText>
                </View>
              </View>
              <View className="mx-auto items-center  gap-16">
                <OTPCode
                  error={error}
                  onChange={setOTP}
                  value={OTP}
                  length={Config.OTPLength}
                />
                <CountdownTimer
                  reset={reset}
                  initialTime={Config.CountDownTimer}
                  onComplete={() => setCanResend(true)}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
      <View
        className={`flex flex-col gap-7 Container ${
          bigScreen ? 'pb-6' : 'pb-6'
        } `}>
        <BaseButton
          onPress={() =>
            VerifyToken.mutate({
              code: OTP,
              organization: 0,
              username: route.params.username,
            })
          }
          type="Fill"
          color="Black"
          rounded
          size="Large"
          text={auth(`Continue`)}
          disabled={OTP.length !== Config.OTPLength || VerifyToken.isPending}
          isLoading={VerifyToken.isPending}
          accessibilityLabel="Continue button"
          accessibilityRole="button"
          accessibilityHint="Continue the verify form"
        />
        <View className="flex items-center flex-row justify-center gap-2">
          <BaseText
            type="button1"
            color="muted"
            accessibilityLabel="Didn't get the code">
            {auth(`Didn't get the code`)}
          </BaseText>
          <TouchableOpacity
            onPress={() =>
              ResendCode.mutate({
                organization: 1,
                username: route.params.username,
              })
            }
            accessibilityLabel="Resend the code"
            accessibilityRole="button"
            disabled={!CanResend}>
            <BaseText type="button1" color={!CanResend ? 'muted' : 'active'}>
              {auth('Resend the code')}
            </BaseText>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default VerifyOTPScreen;
