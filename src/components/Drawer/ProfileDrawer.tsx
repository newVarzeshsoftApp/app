import React from 'react';
import {Image, Text, View} from 'react-native';

import {useProfile} from '../../utils/hooks/useProfile';
import LinearGradient from 'react-native-linear-gradient';
import BaseText from '../BaseText';
import {ArrowLeft2} from 'iconsax-react-native';

const ProfileDrawer: React.FC = () => {
  const {data, isLoading, isSuccess} = useProfile();

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
          <LinearGradient
            colors={['#7676EE', '#9191F1', '#C9E483', '#BCDD64']}
            start={{x: 1, y: 1}}
            locations={[0, 0.3, 1]}
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View className="w-[44px] h-[44px] rounded-full dark:bg-neutral-dark-300 bg-neutral-0 justify-center items-center">
              {isLoading && (
                <View className="w-[40px] h-[40px] dark:bg-neutral-dark-300 bg-neutral-0 rounded-full animate-pulse"></View>
              )}
              {isSuccess && (
                <Image
                  className="w-[40px] h-[40px] rounded-full"
                  source={{
                    uri: `https://avatar.iran.liara.run/public/${
                      data.gender === 0 ? 'boy' : 'girl'
                    }?username=${data.firstName}`,
                  }}
                />
              )}
            </View>
          </LinearGradient>
          <View className="gap-1 items-start">
            <BaseText type="title4">
              {data?.firstName} {data?.lastName}
            </BaseText>
            <BaseText type="subtitle2" color="muted">
              {data?.email || data?.mobile}
            </BaseText>
          </View>
        </View>
        <ArrowLeft2 size="20" color="#7F8185" />
      </View>
    </View>
  );
};

export default ProfileDrawer;
