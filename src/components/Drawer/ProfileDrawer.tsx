import React from 'react';
import {Image, Text, View} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import BaseText from '../BaseText';
import {ArrowLeft2} from 'iconsax-react-native';
import ProfilePic from '../header/ProfilePic';
import {useAuth} from '../../utils/hooks/useAuth';

const ProfileDrawer: React.FC = () => {
  const {profile} = useAuth();

  return (
    <View className="w-full h-[100px] relative  overflow-hidden rounded-3xl">
      {/* Shadow */}
      <View className="w-[300px] h-[300px] z-[1] -bottom-[70px] web:-left-[24%] -left-[64%] absolute opacity-90 ">
        <Image
          source={require('../../assets/images/shade/shape/GreenShade.png')}
          resizeMode="contain"
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </View>
      <View className="w-[300px] h-[300px] z-[1] -top-[0%] web:-left-[20%] -left-[64%] absolute opacity-60 ">
        <Image
          source={require('../../assets/images/shade/shape/SecondaryShade.png')}
          resizeMode="contain"
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </View>
      <View className="w-[300px] h-[300px] z-[1] -top-16 web:-right-[35%] -right-[64%] rotate-180 absolute opacity-50 ">
        <Image
          source={require('../../assets/images/shade/shape/GreenShade.png')}
          resizeMode="contain"
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </View>
      <View className="w-full h-full justify-between  dark:bg-neutral-dark-300/80 backdrop-blur-xl bg-neutral-0/80 flex-row items-center px-6 ">
        <View className="flex-row gap-4">
          <ProfilePic />
          <View className="gap-1 items-start">
            <BaseText type="title4">
              {profile?.firstName} {profile?.lastName}
            </BaseText>
            <BaseText type="subtitle2" color="muted">
              {profile?.email || profile?.mobile}
            </BaseText>
          </View>
        </View>
        <ArrowLeft2 size="20" color="#7F8185" />
      </View>
    </View>
  );
};

export default ProfileDrawer;
