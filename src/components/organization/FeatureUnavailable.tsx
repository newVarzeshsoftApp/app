import React from 'react';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import BaseText from '../BaseText';
import BaseButton from '../Button/BaseButton';
import {navigate} from '../../navigation/navigationRef';

type FeatureUnavailableProps = {
  message?: string;
  onBack?: () => void;
};

const FeatureUnavailable: React.FC<FeatureUnavailableProps> = ({
  message,
  onBack,
}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Global'});

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    navigate('Root', {
      screen: 'HomeNavigator',
      params: {screen: 'Home'},
    });
  };

  return (
    <View className="flex-1 items-center justify-center px-6 gap-6">
      <BaseText type="title3" className="text-center">
        {message ?? t('featureUnavailable')}
      </BaseText>
      <BaseButton
        type="Fill"
        color="Black"
        size="Large"
        rounded
        text={t('backHome')}
        onPress={handleBack}
      />
    </View>
  );
};

export default FeatureUnavailable;
