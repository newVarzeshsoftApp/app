import React, {useState} from 'react';
import {Text, TouchableOpacity, View, StyleSheet} from 'react-native';
import BaseText from './BaseText';

interface TruncatedTextProps {
  text: string | null; // The full text to be displayed
  moreText?: string; // The text for the "more" button
  onPressMore?: () => void; // Optional callback for when "more" is pressed
  length?: number; // Optional length of the truncated text
}

export const TruncatedText: React.FC<TruncatedTextProps> = ({
  text,
  moreText,
  onPressMore,
  length = 80,
}) => {
  const toggleExpand = () => {
    if (onPressMore) {
      onPressMore();
    }
  };

  const truncatedText = text?.slice(0, length); // Adjust for desired character limit
  const HaveMore = text ? text.length > length : false;
  return (
    <View>
      <BaseText type="body3" color="secondary">
        {truncatedText}
        {HaveMore && moreText && (
          <TouchableOpacity onPress={toggleExpand}>
            <BaseText type="body3" color="secondaryPurple">
              {' '}
              ...{moreText}
            </BaseText>
          </TouchableOpacity>
        )}
      </BaseText>
    </View>
  );
};
