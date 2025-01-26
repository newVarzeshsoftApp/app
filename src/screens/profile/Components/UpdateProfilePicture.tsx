import React, {useCallback} from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useProfile} from '../../../utils/hooks/useProfile';
import {useGetOrganizationBySKU} from '../../../utils/hooks/Organization/useGetOrganizationBySKU';
import * as ImagePicker from 'react-native-image-picker';
import {Edit2} from 'iconsax-react-native';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import UserService from '../../../services/UserService';

const UpdateProfilePicture: React.FC = () => {
  const {data, isLoading} = useProfile();
  const {data: OrganizationBySKU} = useGetOrganizationBySKU();
  const [response, setResponse] = React.useState<any>(null);

  const queryClient = useQueryClient();

  const UploadProfile = useMutation({
    mutationFn: UserService.UploadAvatar,
    onSuccess(data, variables, context) {
      if (data) {
        queryClient.invalidateQueries({queryKey: ['Profile']});
      }
    },
  });
  const SelectImage = useCallback(() => {
    ImagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
        includeBase64: false,
      },
      async res => {
        if (!res.didCancel && res.assets) {
          try {
            let imageUri = res.assets[0].uri;
            if (Platform.OS === 'ios') {
              imageUri = imageUri?.replace('file://', '');
            }
            if (!imageUri) {
              throw new Error('Invalid image URI');
            }
            const response = await fetch(imageUri);
            const blob = await response.blob();

            const formData = new FormData();
            formData.append(
              'file',
              blob,
              res.assets[0].fileName || 'profile.jpg',
            );
            UploadProfile.mutate(formData);
          } catch (error) {
            console.error('Image upload failed:', error);
          }
        }
      },
    );
  }, []);
  return (
    <View className="justify-center items-center">
      <TouchableOpacity
        onPress={SelectImage}
        className="w-[100px] h-[100px] rounded-full bg-neutral-500 relative">
        {UploadProfile.isPending ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="small" color="#bcdd64" />
          </View>
        ) : (
          (data?.profile || response?.assets) && (
            <Image
              className="w-full h-full rounded-full"
              source={{
                uri: OrganizationBySKU?.imageUrl + '/' + data?.profile?.name,
              }}
            />
          )
        )}
        <View className="bg-primary-500 p-1 rounded-full border-2 border-neutral-100  dark:border-neutral-dark-100 absolute bottom-0">
          <Edit2 color="white" size={16} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default UpdateProfilePicture;
