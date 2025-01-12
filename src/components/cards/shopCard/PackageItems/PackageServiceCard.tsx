import {FlashCircle} from 'iconsax-react-native';
import React from 'react';
import {Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import BaseText from '../../../BaseText';
import {formatNumber} from '../../../../utils/helpers/helpers';
import {subProducts} from '../../../../services/models/response/UseResrService';
import {useTheme} from '../../../../utils/ThemeContext';
type ServiceCardProps = {
  data: subProducts;
};
const PackageServiceCard: React.FC<ServiceCardProps> = ({data}) => {
  const {theme} = useTheme();
  const BaseHighlight = theme === 'dark' ? '#55575c' : '#FFFFFF';

  return (
    <LinearGradient
      colors={[BaseHighlight, BaseHighlight, '#2a2d33']}
      locations={[0, 0, 1]}
      start={{x: 1, y: 0}}
      style={{
        height: 80,
        width: '100%',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <View className="flex-1 p-[1px] w-full  relative z-10 overflow-hidden ">
        <View className="flex-1 Container  py-4 px-5 w-[180px] dark:bg-neutral-dark-300 bg-neutral-0/20 rounded-3xl gap-3">
          <View className="flex-row gap-1 z-10">
            <BaseText
              type="title4"
              color="base"
              className="truncate max-w-[180px]">
              {data.product?.title ?? ''}
            </BaseText>
          </View>
          <View className="flex-row gap-1 z-10">
            <BaseText
              type="title4"
              color="secondary"
              className="truncate max-w-[180px]">
              {data.price?.duration} جلسه
            </BaseText>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

export default PackageServiceCard;
