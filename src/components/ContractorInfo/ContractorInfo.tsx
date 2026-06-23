import React, {useMemo} from 'react';
import {View, Image} from 'react-native';
import BaseText from '../BaseText';
import {useBase64ImageFromMedia} from '../../utils/hooks/useBase64Image';

interface ContractorInfoProps {
  imageName?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  gender?: number;
}

const ContractorInfo: React.FC<ContractorInfoProps> = ({
  imageName,
  firstName,
  lastName,
  fullName,
  gender,
}) => {
  const displayName =
    fullName?.trim() || [firstName, lastName].filter(Boolean).join(' ').trim();
  const avatarName = firstName || fullName?.split(' ')[0] || displayName;

  const avatarUri = useMemo(() => {
    return `https://avatar.iran.liara.run/public/${
      (gender ?? 0) === 0 ? 'boy' : 'girl'
    }?username=${avatarName}`;
  }, [avatarName, gender]);

  const {data: base64Image} = useBase64ImageFromMedia(imageName, 'Media');

  return (
    <View className="dark:bg-neutral-dark-100 bg-neutral-100 flex-row w-fit gap-2 ios:pr-3 web:pl-3 rounded-full p-1 items-center">
      <View className="h-6 w-6 dark:bg-neutral-dark-200 bg-neutral-200 rounded-full overflow-hidden">
        <Image
          style={{width: 24, height: 24}}
          source={{uri: base64Image ?? avatarUri}}
          resizeMode="cover"
        />
      </View>
      <BaseText type="body3" color="secondary">
        {displayName}
      </BaseText>
    </View>
  );
};

export default ContractorInfo;
