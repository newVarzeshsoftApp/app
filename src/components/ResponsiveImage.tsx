import React from 'react';
import {
  Image,
  ImageProps,
  Dimensions,
  ActivityIndicator,
  View,
} from 'react-native';
import {SrcSet} from '../services/models/response/OrganizationResServise';
import {IMAGE_TYPE} from '../models/props';
import {useBase64ImageFromMedia} from '../utils/hooks/useBase64Image';

type ResponsiveImageProps = {
  customSource?: SrcSet;
  ImageType: IMAGE_TYPE;
  fallback?: any; // Fallback for local assets
} & ImageProps;

const getBestImageFromSource = (
  customSource: SrcSet | undefined,
): string | undefined => {
  if (!customSource || Object.keys(customSource).length === 0) {
    console.warn('customSource is empty or undefined. Using fallback image.');
    return undefined;
  }

  const {width: screenWidth} = Dimensions.get('window');

  if (customSource['default']) {
    return customSource['default'];
  }

  const sortedKeys = Object.keys(customSource)
    .filter(key => !isNaN(parseInt(key)))
    .sort((a, b) => parseInt(a) - parseInt(b));

  const bestMatch = sortedKeys.find(key => parseInt(key) >= screenWidth);

  return bestMatch
    ? customSource[bestMatch]
    : customSource[sortedKeys[sortedKeys.length - 1]];
};

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  customSource,
  fallback,
  ImageType,
  ...props
}) => {
  const selected = getBestImageFromSource(customSource);

  const {data: base64Image, isLoading} = useBase64ImageFromMedia(
    selected,
    ImageType,
  );

  const imageSource = base64Image ? {uri: base64Image} : fallback;

  if (isLoading && !base64Image && !fallback) {
    return (
      <View
        style={[
          {
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Image
      style={{
        width: '100%',
        height: '100%',
      }}
      source={imageSource}
      {...props}
    />
  );
};

export default ResponsiveImage;
