import React, {useRef, useState, forwardRef, useImperativeHandle} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ListRenderItem,
  FlatList,
} from 'react-native';

const {width} = Dimensions.get('window');

interface DynamicSliderProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
  onIndexChange?: (newIndex: number) => void;
}

export interface DynamicSliderHandle {
  goToNext: () => void;
  goToPrevious: () => void;
}

const DynamicSlider = forwardRef<DynamicSliderHandle, DynamicSliderProps<any>>(
  ({data, renderItem, keyExtractor, onIndexChange}, ref) => {
    const flatListRef = useRef<FlatList<any>>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const handleScroll = (event: any) => {
      const offsetX = event?.nativeEvent?.contentOffset?.x;
      const newIndex = Math.round(offsetX / width);
      onIndexChange?.(newIndex);
      setCurrentIndex(newIndex);
    };

    const goToNext = () => {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToOffset({
        offset: nextIndex * width,
        animated: true,
      });
    };

    const goToPrevious = () => {
      const prevIndex = currentIndex - 1;
      flatListRef.current?.scrollToOffset({
        offset: prevIndex * width,
        animated: true,
      });
    };

    useImperativeHandle(ref, () => ({
      goToNext,
      goToPrevious,
    }));

    return (
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={data}
          keyExtractor={(item, index) => `key` + index}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          renderItem={renderItem}
          onScroll={handleScroll}
          scrollEventThrottle={16}
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
