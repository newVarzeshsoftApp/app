import React from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';

function ChargeableServiceCard() {
  const {t} = useTranslation('translation', {keyPrefix: 'Home'});

  return (
    <View className="dark:bg-neutral-dark-300/50 bg-neutral-0/50 border w-full  p-4 rounded-3xl  border-neutral-0 dark:border-neutral-dark-400/50"></View>
  );
}

export default ChargeableServiceCard;
