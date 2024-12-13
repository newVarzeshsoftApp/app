import React, {useRef, useState, forwardRef} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  ListRenderItem,
  I18nManager,
} from 'react-native';

const {width} = Dimensions.get('window');

interface DynamicSliderProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
}

const DynamicSlider = forwardRef<{}, DynamicSliderProps<any>>(
  ({data, renderItem, keyExtractor}, ref) => {
    const flatListRef = useRef<FlatList<any>>(null);
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    const handleScroll = (event: any) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const scrolledIndex = Math.round(offsetX / width);
      const newIndex = I18nManager.isRTL
        ? data.length - 1 - scrolledIndex
        : scrolledIndex;
      setCurrentIndex(newIndex);
    };

    return (
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={data}
          keyExtractor={keyExtractor}
          horizontal
          pagingEnabled
          inverted={I18nManager.isRTL}
          showsHorizontalScrollIndicator={false}
          renderItem={renderItem}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{
            flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
          }}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default DynamicSlider;
