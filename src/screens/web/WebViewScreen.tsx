import React, {useEffect} from 'react';
import {ActivityIndicator, Platform, View} from 'react-native';
import WebView from 'react-native-webview';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {DrawerStackParamList} from '../../utils/types/NavigationTypes';

type WebViewScreenProps = NativeStackScreenProps<
  DrawerStackParamList,
  'WebViewParamsList'
>;

const WebViewScreen: React.FC<WebViewScreenProps> = ({route, navigation}) => {
  useEffect(() => {
    if (Platform.OS === 'web') {
      window.location.replace(route.params.url);
    }
  }, [route.params.url]);

  if (Platform.OS === 'web') {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#bcdd64" />
      </View>
    );
  }

  return (
    <View style={{flex: 1}}>
      <WebView
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        scalesPageToFit={true}
        mixedContentMode="compatibility"
        source={{uri: route.params.url}}
      />
    </View>
  );
};

export default WebViewScreen;
