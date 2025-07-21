import React, {useEffect, useRef, useState} from 'react';
import {
  FlatList,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {BannerContent} from '../services/models/response/AdsResService';
import {useBase64ImageFromMedia} from '../utils/hooks/useBase64Image';

const {width} = Dimensions.get('window');
const ITEM_WIDTH = width - 40;

interface BannerSliderProps {
  data: BannerContent[];
}

const BannerImage: React.FC<{name?: string}> = ({name}) => {
  const {data: base64Image, isLoading} = useBase64ImageFromMedia(name, 'Media');

  if (!base64Image && isLoading) {
    return (
      <View className="w-full h-[150px] rounded-lg bg-black/20 dark:bg-white/20 animate-pulse" />
    );
  }

  return (
    <View className="w-full h-[150px] rounded-lg overflow-hidden bg-white/10 dark:bg-neutral-dark-300">
      {base64Image && (
        <Image
          source={{uri: base64Image}}
          style={{width: '100%', height: '100%'}}
          resizeMode="cover"
        />
      )}
    </View>
  );
};

const BannerSlider: React.FC<BannerSliderProps> = ({data}) => {
  const handlePress = (link: string) => {
    if (link?.startsWith('http')) {
      Linking.openURL(link).catch(err => {
        console.warn('Could not open URL:', err);
      });
    }
  };

  const renderItem = ({item}: {item: BannerContent}) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => handlePress(item.link)}
      style={{width: ITEM_WIDTH}}>
      <BannerImage name={item.profile?.name} />
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={data}
      horizontal
      pagingEnabled
      decelerationRate="fast"
      snapToInterval={ITEM_WIDTH}
      snapToAlignment="center"
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item, index) => `banner-${index}`}
      renderItem={renderItem}
      scrollEventThrottle={16}
    />
  );
};

export default BannerSlider;
