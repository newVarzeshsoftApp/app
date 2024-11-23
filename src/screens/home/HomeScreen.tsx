import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {removeTokens} from '../../utils/helpers/tokenStorage';
import {useQueryClient} from '@tanstack/react-query';
import {useProfile} from '../../utils/hooks/useProfile';
import WalletBalance from './components/WalletBalance';
import {useTheme} from '../../utils/ThemeContext';
import {useTranslation} from 'react-i18next';
import InfoCards from '../../components/cards/InfoCards';
import BaseButton from '../../components/Button/BaseButton';

const HomeScreen: React.FC = () => {
  const queryClient = useQueryClient();
  const {t} = useTranslation('translation', {keyPrefix: 'Input'});
  const {data, isSuccess} = useProfile();
  const handleRemoveTokens = async () => {
    try {
      await removeTokens();
      queryClient.invalidateQueries({queryKey: ['Tokens']});
      console.log('Tokens removed');
    } catch (error) {
      console.error('Error removing tokens:', error);
    }
  };
  const {toggleTheme} = useTheme();
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}>
      <View className="Container py-5 pb-32  web:pb-[200px] gap-5  ">
        <BaseButton
          color="Primary"
          type="Fill"
          rounded
          text="Logout"
          onPress={handleRemoveTokens}
        />
        <BaseButton
          color="Black"
          type="Outline"
          rounded
          text="Change Theme"
          onPress={toggleTheme}
        />
        <View className="w-full h-[210px] rounded-3xl bg-primary-500/10"></View>
        <WalletBalance />
        <View className="flex-row items-center justify-center gap-4">
          <View className="gap-4 flex-1">
            <InfoCards type="MembershipInfo" />
            <InfoCards type="ClosetInfo" />
          </View>
          <View className="gap-4 flex-1">
            <InfoCards type="InsuranceInfo" />
            <InfoCards type="BMIInfo" />
          </View>
        </View>

        {/* <Text>Home Screen</Text> */}
        {/* <BaseButton
        color="Primary"
        type="Fill"
        text="Remove Tokens"
        onPress={handleRemoveTokens}
      /> */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({});

export default HomeScreen;
