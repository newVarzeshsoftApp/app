import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';
import App from './App';
// import 'nativewind/tailwind.css';
import './global.css';
import './i18n.config';
if (module.hot) {
  module.hot.accept();
}
AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, {
  initialProps: {},
  rootTag: document.getElementById('app-root'),
});
