import React from 'react';
import {Image, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {useProfile} from '../../utils/hooks/useProfile';
import {useGetOrganizationBySKU} from '../../utils/hooks/Organization/useGetOrganizationBySKU';

const ProfilePic: React.FC = () => {
  const {data, isLoading, isSuccess} = useProfile();
  const {data: OrganizationBySKU} = useGetOrganizationBySKU();
  return (
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
          <>
            {data.profile ? (
              <Image
                className="w-[40px] h-[40px] rounded-full"
                source={{
                  uri: OrganizationBySKU?.imageUrl + '/' + data.profile.name,
                }}
              />
            ) : (
              <Image
                className="w-[40px] h-[40px] rounded-full"
                source={{
                  uri: `https://avatar.iran.liara.run/public/${
                    data.gender === 0 ? 'boy' : 'girl'
                  }?username=${data.firstName}`,
                }}
              />
            )}
          </>
        )}
      </View>
    </LinearGradient>
  );
};

export default ProfilePic;
