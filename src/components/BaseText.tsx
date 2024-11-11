import React from 'react';
import {Text} from 'react-native';
import {IText} from '../models/props';
import {useTheme} from '../utils/ThemeContext';
import {useTranslation} from 'react-i18next';

function BaseText({
  children,
  type = 'body1',
  color = 'base',
}: IText): JSX.Element {
  const {theme} = useTheme();
  const {i18n} = useTranslation();

  function getTextClass(
    type: string,
    theme: string | undefined,
    color: string | undefined,
    language: string,
  ) {
    const baseTypeClass = language === 'fa' ? type : `en_${type}`;
    const colorClass =
      theme === 'light' ? `text-text-${color}` : `text-text-${color}-dark`;
    return `${baseTypeClass} ${colorClass}`;
  }

  return (
    <Text className={getTextClass(type, theme, color, i18n.language)}>
      {children}
    </Text>
  );
}

export default BaseText;
