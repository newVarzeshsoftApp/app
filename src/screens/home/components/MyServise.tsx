import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import BaseText from '../../../components/BaseText';
import {useTranslation} from 'react-i18next';
import {ArrowUp} from 'iconsax-react-native';
import ChargeableServiceCard from '../../../components/cards/Service/ChargeableServiceCard';

function MyServise() {
  const {t} = useTranslation('translation', {keyPrefix: 'Home'});

  return (
    <View className="flex-1 gap-4">
      <View className="w-full items-center flex-row justify-between">
        <BaseText type="title3" color="secondary">
          {t('myService')}
        </BaseText>
        <TouchableOpacity className="flex-row gap-1 items-center ">
          <BaseText type="title3" color="secondary">
            {t('all')}
          </BaseText>
          <View className="-rotate-45">
            <ArrowUp size="24" color="#55575c" />
          </View>
        </TouchableOpacity>
      </View>
      <ChargeableServiceCard />
    </View>
  );
}

export default MyServise;
