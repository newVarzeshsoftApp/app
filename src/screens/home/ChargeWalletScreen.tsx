import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  memo,
} from 'react';
import {useTranslation} from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import {useTheme} from '../../utils/ThemeContext';
import NavigationHeader from '../../components/header/NavigationHeader';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {WalletStackParamList} from '../../utils/types/NavigationTypes';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import WalletBalance from './components/WalletBalance';
import {Add, Gift, Minus, MoneyRecive} from 'iconsax-react-native';
import BaseText from '../../components/BaseText';
import BaseButton from '../../components/Button/BaseButton';
import {formatNumber} from '../../utils/helpers/helpers';
import ControlledInput from '../../components/Input/ControlledInput';
import {FormProvider, SubmitHandler, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {AmountSchema, AmountSchemaType} from '../../utils/validation/amount';
import {useMutation} from '@tanstack/react-query';
import {PaymentService} from '../../services/PaymentService';
import {handleMutationError} from '../../utils/helpers/errorHandler';
import {useGetGetway} from '../../utils/hooks/Getway/useGetGetway';
import {navigate} from '../../navigation/navigationRef';
import {useGetAllWalletGift} from '../../utils/hooks/User/useGetAllWalletGift';
type WalletScreenProps = NativeStackScreenProps<
  WalletStackParamList,
  'ChargeWalletScreen'
>;
const ChargeWalletScreen: React.FC<WalletScreenProps> = ({
  navigation,
  route,
}) => {
  const {data: walletGift} = useGetAllWalletGift({});
  useEffect(() => {
    const parent = navigation.getParent();
    // Hide the tab bar when ChargeWalletScreen is focused
    parent?.setOptions({tabBarStyle: {display: 'none'}});

    return () => {
      // Show the tab bar again when leaving ChargeWalletScreen
      parent?.setOptions({tabBarStyle: {display: 'flex'}});
    };
  }, [navigation]);
  const {t} = useTranslation('translation', {keyPrefix: 'Wallet'});
  const {t: Input} = useTranslation('translation', {keyPrefix: 'Input'});
  const {t: placeholders} = useTranslation('translation', {
    keyPrefix: 'Input.placeholders',
  });
  const {data: Getways, isLoading} = useGetGetway();
  const scrollY = useSharedValue(0);
  const {theme} = useTheme();
  const BaseColor = theme === 'dark' ? '#232529' : 'rgba(244,244,245,0.3)';
  const [selectedGateway, setSelectedGateway] = useState<number | null>(null);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerShown: true,
      header: () => (
        <NavigationHeader
          MainBack
          CenterText
          range={[0, 100]}
          scrollY={scrollY}
          navigation={navigation}
          title={t('Wallet Recharge')}
        />
      ),
    });
  }, [navigation, scrollY]);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event?.contentOffset?.y;
    },
  });
  const price = [5000000, 10000000, 15000000, 20000000];

  const methods = useForm<AmountSchemaType>({
    resolver: zodResolver(AmountSchema),
    defaultValues: {
      amount: '',
    },
  });

  const STEP_AMOUNT = 1000000;
  const MIN_AMOUNT = 1000000;
  const MAX_AMOUNT = 500000000;

  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [holdInterval, setHoldInterval] = useState<NodeJS.Timer | null>(null);

  // Single press handlers
  const incrementOnce = useCallback(() => {
    const currentAmount = Number(
      methods.getValues('amount')?.replace(/,/g, '') || 0,
    );
    const nextAmount = Math.min(currentAmount + STEP_AMOUNT, MAX_AMOUNT);
    methods.setValue('amount', String(nextAmount));
  }, [methods]);

  const decrementOnce = useCallback(() => {
    const currentAmount = Number(
      methods.getValues('amount')?.replace(/,/g, '') || 0,
    );
    const previousAmount = Math.max(currentAmount - STEP_AMOUNT, MIN_AMOUNT);
    methods.setValue('amount', String(previousAmount));
  }, [methods]);

  const handlePressIn = (increment: boolean) => {
    if (Platform.OS === 'web') return;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        const currentAmount = Number(
          methods.getValues('amount')?.replace(/,/g, '') || 0,
        );
        if (increment) {
          const nextAmount = Math.min(currentAmount + STEP_AMOUNT, MAX_AMOUNT);
          methods.setValue('amount', String(nextAmount));
        } else {
          const previousAmount = Math.max(
            currentAmount - STEP_AMOUNT,
            MIN_AMOUNT,
          );
          methods.setValue('amount', String(previousAmount));
        }
      }, 100);
      setHoldInterval(interval);
    }, 500);
    setPressTimer(timer);
  };

  const handlePressOut = () => {
    if (Platform.OS === 'web') return;
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
    if (holdInterval) {
      clearInterval(holdInterval as NodeJS.Timeout);
      setHoldInterval(null);
    }
  };

  const watchAmount = methods.watch('amount');
  const CreatePayment = useMutation({
    mutationFn: PaymentService.CreatePayment,
    onSuccess(data, variables, context) {
      if (data?.url) {
        navigate('Root', {
          screen: 'WebViewParamsList',
          params: {url: data.url},
        });
      }
    },
  });
  const onSubmit = useCallback<SubmitHandler<AmountSchemaType>>(
    async data => {
      CreatePayment.mutate({
        amount: Number(data.amount),
        description: 'Wallet Recharge',
        gateway: selectedGateway || 1,
        isDeposit: true,
      });
    },
    [CreatePayment, selectedGateway],
  );
  useEffect(() => {
    if (Getways && Getways.length > 0) {
      setSelectedGateway(Getways[0]?.id);
    }
  }, [Getways]);
  // Cleanup effect for timers
  useEffect(() => {
    return () => {
      if (pressTimer) clearTimeout(pressTimer);
      if (holdInterval) clearInterval(holdInterval as NodeJS.Timeout);
    };
  }, [pressTimer, holdInterval]);
  //   <BaseButton
  //   text={`${item.title}\n${formatNumber(item.fromPrice)}﷼\n+${formatNumber(
  //     item.gift,
  //   )} هدیه`}
  //   type={isSelected ? 'Fill' : 'Outline'}
  //   size="Large"
  //   onPress={onSelect}
  //   Extraclass="flex-1"
  //   color="Black"
  //   rounded
  // />
  const PriceButton = memo(
    ({
      item,
      isSelected,
      onSelect,
    }: {
      item: {title: string; fromPrice: number; gift: number};
      isSelected: boolean;
      onSelect: () => void;
    }) => (
      <TouchableOpacity onPress={onSelect} className="w-full relative ">
        <LinearGradient
          colors={['#FED376', isSelected ? '#FED376' : BaseColor]}
          start={Platform.OS === 'web' ? {x: 0, y: 1} : {x: 1, y: -1}}
          locations={[0.0001, 1]}
          style={{
            flex: 1,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View className="flex-1 p-[2px] w-full h-full relative z-10 overflow-hidden ">
            <View className=" flex-1 w-full justify-between items-center px-4 py-3 flex-row overflow-hidden h-full dark:bg-neutral-dark-300/80 bg-neutral-0/80 rounded-[15px]">
              <View className="items-start gap-1.5">
                <View className="flex-row items-center gap-2 ">
                  <BaseText type="body2">{item.title}</BaseText>
                  <View className="flex-row items-center gap-0.5">
                    <BaseText type="body2">
                      {formatNumber(item.fromPrice)}
                    </BaseText>
                    <BaseText type="body3" color="secondary">
                      ﷼
                    </BaseText>
                  </View>
                </View>
                <View className="flex-row items-center gap-2">
                  <BaseText color="supportive2" type="body2">
                    شارژ هدیه :
                  </BaseText>
                  <BaseText color="supportive2" type="body2">
                    {formatNumber(item.gift)} ریال
                  </BaseText>
                </View>
              </View>

              <Gift size="24" variant="Bold" color="#b28bc9" />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    ),
  );
  const {
    handleSubmit,
    control,
    formState: {errors, isValid},
  } = methods;
  return (
    <View style={{flex: 1}}>
      <View className="absolute -top-[25%] web:rotate-[10deg]  web:-left-[30%]  android:-right-[80%] ios:-right-[80%]  opacity-45 w-[600px] h-[600px]">
        <Image
          source={require('../../assets/images/shade/shape/SuccsesShape.png')}
          style={{width: '100%', height: '100%'}}
          resizeMode="contain"
        />
      </View>
      <View className="absolute -top-[20%]  web:-rotate-[25deg] web:-left-[38%] w-[400px] h-[400px] opacity-90">
        <Image
          source={require('../../assets/images/shade/shape/SuccsesShape.png')}
          style={{width: '100%', height: '100%'}}
        />
      </View>
      <Animated.ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{flexGrow: 1}}
        onScroll={scrollHandler}
        scrollEventThrottle={10}
        style={{flex: 1}}>
        <SafeAreaView style={{flex: 1, flexGrow: 1}}>
          <View className="flex-1 pt-[30%]">
            <LinearGradient
              colors={[theme === 'dark' ? '#2A2D33' : '#FFFFFF', BaseColor]}
              locations={[0.1, 0.5]}
              className=""
              style={{
                flex: 1,
                borderTopEndRadius: 24,
                borderTopStartRadius: 24,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <View className="flex-1 p-[1.5px] w-full relative z-10 ">
                <View className="flex-1 w-full Container justify-between pb-4 pt-5 gap-5 dark:bg-neutral-dark-200 bg-neutral-0/20 rounded-t-3xl">
                  <View className="gap-5">
                    <WalletBalance inWallet />
                    <View>
                      <View className="gap-4">
                        <View className="flex-row items-center gap-2">
                          <MoneyRecive
                            size="24"
                            variant="Bold"
                            color="#37C976"
                          />
                          <BaseText type="title3" color="base">
                            {t('Wallet Recharge')}
                          </BaseText>
                        </View>
                        <BaseText type="subtitle2" color="secondary">
                          {t(
                            'Select one of the amounts below or enter your desired amount',
                          )}
                        </BaseText>
                      </View>
                    </View>
                    <View
                      className={
                        walletGift && walletGift.length > 0
                          ? 'gap-4'
                          : 'flex-wrap flex-row justify-between web:h-[120px]'
                      }>
                      {walletGift && walletGift.length > 0
                        ? walletGift?.map((item: any, index: number) => (
                            <View key={item.id}>
                              <PriceButton
                                isSelected={
                                  Number(watchAmount) === item?.fromPrice
                                }
                                onSelect={() =>
                                  methods.setValue(
                                    'amount',
                                    item?.fromPrice?.toString(),
                                  )
                                }
                                item={item}
                              />
                            </View>
                          ))
                        : price.map((item, index) => (
                            <View
                              key={index}
                              style={{width: '49%', marginBottom: 8}}>
                              <BaseButton
                                text={`${formatNumber(item)}﷼`}
                                type={
                                  Number(watchAmount) === item
                                    ? 'Fill'
                                    : 'Outline'
                                }
                                size="Large"
                                onPress={() =>
                                  methods.setValue('amount', item.toString())
                                }
                                Extraclass="flex-1"
                                color="Black"
                                rounded
                              />
                            </View>
                          ))}
                    </View>
                    <BaseText type="title3">مبلغ (ریال)</BaseText>
                    <KeyboardAvoidingView
                      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                      style={{flex: 1}}>
                      <View className="w-full flex-row gap-4 ">
                        <BaseButton
                          onPress={incrementOnce}
                          onPressIn={() => handlePressIn(true)}
                          onPressOut={handlePressOut}
                          type="Outline"
                          size="Large"
                          color="Black"
                          RightIcon={Add}
                          noText
                          Extraclass="w-12 h-12"
                          disabled={Number(watchAmount || 0) >= MAX_AMOUNT}
                        />
                        <FormProvider {...methods}>
                          <View className="flex flex-col gap-4 flex-1">
                            <ControlledInput
                              control={control}
                              name="amount"
                              PlaceHolder={placeholders('amount')}
                              type="text"
                              centerText
                              SperatedNumber
                              accessibilityLabel="amount input field"
                              accessibilityHint="Enter your amount"
                              error={errors.amount?.message}
                            />
                          </View>
                        </FormProvider>
                        <BaseButton
                          onPress={decrementOnce}
                          onPressIn={() => handlePressIn(false)}
                          onPressOut={handlePressOut}
                          type="Outline"
                          size="Large"
                          color="Black"
                          noText
                          disabled={Number(watchAmount || 0) <= MIN_AMOUNT}
                          RightIcon={Minus}
                          Extraclass="w-12 h-12"
                        />
                      </View>
                    </KeyboardAvoidingView>
                    <View className="gap-4">
                      <BaseText type="subtitle2" color="secondary">
                        {t('Select Payment Method')}
                      </BaseText>
                      <FlatList
                        data={Getways}
                        keyExtractor={(item, index) => `key` + index}
                        renderItem={({item}) => (
                          <BaseButton
                            text={item?.title}
                            type={
                              selectedGateway === item?.id ? 'Fill' : 'Outline'
                            }
                            srcLeft={
                              item?.icon
                                ? {uri: item?.icon}
                                : item?.type === 0
                                ? require('../../assets/icons/zarinpal.png')
                                : require('../../assets/icons/payping.png')
                            }
                            size="Large"
                            color="Black"
                            rounded
                            onPress={() => setSelectedGateway(item?.id)}
                          />
                        )}
                        horizontal
                        ListFooterComponent={
                          isLoading ? (
                            <View
                              style={{
                                marginTop: 16,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                flex: 1,
                              }}>
                              <ActivityIndicator size="large" color="#bcdd64" />
                            </View>
                          ) : null
                        }
                        ListEmptyComponent={
                          !isLoading ? (
                            <View className="flex-1 items-center justify-center flex-row py-10">
                              <BaseText
                                type="subtitle1"
                                color="secondary"
                                className="text-center">
                                {t('noGetwayFound')}
                              </BaseText>
                            </View>
                          ) : null
                        }
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{paddingLeft: 16}}
                      />
                    </View>
                  </View>
                  <BaseButton
                    type="Fill"
                    color="Black"
                    size="Large"
                    text={t('Wallet Recharge')}
                    rounded
                    isLoading={CreatePayment.isPending}
                    onPress={handleSubmit(onSubmit)}
                  />
                </View>
              </View>
            </LinearGradient>
          </View>
        </SafeAreaView>
      </Animated.ScrollView>
    </View>
  );
};

export default ChargeWalletScreen;
