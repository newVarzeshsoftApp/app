import React, {useMemo} from 'react';
import {View, ActivityIndicator, Image} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {useAuth} from '../../utils/hooks/useAuth';
import {useBase64ImageFromMedia} from '../../utils/hooks/useBase64Image';

const ProfilePic: React.FC = () => {
  const {profile, isProfileLoading} = useAuth();

  const imageName = profile?.profile?.name;
  const gender = profile?.gender ?? 0;
  const firstName = profile?.firstName ?? '';

  const fallbackAvatar = useMemo(
    () =>
      `https://avatar.iran.liara.run/public/${
        gender === 0 ? 'boy' : 'girl'
      }?username=${firstName}`,
    [gender, firstName],
  );

  const {data: base64Image, isLoading} = useBase64ImageFromMedia(
    imageName,
    'Media',
  );

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
      <View className="w-[44px] h-[44px] rounded-full dark:bg-neutral-dark-300 bg-neutral-0 justify-center items-center overflow-hidden">
        {isProfileLoading || isLoading ? (
          <View className="w-[40px] h-[40px] dark:bg-neutral-dark-300 bg-neutral-0 rounded-full animate-pulse" />
        ) : (
          <Image
            source={{uri: base64Image ?? fallbackAvatar}}
            style={{width: 40, height: 40, borderRadius: 999}}
            resizeMode="cover"
          />
        )}
      </View>
    </LinearGradient>
  );
};

export default ProfilePic;
