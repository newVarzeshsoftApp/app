import React from 'react';
import {FlatList, View} from 'react-native';
import BaseButton from '../../../components/Button/BaseButton';

export type FilterChipItem = {
  id: string | number;
  title: string;
};

interface CategoryListProps<T extends FilterChipItem> {
  data: T[];
  selectedCategory: T;
  onCategorySelect: (item: T) => void;
  itemSpacing?: number;
  listPadding?: number;
  paddingTop?: number;
  paddingBottom?: number;
}

function CategoryList<T extends FilterChipItem>({
  data,
  selectedCategory,
  onCategorySelect,
  itemSpacing = 8,
  listPadding = 20,
  paddingTop = 20,
  paddingBottom = 24,
}: CategoryListProps<T>) {
  return (
    <FlatList
      data={data}
      style={{paddingBottom, paddingTop}}
      keyExtractor={(item, index) => `header-key-${index}`}
      horizontal
      showsHorizontalScrollIndicator={false}
      renderItem={({item}) => (
        <BaseButton
          rounded
          onPress={() => onCategorySelect(item)}
          color="Black"
          type={selectedCategory.id === item.id ? 'Fill' : 'Tonal'}
          text={item.title}
        />
      )}
      scrollEventThrottle={16}
      contentContainerStyle={{paddingHorizontal: listPadding}}
      ItemSeparatorComponent={() => <View style={{width: itemSpacing}} />}
    />
  );
}

export default CategoryList;
