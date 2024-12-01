import React from 'react';
import {Image, ImageProps, Dimensions} from 'react-native';
import {SrcSet} from '../services/models/response/OrganizationResServise';

type ResponsiveImageProps = {
  customSource?: SrcSet;
  fallback?: any; // Fallback for local assets
} & ImageProps;

const getBestImageFromSource = (
  customSource: SrcSet | undefined,
  fallback: any,
): string | undefined => {
  if (!customSource || Object.keys(customSource).length === 0) {
    console.warn('customSource is empty or undefined. Using fallback image.');
    return undefined; // Use fallback if customSource is invalid
  }

  const {width: screenWidth} = Dimensions.get('window');

  // Check for the `default` key
  if (customSource['default']) {
    return customSource['default'];
  }

  // Filter numeric keys and sort them
  const sortedKeys = Object.keys(customSource)
    .filter(key => !isNaN(parseInt(key))) // Include only numeric keys
    .sort((a, b) => parseInt(a) - parseInt(b));

  const bestMatch = sortedKeys.find(key => parseInt(key) >= screenWidth);

  return bestMatch
    ? customSource[bestMatch]
    : customSource[sortedKeys[sortedKeys.length - 1]];
};

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  customSource,
  fallback,
  ...props
}) => {
  const selectedImage = getBestImageFromSource(customSource, fallback);

  const imageSource = selectedImage
    ? {uri: process.env.IMAGE_BASE_URL + '/' + selectedImage}
    : fallback;

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
