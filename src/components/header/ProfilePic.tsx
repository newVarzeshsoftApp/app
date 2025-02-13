import React from 'react';
import {Image, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {useGetOrganizationBySKU} from '../../utils/hooks/Organization/useGetOrganizationBySKU';
import {useAuth} from '../../utils/hooks/useAuth';

const ProfilePic: React.FC = () => {
  const {profile, isProfileLoading} = useAuth();
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
        {isProfileLoading && (
          <View className="w-[40px] h-[40px] dark:bg-neutral-dark-300 bg-neutral-0 rounded-full animate-pulse"></View>
        )}
        {profile && (
          <>
            {profile.profile ? (
              <Image
                className="w-[40px] h-[40px] rounded-full"
                source={{
                  uri: OrganizationBySKU?.imageUrl + '/' + profile.profile.name,
                }}
              />
            ) : (
              <Image
                className="w-[40px] h-[40px] rounded-full"
                source={{
                  uri: `https://avatar.iran.liara.run/public/${
                    profile.gender === 0 ? 'boy' : 'girl'
                  }?username=${profile.firstName}`,
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
