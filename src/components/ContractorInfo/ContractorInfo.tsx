import React from 'react';
import {View, Image} from 'react-native';
import BaseText from '../BaseText';
import {useGetOrganizationBySKU} from '../../utils/hooks/Organization/useGetOrganizationBySKU';

interface ContractorInfoProps {
  imageName?: string;
  firstName?: string;
  lastName?: string;
}

const ContractorInfo: React.FC<ContractorInfoProps> = ({
  imageName,
  firstName,
  lastName,
}) => {
  const {data: OrganizationBySKU} = useGetOrganizationBySKU();

  return (
    <View className="dark:bg-neutral-dark-100 bg-neutral-100 flex-row w-fit gap-2 ios:pr-3 web:pl-3 rounded-full p-1">
      <View className="h-6 w-6  rounded-full overflow-hidden">
        <Image
          style={{width: 24, height: 24}}
          source={{
            uri: OrganizationBySKU?.imageUrl + '/' + imageName,
          }}
        />
      </View>
      <BaseText type="body3" color="secondary">
        {firstName} {lastName}
      </BaseText>
    </View>
  );
};

export default ContractorInfo;
