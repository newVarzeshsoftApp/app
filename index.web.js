import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';
import App from './App';
import './global.css';
import './i18n.config';
import 'react-native-reanimated';

import {enableLegacyWebImplementation} from 'react-native-gesture-handler';
if (module.hot) {
  module.hot.accept();
}
enableLegacyWebImplementation(true);
AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, {
  initialProps: {},
  rootTag: document.getElementById('app-root'),
});
