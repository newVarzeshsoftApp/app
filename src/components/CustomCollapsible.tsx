import React from 'react';
import {Collapse} from 'react-collapse';
import {Platform, Text, View} from 'react-native';
import Collapsible from 'react-native-collapsible';
type CustomCollapsibleProps = {
  children: React.ReactNode;
  isOpened: boolean;
};
const CustomCollapsible: React.FC<CustomCollapsibleProps> = ({
  children,
  isOpened,
}) => {
  return Platform.OS === 'web' ? (
    <Collapse isOpened={isOpened}>{children}</Collapse>
  ) : (
    <Collapsible collapsed={isOpened}>{children}</Collapsible>
  );
};

export default CustomCollapsible;
