import React from 'react';
import {FlatList, View} from 'react-native';
import BaseButton from '../../../components/Button/BaseButton';
import {Category} from '../../../services/models/response/CategoryResService';

interface CategoryListProps {
  data: Category[];
  selectedCategory: Category;
  onCategorySelect: (category: Category) => void;

  itemSpacing?: number;
  listPadding?: number;
}

const CategoryList: React.FC<CategoryListProps> = ({
  data,
  selectedCategory,
  onCategorySelect,
  itemSpacing = 8,
  listPadding = 20,
}) => {
  return (
    <FlatList
      data={data}
      style={{paddingBottom: 24, paddingTop: 20}}
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
};

export default CategoryList;
