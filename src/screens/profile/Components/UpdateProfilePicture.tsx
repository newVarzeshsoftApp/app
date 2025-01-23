import React, {useCallback} from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {useProfile} from '../../../utils/hooks/useProfile';
import {useGetOrganizationBySKU} from '../../../utils/hooks/Organization/useGetOrganizationBySKU';
import * as ImagePicker from 'react-native-image-picker';
import {Edit2} from 'iconsax-react-native';

const UpdateProfilePicture: React.FC = () => {
  const {data, isLoading} = useProfile();
  const {data: OrganizationBySKU} = useGetOrganizationBySKU();
  const [response, setResponse] = React.useState<any>(null);
  const SelectImage = useCallback(() => {
    ImagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 0,
        includeBase64: false,
        includeExtra: true,
      },
      setResponse,
    );
  }, []);
  //   const uploadImageToBackend = useCallback(async (imageUri: string) => {
  //     try {
  //       const formData = new FormData();
  //       formData.append('file', {
  //         uri: imageUri,
  //         type: 'image/jpeg', // You can dynamically check the mime type if needed
  //         name: 'profile.jpg',
  //       });

  //       // Replace with your backend upload URL
  //       const response = await axios.post('YOUR_BACKEND_URL', formData, {
  //         headers: {
  //           'Content-Type': 'multipart/form-data',
  //           // Add authentication token if necessary
  //           'Authorization': `Bearer YOUR_AUTH_TOKEN`,
  //         },
  //       });

  //       if (response.status === 200) {
  //         console.log('Image uploaded successfully', response.data);
  //         // Optionally, update the user's profile with the uploaded image URL
  //       } else {
  //         console.log('Image upload failed', response);
  //       }
  //     } catch (error) {
  //       console.error('Error uploading image:', error);
  //     }
  //   }, []);

  //   // Handle image selection and upload
  //   const handleImageSelect = useCallback(() => {
  //     if (response?.assets?.[0]?.uri) {
  //       uploadImageToBackend(response.assets[0].uri); // Upload the selected image
  //     }
  //   }, [response, uploadImageToBackend]);
  return (
    <View className="justify-center items-center">
      <TouchableOpacity
        onPress={SelectImage}
        className="w-[100px] h-[100px] rounded-full bg-neutral-500 relative">
        {(data?.profile || response?.assets) && (
          <Image
            className="w-full h-full rounded-full"
            source={{
              uri: response?.assets
                ? response?.assets[0].uri
                : OrganizationBySKU?.imageUrl + '/' + data?.profile?.name,
            }}
          />
        )}
        <View className="bg-primary-500 p-1 rounded-full border-2 border-neutral-100  dark:border-neutral-dark-100 absolute bottom-0">
          <Edit2 color="white" size={16} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default UpdateProfilePicture;
