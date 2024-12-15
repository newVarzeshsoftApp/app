import React, {useEffect, useLayoutEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
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
import {MoneyRecive} from 'iconsax-react-native';
import BaseText from '../../components/BaseText';
import BaseButton from '../../components/Button/BaseButton';
import {formatNumber} from '../../utils/helpers/helpers';
import ControlledInput from '../../components/Input/ControlledInput';
import {FormProvider, SubmitHandler, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {AmountSchema, AmountSchemaType} from '../../utils/validation/amount';
type WalletScreenProps = NativeStackScreenProps<
  WalletStackParamList,
  'ChargeWalletScreen'
>;
const ChargeWalletScreen: React.FC<WalletScreenProps> = ({
  navigation,
  route,
}) => {
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
  const scrollY = useSharedValue(0);
  const {theme} = useTheme();
  const BaseColor = theme === 'dark' ? '#232529' : 'rgba(244,244,245,0.3)';
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerShown: true,
      header: () => (
        <NavigationHeader
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
      scrollY.value = event.contentOffset.y;
    },
  });
  const price = [40000000, 80000000, 200000000, 300000000];
  const [Amount, setAmount] = useState(price[0]);
  const onSubmit: SubmitHandler<AmountSchemaType> = async data => {};

  const methods = useForm<AmountSchemaType>({
    resolver: zodResolver(AmountSchema),
    defaultValues: {
      amount: '',
    },
  });
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
                    <View className="flex-wrap flex-row justify-between web:h-[120px]">
                      {price.map((item, index) => (
                        <View
                          key={index}
                          style={{width: '49%', marginBottom: 8}}>
                          <BaseButton
                            text={formatNumber(item)}
                            type={item === Amount ? 'Fill' : 'Outline'}
                            size="Large"
                            onPress={() => setAmount(item)}
                            Extraclass="flex-1"
                            color="Black"
                            rounded
                          />
                        </View>
                      ))}
                    </View>

                    <KeyboardAvoidingView
                      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                      style={{flex: 1}}>
                      <View className="w-full flex flex-col gap-9 ">
                        <FormProvider {...methods}>
                          <View className="flex flex-col gap-4">
                            <ControlledInput
                              control={control}
                              name="amount"
                              label={Input('amount')}
                              PlaceHolder={placeholders('amount')}
                              type="text"
                              accessibilityLabel="amount input field"
                              accessibilityHint="Enter your amount"
                              error={errors.amount?.message}
                            />
                          </View>
                        </FormProvider>
                      </View>
                    </KeyboardAvoidingView>
                  </View>
                  <BaseButton
                    type="Fill"
                    color="Black"
                    size="Large"
                    text={t('Wallet Recharge')}
                    rounded
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
