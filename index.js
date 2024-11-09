import 'intl-pluralrules';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import './global.css';
import './i18n.config';
AppRegistry.registerComponent(appName, () => App);
