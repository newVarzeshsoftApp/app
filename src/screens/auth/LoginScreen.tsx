import React, {useEffect, useState} from 'react';
import {
  View,
  TouchableOpacity,
  Dimensions,
  Platform,
  I18nManager,
} from 'react-native';
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
import {KeyboardAvoidingView} from 'react-native';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import AuthService from '../../services/AuthService';
import {handleMutationError} from '../../utils/helpers/errorHandler';
import {useGetOrganizationBySKU} from '../../utils/hooks/Organization/useGetOrganizationBySKU';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import ResponsiveImage from '../../components/ResponsiveImage';
import {BlurView} from '@react-native-community/blur';
import {getColors} from 'react-native-image-colors';
import LinearGradient from 'react-native-linear-gradient';
import Logo from '../../components/Logo';
import {navigate, resetNavigationHistory} from '../../navigation/navigationRef';
import {MediaService} from '../../services/MediaService';

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC<LoginScreenProps> = ({navigation}) => {
  const [Rememberme, setRememberme] = useState(false);
  const {data: organization} = useGetOrganizationBySKU();
  const {t} = useTranslation('translation', {keyPrefix: 'Input'});
  const queryClient = useQueryClient();
  const [GradientColors, setGradientColors] = useState<string[] | null>(null);
  const {t: placeholders} = useTranslation('translation', {
    keyPrefix: 'Input.placeholders',
  });
  const {t: auth} = useTranslation('translation', {
    keyPrefix: 'Auth',
  });

  useEffect(() => {
    if (!organization || GradientColors) return;
    const logoUrl =
      organization?.officialLogo?.srcset?.['default'] ||
      organization?.brandedLogo?.srcset?.['default'];
    if (!logoUrl) return;
    const url = MediaService.GetImageUrl(logoUrl, 'App');
    getColors(url, {
      fallback: '#228B22',
      cache: true,
      key: url,
      pixelSpacing: 10,
      quality: 'highest',
    })
      .then(colors => {
        const filteredColors = Object?.keys(colors)
          ?.filter(key => key !== 'platform')
          ?.map(key => (colors as any)[key]);
        setGradientColors(filteredColors);
      })
      .catch(error => console.error('Error fetching colors:', error));
  }, [organization, GradientColors]);

  const loginMutation = useMutation({
    mutationFn: AuthService.SignIN,
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({queryKey: ['Tokens']});
      resetNavigationHistory();
      navigate('Root', {screen: 'HomeNavigator'});
    },
    onError: handleMutationError,
  });
  const onSubmit: SubmitHandler<LoginSchemaType> = async data => {
    loginMutation.mutate({
      organization: organization?.id ?? 0,
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
  const scrollY = useSharedValue(0);
  const IMageHight = screenHeight * 0.3;
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });
  const ImageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [-IMageHight, 0, IMageHight],
            [-IMageHight / 2, 0, IMageHight * 0.75],
          ),
        },
        {
          scale: interpolate(
            scrollY.value,
            [-IMageHight, 0, IMageHight],
            [2, 1, 1],
          ),
        },
      ],
    };
  });
  const LogoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(
            scrollY.value,
            [0, IMageHight],
            [1, 0.1],
            Extrapolate.CLAMP,
          ),
        },
        {
          translateY: interpolate(
            scrollY.value,
            [0, IMageHight],
            [0, screenHeight * -0.15],
            Extrapolate.CLAMP,
          ),
        },
      ],
    };
  });

  return (
    <View className="flex-1">
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{flexGrow: 1}}
        showsVerticalScrollIndicator={false}
        style={{flex: 1}}>
        <View className="flex-1">
          <Animated.View
            style={[
              {
                width: '100%',
                height: IMageHight,
                overflow: 'hidden',
              },
              ImageAnimatedStyle,
            ]}
            className={`w-full overflow-hidden relative`}>
            <LinearGradient
              colors={GradientColors || ['#000000']}
              style={{
                width: '100%',
                height: screenHeight * 0.6,
              }}
            />
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  flexDirection: 'row',
                  gap: 4,
                  zIndex: 20,
                  height: IMageHight,
                  width: '100%',
                  top: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                LogoAnimatedStyle,
              ]}>
              <Logo />
            </Animated.View>
            {Platform.OS === 'web' ? (
              <View className="w-full absolute  top-0 left-0 h-full backdrop-blur-3xl bg-black/40"></View>
            ) : (
              <BlurView
                style={{
                  position: 'absolute',
                  zIndex: 0,
                  bottom: 100,
                  width: '100%',
                  height: screenHeight * 0.6,
                }}
                blurType="chromeMaterial"
                blurAmount={16}
              />
            )}
          </Animated.View>
          <KeyboardAvoidingView
            className="flex-1 Container border-t bg-neutral-0 dark:bg-neutral-dark-0  border-white dark:border-neutral-dark-300 pt-4 pb-6"
            keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
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

                  <Checkbox
                    onCheckedChange={setRememberme}
                    checked={Rememberme}
                    label={auth('RememberMe')}
                    accessibilityLabel="Remember me checkbox"
                    accessibilityHint="Toggle to remember your login credentials"
                  />
                </View>
              </FormProvider>
              <View className="flex flex-row justify-between w-full items-center">
                <TouchableOpacity
                  accessibilityLabel="Navigate to Forget Password screen"
                  onPress={() => navigate('Auth', {screen: 'LoginWithOTP'})}>
                  <BaseText type="button2" color="secondary">
                    {auth('LoginWithOTP')}
                  </BaseText>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityLabel="Navigate to Forget Password screen"
                  onPress={() => navigate('Auth', {screen: 'ForgetPassword'})}>
                  <BaseText type="button2" color="active">
                    {auth('ForgetPassword')}
                  </BaseText>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
        <View className={`w-full Container pb-6  gap-6  `}>
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
              onPress={() => navigate('Auth', {screen: 'Signup'})}
              accessibilityLabel="Navigate to Signup screen"
              accessibilityRole="button">
              <BaseText type="button1" color="active">
                {auth('signup')}
              </BaseText>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default LoginScreen;
