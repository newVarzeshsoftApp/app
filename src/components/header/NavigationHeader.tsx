import React from 'react';
import {Platform, View, Text, StyleSheet} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {ArrowRight2} from 'iconsax-react-native';
import BaseButton from '../Button/BaseButton';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import BaseText from '../BaseText';

type NavigationHeaderProps = {
  navigation: NativeStackNavigationProp<any, any>;
  title?: string;
  onBackPress?: () => void;
};

const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  navigation,
  title = '',
  onBackPress,
}) => {
  const {colors} = useTheme();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      console.warn('Cannot go back!');
    }
  };

  return (
    <SafeAreaView edges={['top']}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: 'trasparent',
          },
        ]}>
        <View style={styles.leftButton}>
          <BaseButton
            onPress={handleBackPress}
            noText
            LeftIcon={ArrowRight2}
            type="Outline"
            color="Black"
            rounded
          />
        </View>
        {title ? (
          <>
            <BaseText type="body3">{title}</BaseText>
          </>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0,
    elevation: 0,
  },
  leftButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
  },
});

export default NavigationHeader;
