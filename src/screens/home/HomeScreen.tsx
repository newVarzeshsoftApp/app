import React from 'react';
import {FlatList, View, StyleSheet} from 'react-native';
import {useTheme} from '../../utils/ThemeContext';
import WalletBalance from './components/WalletBalance';
import BaseButton from '../../components/Button/BaseButton';
import MyServise from './components/MyServise';
import InfoCards from '../../components/cards/infoCards/InfoCards';
import {useTranslation} from 'react-i18next';
import {removeTokens} from '../../utils/helpers/tokenStorage';
import {useQueryClient} from '@tanstack/react-query';

const HomeScreen: React.FC = () => {
  const queryClient = useQueryClient();
  const {t} = useTranslation('translation', {keyPrefix: 'Input'});
  const {toggleTheme} = useTheme();

  const handleRemoveTokens = async () => {
    try {
      await removeTokens();
      queryClient.invalidateQueries({queryKey: ['Tokens']});
      console.log('Tokens removed');
    } catch (error) {
      console.error('Error removing tokens:', error);
    }
  };

  const renderHeader = () => (
    <View className="Container py-5 web:pt-[85px] gap-5">
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
    </View>
  );

  return (
    <FlatList
      data={[]} // Pass empty data since the main list is in `MyServise`
      renderItem={null}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={
        <View className="flex-1 pb-32  Container  web:pb-[200px]">
          <MyServise />
        </View>
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

export default HomeScreen;
