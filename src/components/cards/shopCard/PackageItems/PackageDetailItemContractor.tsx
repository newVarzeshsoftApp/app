import React from 'react';
import {Pressable, View} from 'react-native';
import {User} from 'iconsax-react-native';
import BaseText from '../../../BaseText';
import BaseButton from '../../../Button/BaseButton';
import ContractorInfo from '../../../ContractorInfo/ContractorInfo';
import {Contractors} from '../../../../services/models/response/ProductResService';
import {useTranslation} from 'react-i18next';

type PackageDetailItemContractorProps = {
  selectedContractor: Contractors | null;
  onSelectPress: () => void;
  isContractorRequired?: boolean;
};

const PackageDetailItemContractor: React.FC<PackageDetailItemContractorProps> =
  ({selectedContractor, onSelectPress, isContractorRequired = true}) => {
    const {t} = useTranslation('translation', {keyPrefix: 'Shop.Package'});
    const contractorUser = selectedContractor?.contractor;
    const contractorName = contractorUser
      ? `${contractorUser.firstName ?? ''} ${contractorUser.lastName ?? ''}`.trim()
      : '';

    return (
      <View className="pt-3 gap-2 border-t border-neutral-0 dark:border-neutral-dark-400/50">
        <BaseText type="body3" color="secondary">
          {t('contractorSelection')}
          {!isContractorRequired ? ' (اختیاری)' : ''}
        </BaseText>

        {selectedContractor && contractorName ? (
          <View className="flex-row items-center justify-between gap-2">
            <ContractorInfo
              firstName={contractorUser?.firstName}
              lastName={contractorUser?.lastName}
              imageName={contractorUser?.profile?.name}
              gender={contractorUser?.gender}
            />
            <BaseButton
              text={t('changeContractor')}
              type="Outline"
              color="Black"
              size="Small"
              rounded
              onPress={onSelectPress}
            />
          </View>
        ) : (
          <View className="gap-2">
            {isContractorRequired ? (
              <Pressable
                onPress={onSelectPress}
                className="flex-row items-center gap-2 px-3 py-2 rounded-2xl border border-dashed border-warning-500 bg-warning-500/10">
                <User size={18} color="#f59e0b" variant="Bold" />
                <BaseText type="subtitle3" color="warning">
                  {t('contractorNotSelected')}
                </BaseText>
              </Pressable>
            ) : null}
            <BaseButton
              text={t('chooseContractor')}
              type={isContractorRequired ? 'Fill' : 'Outline'}
              color="Black"
              size="Medium"
              rounded
              onPress={onSelectPress}
            />
          </View>
        )}
      </View>
    );
  };

export default PackageDetailItemContractor;
