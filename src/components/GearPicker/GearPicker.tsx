import React, {useState} from 'react';
import {IWheelProps} from '../../models/props';
import {Picker} from '@react-native-picker/picker';
const BasePicker = ({items, onSelect, initialIndex}: IWheelProps) => {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  return (
    <Picker
      selectedValue={initialIndex}
      onValueChange={(itemValue: any, itemIndex) => {
        onSelect(itemValue);
        setSelectedIndex(itemIndex);
      }}>
      {items.map((item, index) => (
        <Picker.Item key={index} label={item.label} value={item.value} />
      ))}
    </Picker>
  );
};

export default BasePicker;
