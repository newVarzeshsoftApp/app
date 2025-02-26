import React, {useMemo} from 'react';
import {View, Image} from 'react-native';
import BaseText from '../BaseText';
import {useGetOrganizationBySKU} from '../../utils/hooks/Organization/useGetOrganizationBySKU';

interface ContractorInfoProps {
  imageName?: string;
  firstName?: string;
  lastName?: string;
  gender?: number;
}

const ContractorInfo: React.FC<ContractorInfoProps> = ({
  imageName,
  firstName,
  lastName,
  gender,
}) => {
  const {data: OrganizationBySKU} = useGetOrganizationBySKU();
  const Avatar = useMemo(
    () =>
      `https://avatar.iran.liara.run/public/${
        (gender ?? 0) === 0 ? 'boy' : 'girl'
      }?username=${firstName}`,
    [],
  );
  return (
    <View className="dark:bg-neutral-dark-100 bg-neutral-100 flex-row w-fit gap-2 ios:pr-3 web:pl-3 rounded-full p-1">
      <View className="h-6 w-6  dark:bg-neutral-dark-200 bg-neutral-200 rounded-full overflow-hidden">
        <Image
          style={{width: 24, height: 24}}
          source={{
            uri: imageName
              ? OrganizationBySKU?.imageUrl + '/' + imageName
              : Avatar,
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
